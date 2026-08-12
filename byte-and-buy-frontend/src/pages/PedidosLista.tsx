import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import Header from "../components/Header";
import { useListaPedidos } from "../hooks/useListaPedidos";
import { useUsuario } from "../hooks/useUsuario";
import { cambiarEstadoPedido } from "../services/pedido";
import { ETIQUETA_ESTADO, formatearMonto, transicionesDesde } from "../ts/pedidoReglas";
import type { ListarPedidosParams, Pedido, PedidoEstado } from "../ts/interfaces";
import "../styles/pedidos.css";

/** Plazo dentro del cual el cliente puede cancelar su propio pedido. */
const VENTANA_CANCELACION_MS = 24 * 60 * 60 * 1000;

/** ¿Puede el cliente cancelar este pedido? (estado lo permite y sigue dentro de las 24h desde su creación). */
function puedeCancelar(p: Pedido): boolean {
  if (!transicionesDesde(p.pedido_estado).includes("CANCELADO")) return false;
  return Date.now() - new Date(p.created_at).getTime() < VENTANA_CANCELACION_MS;
}

const ESTADOS: PedidoEstado[] = [
  "BORRADOR",
  "CONFIRMADO",
  "EN_PREPARACION",
  "ENTREGADO",
  "CANCELADO",
];

/** Página de listado de pedidos con filtros, orden y paginación server-side. */
export default function PedidosLista() {
  const navigate = useNavigate();
  const { usuario } = useUsuario();

  const [filtros, setFiltros] = useState<ListarPedidosParams>({
    orden_por: "created_at",
    orden_dir: "DESC",
    page: 1,
    limit: 10,
  });

  // Búsqueda con debounce: no golpea el backend en cada tecla.
  const [buscarInput, setBuscarInput] = useState("");
  useEffect(() => {
    const t = setTimeout(() => {
      setFiltros((f) => ({
        ...f,
        buscar: buscarInput.trim() || undefined,
        page: 1,
      }));
    }, 350);
    return () => clearTimeout(t);
  }, [buscarInput]);

  // El listado debe acotarse siempre a los pedidos del usuario autenticado:
  // el backend no lo hace por sí solo, así que `cliente_id` viaja en cada
  // consulta. Mientras el usuario todavía no cargó se usa un id imposible
  // (-1) para no traer momentáneamente los pedidos de todos los usuarios.
  const { pedidos, total, page, limit, totalPaginas, loading, error, recargar } =
    useListaPedidos({ ...filtros, cliente_id: usuario?.usuario_id ?? -1 });

  /** Actualiza un filtro y regresa a la primera página. */
  const setFiltro = <K extends keyof ListarPedidosParams>(
    campo: K,
    valor: ListarPedidosParams[K],
  ) => setFiltros((f) => ({ ...f, [campo]: valor, page: 1 }));

  // Id del pedido que se está cancelando (bloquea su botón mientras dura la petición).
  const [cancelandoId, setCancelandoId] = useState<number | null>(null);
  const [errorCancelar, setErrorCancelar] = useState<string | null>(null);

  const cancelarPedido = async (p: Pedido) => {
    if (cancelandoId !== null) return;
    if (!window.confirm(`¿Seguro que deseas cancelar el pedido ${p.pedido_numero}?`)) {
      return;
    }
    setCancelandoId(p.pedido_id);
    setErrorCancelar(null);
    try {
      await cambiarEstadoPedido(p.pedido_id, {
        nuevo_estado: "CANCELADO",
        pedido_version: p.pedido_version,
      });
      await recargar();
    } catch (err) {
      setErrorCancelar(
        err instanceof Error ? err.message : "No se pudo cancelar el pedido",
      );
    } finally {
      setCancelandoId(null);
    }
  };

  return (
    <>
      <Header />
      <main className="pedidos-container">
        <div className="pedidos-topbar">
          <h1>Pedidos</h1>
        </div>

        <section className="pedidos-filtros" aria-label="Filtros de pedidos">
          <div className="pedidos-filtro">
            <label htmlFor="buscar">Buscar</label>
            <input
              id="buscar"
              type="search"
              placeholder="Número o notas…"
              value={buscarInput}
              onChange={(e) => setBuscarInput(e.target.value)}
            />
          </div>
          <div className="pedidos-filtro">
            <label htmlFor="estado">Estado</label>
            <select
              id="estado"
              value={filtros.estado ?? ""}
              onChange={(e) =>
                setFiltro("estado", (e.target.value || undefined) as PedidoEstado | undefined)
              }
            >
              <option value="">Todos</option>
              {ESTADOS.map((e) => (
                <option key={e} value={e}>
                  {ETIQUETA_ESTADO[e]}
                </option>
              ))}
            </select>
          </div>
          <div className="pedidos-filtro">
            <label htmlFor="desde">Desde</label>
            <input
              id="desde"
              type="date"
              value={filtros.fecha_desde ?? ""}
              onChange={(e) => setFiltro("fecha_desde", e.target.value || undefined)}
            />
          </div>
          <div className="pedidos-filtro">
            <label htmlFor="hasta">Hasta</label>
            <input
              id="hasta"
              type="date"
              value={filtros.fecha_hasta ?? ""}
              onChange={(e) => setFiltro("fecha_hasta", e.target.value || undefined)}
            />
          </div>
          <div className="pedidos-filtro">
            <label htmlFor="orden">Ordenar por</label>
            <select
              id="orden"
              value={`${filtros.orden_por}:${filtros.orden_dir}`}
              onChange={(e) => {
                const [orden_por, orden_dir] = e.target.value.split(":") as [
                  NonNullable<ListarPedidosParams["orden_por"]>,
                  NonNullable<ListarPedidosParams["orden_dir"]>,
                ];
                setFiltros((f) => ({ ...f, orden_por, orden_dir, page: 1 }));
              }}
            >
              <option value="created_at:DESC">Más recientes</option>
              <option value="created_at:ASC">Más antiguos</option>
              <option value="pedido_total:DESC">Mayor total</option>
              <option value="pedido_total:ASC">Menor total</option>
              <option value="pedido_numero:ASC">Número (A–Z)</option>
            </select>
          </div>
        </section>

        {error && (
          <p className="pedidos-banner-error" role="alert">
            {error}
          </p>
        )}
        {errorCancelar && (
          <p className="pedidos-banner-error" role="alert">
            {errorCancelar}
          </p>
        )}

        <div className="pedidos-tabla-wrap">
          <table className="pedidos-tabla">
            <thead>
              <tr>
                <th scope="col">Número</th>
                <th scope="col">Fecha</th>
                <th scope="col">Estado</th>
                <th scope="col" className="right">Total</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Skeleton de carga.
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="pedidos-skeleton-row">
                    <td colSpan={5}>
                      <span className="pedidos-skeleton" />
                    </td>
                  </tr>
                ))
              ) : pedidos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="pedidos-vacio">
                    No hay pedidos que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                pedidos.map((p) => (
                  <tr key={p.pedido_id}>
                    <td>{p.pedido_numero}</td>
                    <td>{new Date(p.pedido_fecha).toLocaleDateString()}</td>
                    <td>
                      <span className={`pedidos-badge estado-${p.pedido_estado}`}>
                        {ETIQUETA_ESTADO[p.pedido_estado]}
                      </span>
                    </td>
                    <td className="right">{formatearMonto(p.pedido_total)}</td>
                    <td>
                      <Link
                        className="pedidos-link"
                        to={`/byte&buy/pedidos/${p.pedido_id}`}
                      >
                        Ver detalle
                      </Link>
                      {puedeCancelar(p) && (
                        <button
                          type="button"
                          className="pedidos-link-btn pedidos-link-btn-peligro"
                          onClick={() => cancelarPedido(p)}
                          disabled={cancelandoId !== null}
                        >
                          {cancelandoId === p.pedido_id ? "Cancelando…" : "Cancelar"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <nav className="pedidos-paginacion" aria-label="Paginación de pedidos">
          <button
            disabled={page <= 1 || loading}
            onClick={() => setFiltros((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
          >
            ← Anterior
          </button>
          <span aria-live="polite">
            Página {page} de {Math.max(totalPaginas, 1)} · {total} pedidos
          </span>
          <button
            disabled={page >= totalPaginas || loading}
            onClick={() => setFiltros((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
          >
            Siguiente →
          </button>
          <select
            aria-label="Pedidos por página"
            value={limit}
            onChange={(e) =>
              setFiltros((f) => ({ ...f, limit: Number(e.target.value), page: 1 }))
            }
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n} / pág.
              </option>
            ))}
          </select>
        </nav>
      </main>
    </>
  );
}
