import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import Header from "../components/Header";
import { useProductos } from "../hooks/useProductos";
import { usePedido } from "../hooks/usePedido";
import { useUsuario } from "../hooks/useUsuario";
import { crearDireccion, listarMisDirecciones } from "../services/direccionEnvio";
import { listarCiudades, listarPaises, listarRegiones } from "../services/catalogo";
import { crearPedido, editarPedido } from "../services/pedido";
import {
  calcularLinea,
  formatearMonto,
  sumarTotales,
  validarLinea,
  lineaTieneErrores,
  type EstadoConPedido,
  type EstadoDesdeCarrito,
  type EstadoPostPago,
} from "../ts/pedidoReglas";
import type {
  Ciudad,
  CreatePedido,
  DireccionEnvio,
  Pais,
  PedidoItem,
  Producto,
  Region,
  UpdatePedido,
} from "../ts/interfaces";
import "../styles/pedidos.css";

/** Valores de una línea en el formulario, con clave estable para React. */
interface LineaForm {
  key: string;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  descuento_pct: number;
}

const nuevaLinea = (): LineaForm => ({
  key: crypto.randomUUID(),
  producto_id: 0,
  cantidad: 1,
  precio_unitario: 0,
  descuento_pct: 0,
});

/** Extrae el índice de línea de un mensaje del backend ("La línea 2 …"). */
function indiceDeLineaEnMensaje(mensaje: string): number | null {
  const m = /l[ií]nea\s+(\d+)/i.exec(mensaje);
  return m ? Number(m[1]) : null;
}

/**
 * Formulario de creación/edición de pedidos.
 *
 * La edición solo aplica a pedidos en BORRADOR (el backend lo exige); si el
 * pedido está en otro estado, se redirige a la vista de detalle. Los totales
 * que se ven aquí son PREVISUALIZACIÓN: el backend recalcula y es la fuente de
 * verdad.
 *
 * Flujo de compra: `Carrito.tsx` manda acá con `EstadoDesdeCarrito` para
 * crear el pedido (con la dirección de envío) antes de pagar; al guardar se
 * continúa a `Pago.tsx`. `EstadoPostPago` es un respaldo del flujo anterior,
 * por si se llega a `/byte&buy/pago` sin haber creado antes el pedido.
 */
export default function PedidoForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const pedidoId = id ? Number(id) : undefined;
  const esEdicion = pedidoId !== undefined;

  // El estado de navegación tiene dos orígenes posibles (nunca ambos a la
  // vez): `Carrito.tsx` al iniciar la compra (precarga las líneas con el
  // carrito y, al guardar, continúa a `Pago`), o `Pago.tsx` como respaldo
  // cuando se llega acá sin pedido creado (precarga con lo ya pagado y, al
  // guardar, va a la factura). Se distinguen por `facturaId`.
  const estadoNavegacion = !esEdicion
    ? (location.state as (EstadoPostPago | EstadoDesdeCarrito) | null)
    : null;
  const estadoPostPago = (
    estadoNavegacion && "facturaId" in estadoNavegacion
      ? estadoNavegacion
      : null
  ) as EstadoPostPago | null;
  const estadoDesdeCarrito =
    estadoNavegacion && !estadoPostPago
      ? (estadoNavegacion as EstadoDesdeCarrito)
      : null;
  const itemsPrecargados = estadoPostPago?.items ?? estadoDesdeCarrito?.items ?? null;

  const { usuario } = useUsuario();
  const { productosCompletos } = useProductos();
  const { pedido, loading: cargandoPedido } = usePedido(pedidoId);

  const [direcciones, setDirecciones] = useState<DireccionEnvio[]>([]);

  // --- Formulario de nueva dirección de envío --------------------------------
  const [mostrarNuevaDireccion, setMostrarNuevaDireccion] = useState(false);
  const [paises, setPaises] = useState<Pais[]>([]);
  const [regiones, setRegiones] = useState<Region[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [nuevaDireccion, setNuevaDireccion] = useState({
    pais_id: 0,
    region_id: 0,
    ciudad_id: 0,
    direccion_destinatario: "",
    direccion_telefono: "",
    direccion_calle: "",
    direccion_referencia: "",
    direccion_codigo_postal: "",
  });
  const [guardandoDireccion, setGuardandoDireccion] = useState(false);
  const [errorDireccion, setErrorDireccion] = useState("");

  const [pedidoFecha, setPedidoFecha] = useState(
    () => new Date().toISOString().slice(0, 10),
  );
  const [notas, setNotas] = useState(() =>
    estadoPostPago
      ? `Pedido informativo: la compra ya fue pagada y facturada (factura ${estadoPostPago.facturaNumero}). No confirmar este pedido: el stock de estos productos ya se descontó al pagar.`
      : "",
  );
  const [direccionId, setDireccionId] = useState<number>(0);
  const [lineas, setLineas] = useState<LineaForm[]>(() =>
    itemsPrecargados && itemsPrecargados.length > 0
      ? itemsPrecargados.map((it) => ({
          key: crypto.randomUUID(),
          producto_id: it.producto_id,
          cantidad: it.cantidad,
          precio_unitario: it.precio_unitario,
          descuento_pct: it.descuento_pct,
        }))
      : [nuevaLinea()],
  );
  const [version, setVersion] = useState(0);

  const [intentoEnvio, setIntentoEnvio] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);
  const [, setErroresServidorLinea] = useState<Record<number, string>>({});
  const [sucio, setSucio] = useState(false);

  // Clave de idempotencia estable por montaje: un reintento no crea duplicados.
  const idempotencyKey = useRef(crypto.randomUUID());
  // Evita repoblar el formulario en cada render durante la edición.
  const pedidoCargado = useRef(false);

  const productoPorId = useMemo(() => {
    const m = new Map<number, Producto>();
    productosCompletos.forEach((p) => m.set(p.producto_id, p));
    return m;
  }, [productosCompletos]);

  // Carga las direcciones del usuario para el selector de envío.
  useEffect(() => {
    let vigente = true;
    listarMisDirecciones()
      .then((d) => vigente && setDirecciones(d))
      .catch(() => vigente && setDirecciones([]));
    return () => {
      vigente = false;
    };
  }, []);

  // Carga los países la primera vez que se abre el formulario de nueva dirección.
  useEffect(() => {
    if (!mostrarNuevaDireccion || paises.length > 0) return;
    listarPaises()
      .then(setPaises)
      .catch(() => setErrorDireccion("No se pudieron cargar los países"));
  }, [mostrarNuevaDireccion, paises.length]);

  const handlePaisChange = (pais_id: number) => {
    setNuevaDireccion((f) => ({ ...f, pais_id, region_id: 0, ciudad_id: 0 }));
    setRegiones([]);
    setCiudades([]);
    if (!pais_id) return;
    listarRegiones(pais_id)
      .then(setRegiones)
      .catch(() => setErrorDireccion("No se pudieron cargar las regiones"));
  };

  const handleRegionChange = (region_id: number) => {
    setNuevaDireccion((f) => ({ ...f, region_id, ciudad_id: 0 }));
    setCiudades([]);
    if (!region_id) return;
    listarCiudades(region_id)
      .then(setCiudades)
      .catch(() => setErrorDireccion("No se pudieron cargar las ciudades"));
  };

  const guardarNuevaDireccion = async () => {
    setErrorDireccion("");
    if (
      !nuevaDireccion.ciudad_id ||
      !nuevaDireccion.direccion_destinatario.trim() ||
      !nuevaDireccion.direccion_telefono.trim() ||
      !nuevaDireccion.direccion_calle.trim()
    ) {
      setErrorDireccion(
        "Completa país, región, ciudad, destinatario, teléfono y calle.",
      );
      return;
    }
    setGuardandoDireccion(true);
    try {
      const creada = await crearDireccion({
        ciudad_id: nuevaDireccion.ciudad_id,
        direccion_destinatario: nuevaDireccion.direccion_destinatario.trim(),
        direccion_telefono: nuevaDireccion.direccion_telefono.trim(),
        direccion_calle: nuevaDireccion.direccion_calle.trim(),
        direccion_referencia: nuevaDireccion.direccion_referencia.trim() || undefined,
        direccion_codigo_postal:
          nuevaDireccion.direccion_codigo_postal.trim() || undefined,
      });
      setDirecciones((ds) => [...ds, creada]);
      setDireccionId(creada.direccion_envio_id);
      marcarSucio();
      setMostrarNuevaDireccion(false);
      setNuevaDireccion({
        pais_id: 0,
        region_id: 0,
        ciudad_id: 0,
        direccion_destinatario: "",
        direccion_telefono: "",
        direccion_calle: "",
        direccion_referencia: "",
        direccion_codigo_postal: "",
      });
      setRegiones([]);
      setCiudades([]);
    } catch (err) {
      setErrorDireccion(
        err instanceof Error ? err.message : "No se pudo guardar la dirección",
      );
    } finally {
      setGuardandoDireccion(false);
    }
  };

  // Repobla el formulario cuando se carga el pedido a editar (una sola vez).
  useEffect(() => {
    if (!esEdicion || !pedido || pedidoCargado.current) return;
    if (pedido.pedido_estado !== "BORRADOR") {
      navigate(`/byte&buy/pedidos/${pedido.pedido_id}`, { replace: true });
      return;
    }
    pedidoCargado.current = true;
    setPedidoFecha(pedido.pedido_fecha.slice(0, 10));
    setNotas(pedido.pedido_notas ?? "");
    setDireccionId(pedido.direccion_envio_id ?? 0);
    setVersion(pedido.pedido_version);
    setLineas(
      pedido.detalles.map((d) => ({
        key: crypto.randomUUID(),
        producto_id: d.producto_id,
        cantidad: d.detalle_pedido_cantidad,
        precio_unitario: Number(d.detalle_pedido_precio_unitario),
        descuento_pct: Number(d.detalle_pedido_descuento_pct),
      })),
    );
  }, [esEdicion, pedido, navigate]);

  // Avisa antes de cerrar/recargar la pestaña si hay cambios sin guardar.
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!sucio || enviando) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [sucio, enviando]);

  const marcarSucio = () => setSucio(true);

  // --- Cálculo de totales (previsualización) ---------------------------------
  const importes = lineas.map((l) => {
    const impuesto = productoPorId.get(l.producto_id);
    return calcularLinea(
      l.precio_unitario,
      l.cantidad,
      l.descuento_pct,
      impuesto ? Number(impuesto.producto_impuesto) : 0,
    );
  });
  const totales = sumarTotales(importes);

  // --- Validación ------------------------------------------------------------
  const erroresLinea = lineas.map((l) => validarLinea(l));
  const hayErrores =
    lineas.length === 0 || erroresLinea.some(lineaTieneErrores);

  const resumenErrores: string[] = [];
  if (lineas.length === 0) resumenErrores.push("Agrega al menos una línea.");
  erroresLinea.forEach((e, i) => {
    Object.values(e).forEach((msg) => resumenErrores.push(`Línea ${i + 1}: ${msg}`));
  });

  // --- Envío -----------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enviando) return; // Prevención de doble envío.
    setIntentoEnvio(true);
    setErrorGlobal(null);
    setErroresServidorLinea({});

    if (hayErrores) return;

    const items: PedidoItem[] = lineas.map((l) => ({
      producto_id: l.producto_id,
      cantidad: l.cantidad,
      precio_unitario: l.precio_unitario,
      descuento_pct: l.descuento_pct,
    }));

    setEnviando(true);
    try {
      if (esEdicion) {
        const payload: UpdatePedido = {
          pedido_version: version,
          pedido_fecha: new Date(pedidoFecha).toISOString(),
          pedido_notas: notas || undefined,
          direccion_envio_id: direccionId || undefined,
          items,
        };
        const actualizado = await editarPedido(pedidoId!, payload);
        setSucio(false);
        navigate(`/byte&buy/pedidos/${actualizado.pedido_id}`);
      } else {
        const payload: CreatePedido = {
          cliente_id: usuario!.usuario_id,
          pedido_fecha: new Date(pedidoFecha).toISOString(),
          pedido_notas: notas || undefined,
          direccion_envio_id: direccionId || undefined,
          items,
        };
        const creado = await crearPedido(payload, idempotencyKey.current);
        setSucio(false);
        if (estadoPostPago) {
          navigate(`/byte&buy/facturacion/${estadoPostPago.facturaId}`);
        } else if (estadoDesdeCarrito) {
          navigate("/byte&buy/pago", {
            state: {
              pedidoId: creado.pedido_id,
              pedidoNumero: creado.pedido_numero,
            } satisfies EstadoConPedido,
          });
        } else {
          navigate(`/byte&buy/pedidos/${creado.pedido_id}`);
        }
      }
    } catch (err) {
      // Los datos del formulario se conservan intactos para reintentar.
      const mensaje = err instanceof Error ? err.message : "No se pudo guardar el pedido";
      const idx = indiceDeLineaEnMensaje(mensaje);
      if (idx !== null) {
        setErroresServidorLinea({ [idx]: mensaje });
      } else {
        setErrorGlobal(mensaje);
      }
      setEnviando(false);
    }
  };

  const cancelar = () => {
    if (sucio && !window.confirm("Tienes cambios sin guardar. ¿Salir de todas formas?")) {
      return;
    }
    if (estadoPostPago) {
      // Viniendo de un pago, la compra ya está hecha con o sin este pedido:
      // no tiene sentido mandar a la lista general de pedidos.
      navigate(`/byte&buy/facturacion/${estadoPostPago.facturaId}`);
    } else if (estadoDesdeCarrito) {
      navigate("/byte&buy/carrito");
    } else {
      navigate("/byte&buy/pedidos");
    }
  };

  if (esEdicion && cargandoPedido) {
    return (
      <>
        <Header />
        <main className="pedidos-container">
          <p className="pedidos-cargando">Cargando pedido…</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="pedidos-container">
        <h1>
          {esEdicion
            ? "Editar pedido"
            : estadoPostPago || estadoDesdeCarrito
              ? "Datos de envío"
              : "Nuevo pedido"}
        </h1>

        {estadoPostPago && (
          <p className="pedidos-banner-info">
            Tu compra ya fue pagada y facturada (factura{" "}
            {estadoPostPago.facturaNumero}). Completa la dirección de envío
            para continuar a tu factura; podés omitir este paso si preferís
            verla directamente.
          </p>
        )}

        {estadoDesdeCarrito && (
          <p className="pedidos-banner-info">
            Completa la dirección de envío de tu pedido. Al guardar,
            continuarás al pago.
          </p>
        )}

        {errorGlobal && (
          <div className="pedidos-banner-error" role="alert">
            <strong>No se pudo guardar.</strong> {errorGlobal}
            {/reciente|modificad|versión|version/i.test(errorGlobal) && (
              <button
                type="button"
                className="pedidos-link-btn"
                onClick={() => window.location.reload()}
              >
                Recargar
              </button>
            )}
          </div>
        )}

        <form className="pedido-form" onSubmit={handleSubmit} noValidate>
          {/* Cabecera */}
          <section className="pedido-form-cabecera">
            <div className="pedidos-filtro">
              <label htmlFor="cliente">Cliente</label>
              <input
                id="cliente"
                type="text"
                value={
                  usuario
                    ? `${usuario.usuario_nombre} ${usuario.usuario_apellido1}`
                    : "…"
                }
                readOnly
                aria-readonly="true"
              />
            </div>
            <div className="pedidos-filtro">
              <label htmlFor="fecha">Fecha</label>
              <input
                id="fecha"
                type="date"
                value={pedidoFecha}
                onChange={(e) => {
                  setPedidoFecha(e.target.value);
                  marcarSucio();
                }}
              />
            </div>
            <div className="pedidos-filtro">
              <label htmlFor="direccion">Dirección de envío</label>
              <select
                id="direccion"
                value={direccionId}
                onChange={(e) => {
                  setDireccionId(Number(e.target.value));
                  marcarSucio();
                }}
              >
                <option value={0}>Sin asignar (requerida al confirmar)</option>
                {direcciones.map((d) => (
                  <option key={d.direccion_envio_id} value={d.direccion_envio_id}>
                    {d.direccion_destinatario} — {d.direccion_calle}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="pedidos-link-btn pedido-direccion-toggle"
                onClick={() => setMostrarNuevaDireccion((v) => !v)}
              >
                {mostrarNuevaDireccion
                  ? "Cancelar nueva dirección"
                  : "+ Agregar nueva dirección"}
              </button>
            </div>

            {mostrarNuevaDireccion && (
              <div
                className="pedido-direccion-nueva"
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.preventDefault();
                }}
              >
                <h3>Nueva dirección de envío</h3>
                <div className="pedido-direccion-grid">
                  <div className="pedidos-filtro">
                    <label htmlFor="nd-pais">País</label>
                    <select
                      id="nd-pais"
                      value={nuevaDireccion.pais_id}
                      onChange={(e) => handlePaisChange(Number(e.target.value))}
                    >
                      <option value={0}>Selecciona…</option>
                      {paises.map((p) => (
                        <option key={p.pais_id} value={p.pais_id}>
                          {p.pais_nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="pedidos-filtro">
                    <label htmlFor="nd-region">Región</label>
                    <select
                      id="nd-region"
                      value={nuevaDireccion.region_id}
                      onChange={(e) => handleRegionChange(Number(e.target.value))}
                      disabled={!nuevaDireccion.pais_id}
                    >
                      <option value={0}>Selecciona…</option>
                      {regiones.map((r) => (
                        <option key={r.region_id} value={r.region_id}>
                          {r.region_nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="pedidos-filtro">
                    <label htmlFor="nd-ciudad">Ciudad</label>
                    <select
                      id="nd-ciudad"
                      value={nuevaDireccion.ciudad_id}
                      onChange={(e) =>
                        setNuevaDireccion((f) => ({
                          ...f,
                          ciudad_id: Number(e.target.value),
                        }))
                      }
                      disabled={!nuevaDireccion.region_id}
                    >
                      <option value={0}>Selecciona…</option>
                      {ciudades.map((c) => (
                        <option key={c.ciudad_id} value={c.ciudad_id}>
                          {c.ciudad_nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="pedidos-filtro">
                    <label htmlFor="nd-destinatario">Destinatario</label>
                    <input
                      id="nd-destinatario"
                      type="text"
                      value={nuevaDireccion.direccion_destinatario}
                      onChange={(e) =>
                        setNuevaDireccion((f) => ({
                          ...f,
                          direccion_destinatario: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="pedidos-filtro">
                    <label htmlFor="nd-telefono">Teléfono</label>
                    <input
                      id="nd-telefono"
                      type="tel"
                      value={nuevaDireccion.direccion_telefono}
                      onChange={(e) =>
                        setNuevaDireccion((f) => ({
                          ...f,
                          direccion_telefono: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="pedidos-filtro">
                    <label htmlFor="nd-calle">Calle</label>
                    <input
                      id="nd-calle"
                      type="text"
                      value={nuevaDireccion.direccion_calle}
                      onChange={(e) =>
                        setNuevaDireccion((f) => ({
                          ...f,
                          direccion_calle: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="pedidos-filtro">
                    <label htmlFor="nd-referencia">Dirección de referencia</label>
                    <input
                      id="nd-referencia"
                      type="text"
                      value={nuevaDireccion.direccion_referencia}
                      onChange={(e) =>
                        setNuevaDireccion((f) => ({
                          ...f,
                          direccion_referencia: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="pedidos-filtro">
                    <label htmlFor="nd-cp">Código postal</label>
                    <input
                      id="nd-cp"
                      type="text"
                      value={nuevaDireccion.direccion_codigo_postal}
                      onChange={(e) =>
                        setNuevaDireccion((f) => ({
                          ...f,
                          direccion_codigo_postal: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                {errorDireccion && (
                  <p className="pedido-error-campo">{errorDireccion}</p>
                )}
                <div className="pedido-direccion-acciones">
                  <button
                    type="button"
                    className="pedidos-btn-primary"
                    onClick={guardarNuevaDireccion}
                    disabled={guardandoDireccion}
                  >
                    {guardandoDireccion ? "Guardando…" : "Guardar dirección"}
                  </button>
                </div>
              </div>
            )}

            <div className="pedidos-filtro pedido-form-notas">
              <label htmlFor="notas">Notas</label>
              <textarea
                id="notas"
                rows={2}
                maxLength={1000}
                value={notas}
                onChange={(e) => {
                  setNotas(e.target.value);
                  marcarSucio();
                }}
              />
            </div>
          </section>


          {/* Totales (previsualización) */}
          <section className="pedido-totales" aria-label="Totales (previsualización)">
            <div><span>Subtotal</span><span>{formatearMonto(totales.subtotal)}</span></div>
            <div><span>Descuentos</span><span>−{formatearMonto(totales.descuento_total)}</span></div>
            <div><span>Impuestos</span><span>{formatearMonto(totales.impuesto_total)}</span></div>
            <div className="pedido-totales-total">
              <span>Total</span><span>{formatearMonto(totales.total)}</span>
            </div>
          </section>

          {/* Resumen de por qué el botón está deshabilitado */}
          {intentoEnvio && resumenErrores.length > 0 && (
            <div className="pedidos-banner-error" role="alert">
              <strong>Faltan datos por corregir:</strong>
              <ul>
                {resumenErrores.map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="pedido-form-acciones">
            <button
              type="button"
              className="pedidos-btn-secundario"
              onClick={cancelar}
              disabled={enviando}
            >
              {estadoPostPago ? "Omitir e ir a la factura" : "Cancelar"}
            </button>
            <button
              type="submit"
              className="pedidos-btn-primary"
              disabled={enviando || hayErrores}
              aria-disabled={enviando || hayErrores}
            >
              {enviando
                ? "Guardando…"
                : esEdicion
                  ? "Guardar cambios"
                  : estadoPostPago
                    ? "Guardar y ver factura"
                    : estadoDesdeCarrito
                      ? "Guardar y continuar al pago"
                      : "Crear pedido"}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
