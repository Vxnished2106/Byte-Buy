import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import Header from "../components/Header";
import { useProductos } from "../hooks/useProductos";
import { usePedido } from "../hooks/usePedido";
import { useUsuario } from "../hooks/useUsuario";
import { listarMisDirecciones } from "../services/direccionEnvio";
import { crearPedido, editarPedido } from "../services/pedido";
import {
  calcularLinea,
  formatearMonto,
  sumarTotales,
  validarLinea,
  lineaTieneErrores,
  type EstadoPostPago,
} from "../ts/pedidoReglas";
import type {
  CreatePedido,
  DireccionEnvio,
  PedidoItem,
  Producto,
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
 */
export default function PedidoForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const pedidoId = id ? Number(id) : undefined;
  const esEdicion = pedidoId !== undefined;

  // Si venimos de un pago recién hecho, `Pago.tsx` deja acá lo comprado y la
  // factura generada: sirve para precargar las líneas y para saber, al
  // guardar, que hay que volver a la factura en vez de al detalle de pedido.
  const estadoPostPago = !esEdicion
    ? (location.state as EstadoPostPago | null)
    : null;

  const { usuario } = useUsuario();
  const { productosCompletos, loading: cargandoProductos } = useProductos();
  const { pedido, loading: cargandoPedido } = usePedido(pedidoId);

  const [direcciones, setDirecciones] = useState<DireccionEnvio[]>([]);

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
    estadoPostPago && estadoPostPago.items.length > 0
      ? estadoPostPago.items.map((it) => ({
          key: crypto.randomUUID(),
          producto_id: it.producto_id,
          cantidad: it.cantidad,
          precio_unitario: it.precio_unitario,
          descuento_pct: it.descuento_pct,
        }))
      : [nuevaLinea()],
  );
  const [version, setVersion] = useState(0);

  const [tocados, setTocados] = useState<Set<string>>(new Set());
  const [intentoEnvio, setIntentoEnvio] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);
  const [erroresServidorLinea, setErroresServidorLinea] = useState<Record<number, string>>({});
  const [sucio, setSucio] = useState(false);

  // Clave de idempotencia estable por montaje: un reintento no crea duplicados.
  const idempotencyKey = useRef(crypto.randomUUID());
  // Evita repoblar el formulario en cada render durante la edición.
  const pedidoCargado = useRef(false);
  const foco = useRef<HTMLSelectElement | null>(null);
  const debeEnfocar = useRef(false);

  const activos = useMemo(
    () => productosCompletos.filter((p) => p.producto_estado === "activo"),
    [productosCompletos],
  );
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

  // Enfoca el selector de la fila recién agregada.
  useEffect(() => {
    if (debeEnfocar.current && foco.current) {
      foco.current.focus();
      debeEnfocar.current = false;
    }
  }, [lineas]);

  const marcarSucio = () => setSucio(true);

  // --- Manejo de líneas ------------------------------------------------------
  const cambiarLinea = (key: string, cambios: Partial<LineaForm>) => {
    setLineas((ls) => ls.map((l) => (l.key === key ? { ...l, ...cambios } : l)));
    marcarSucio();
  };

  const seleccionarProducto = (key: string, productoId: number) => {
    const producto = productoPorId.get(productoId);
    cambiarLinea(key, {
      producto_id: productoId,
      // Autocompleta precio y descuento desde el catálogo (el usuario puede ajustarlos).
      precio_unitario: producto ? Number(producto.producto_precio) : 0,
      descuento_pct: producto ? Number(producto.producto_descuento) : 0,
    });
  };

  const agregarLinea = () => {
    debeEnfocar.current = true;
    setLineas((ls) => [...ls, nuevaLinea()]);
    marcarSucio();
  };

  const quitarLinea = (key: string) => {
    setLineas((ls) => (ls.length > 1 ? ls.filter((l) => l.key !== key) : ls));
    marcarSucio();
  };

  const tocar = (campo: string) => setTocados((t) => new Set(t).add(campo));

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

  const mostrarError = (key: string, campo: string, msg?: string) =>
    msg && (intentoEnvio || tocados.has(`${key}:${campo}`)) ? msg : undefined;

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
        navigate(
          estadoPostPago
            ? `/byte&buy/facturacion/${estadoPostPago.facturaId}`
            : `/byte&buy/pedidos/${creado.pedido_id}`,
        );
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
    // Viniendo de un pago, la compra ya está hecha con o sin este pedido: no
    // tiene sentido mandar a la lista general de pedidos.
    navigate(
      estadoPostPago
        ? `/byte&buy/facturacion/${estadoPostPago.facturaId}`
        : "/byte&buy/pedidos",
    );
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
            : estadoPostPago
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
            </div>
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

          {/* Grilla de líneas */}
          <section aria-label="Líneas del pedido">
            <div className="pedido-lineas-header">
              <h2>Productos</h2>
              <button type="button" className="pedidos-btn-secundario" onClick={agregarLinea}>
                + Agregar línea
              </button>
            </div>

            <div className="pedidos-tabla-wrap">
              <table className="pedido-lineas-tabla">
                <thead>
                  <tr>
                    <th scope="col">Producto</th>
                    <th scope="col">Cantidad</th>
                    <th scope="col">Precio unit.</th>
                    <th scope="col">Desc. %</th>
                    <th scope="col" className="right">Total línea</th>
                    <th scope="col"><span className="sr-only">Acciones</span></th>
                  </tr>
                </thead>
                <tbody>
                  {lineas.map((l, i) => {
                    const errores = erroresLinea[i];
                    const errServidor = erroresServidorLinea[i + 1];
                    const esUltima = i === lineas.length - 1;
                    const errProducto = mostrarError(l.key, "producto_id", errores.producto_id);
                    const errCantidad = mostrarError(l.key, "cantidad", errores.cantidad);
                    const errPrecio = mostrarError(l.key, "precio_unitario", errores.precio_unitario);
                    const errDesc = mostrarError(l.key, "descuento_pct", errores.descuento_pct);
                    return (
                      <tr key={l.key} className={errServidor ? "linea-error-servidor" : ""}>
                        <td>
                          <select
                            aria-label={`Producto de la línea ${i + 1}`}
                            aria-invalid={Boolean(errProducto)}
                            aria-describedby={errProducto ? `err-prod-${l.key}` : undefined}
                            ref={esUltima ? foco : undefined}
                            value={l.producto_id}
                            onChange={(e) => seleccionarProducto(l.key, Number(e.target.value))}
                            onBlur={() => tocar(`${l.key}:producto_id`)}
                            disabled={cargandoProductos}
                          >
                            <option value={0}>Selecciona…</option>
                            {activos.map((p) => (
                              <option key={p.producto_id} value={p.producto_id}>
                                {p.producto_nombre}
                              </option>
                            ))}
                          </select>
                          {errProducto && (
                            <span id={`err-prod-${l.key}`} className="pedido-error-campo">
                              {errProducto}
                            </span>
                          )}
                        </td>
                        <td>
                          <input
                            type="number"
                            min={1}
                            step={1}
                            aria-label={`Cantidad de la línea ${i + 1}`}
                            aria-invalid={Boolean(errCantidad)}
                            value={l.cantidad === 0 ? "" : l.cantidad}
                            onChange={(e) =>
                              cambiarLinea(l.key, { cantidad: Math.trunc(Number(e.target.value)) })
                            }
                            onBlur={() => tocar(`${l.key}:cantidad`)}
                          />
                          {errCantidad && <span className="pedido-error-campo">{errCantidad}</span>}
                        </td>
                        <td>
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            aria-label={`Precio unitario de la línea ${i + 1}`}
                            aria-invalid={Boolean(errPrecio)}
                            value={l.precio_unitario === 0 ? "" : l.precio_unitario}
                            onChange={(e) =>
                              cambiarLinea(l.key, { precio_unitario: Number(e.target.value) })
                            }
                            onBlur={() => tocar(`${l.key}:precio_unitario`)}
                          />
                          {errPrecio && <span className="pedido-error-campo">{errPrecio}</span>}
                        </td>
                        <td>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            step="0.01"
                            aria-label={`Descuento de la línea ${i + 1}`}
                            aria-invalid={Boolean(errDesc)}
                            value={l.descuento_pct === 0 ? "" : l.descuento_pct}
                            onChange={(e) =>
                              cambiarLinea(l.key, { descuento_pct: Number(e.target.value) })
                            }
                            onBlur={() => tocar(`${l.key}:descuento_pct`)}
                          />
                          {errDesc && <span className="pedido-error-campo">{errDesc}</span>}
                        </td>
                        <td className="right">{formatearMonto(importes[i].total)}</td>
                        <td>
                          <button
                            type="button"
                            className="pedido-quitar-linea"
                            aria-label={`Quitar línea ${i + 1}`}
                            onClick={() => quitarLinea(l.key)}
                            disabled={lineas.length === 1}
                          >
                            ✕
                          </button>
                          {errServidor && (
                            <span className="pedido-error-campo">{errServidor}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
            <p className="pedido-totales-nota">
              * Previsualización. El total definitivo lo calcula el servidor al guardar.
            </p>
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
                    : "Crear pedido"}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
