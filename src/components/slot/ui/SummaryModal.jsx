import { SUMMARY_ITEMS_PER_PAGE } from '../constants';

/**
 * Modal de resumen para visualizar resultados de un pack con paginación.
 * Parámetros:
 * - `props` (object): Datos del resumen y callbacks de navegación/cierre.
 */
export default function SummaryModal({
  data,
  page,
  onPageChange,
  onClose,
  onGoHistory,
  onGoHome,
  formatPoints
}) {
  const totalPages = Math.max(1, Math.ceil(data.length / SUMMARY_ITEMS_PER_PAGE));
  const visibleRows = data.slice((page - 1) * SUMMARY_ITEMS_PER_PAGE, page * SUMMARY_ITEMS_PER_PAGE);

  return (
    <div className="modal-alert modal-alert-summary" onClick={(event) => event.stopPropagation()}>
      <div className="summary-head">
        <i className="ph ph-clipboard-text summary-head-icon"></i>
        <h2 className="summary-head-title">Resumen</h2>
      </div>

      <div className="summary-table-wrap">
        <table className="summary-table">
          <thead>
            <tr className="summary-table-head-row">
              <th className="summary-table-head-cell">N°Jugada</th>
              <th className="summary-table-head-cell">Precio</th>
              <th className="summary-table-head-cell">Resultado</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((item, index) => (
              <tr key={index} className="summary-table-row">
                <td className="summary-table-cell">{item.spinNum}</td>
                <td className="summary-table-cell">${formatPoints(item.bet)}</td>
                <td className={`summary-table-cell ${item.win > 0 ? 'summary-table-cell-win' : 'summary-table-cell-muted'}`}>
                  {item.win > 0 ? `$${formatPoints(item.win)}` : 'Sin premio'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length > SUMMARY_ITEMS_PER_PAGE && (
        <div className="pager-row pager-row-summary">
          <button
            className="shop-btn-adjust shop-btn-small"
            disabled={page === 1}
            onClick={() => onPageChange((prev) => Math.max(prev - 1, 1))}
          >
            <i className="ph ph-caret-left"></i>
          </button>
          <span className="pager-label">
            Pág {page} de {totalPages}
          </span>
          <button
            className="shop-btn-adjust shop-btn-small"
            disabled={page === totalPages}
            onClick={() => onPageChange((prev) => Math.min(prev + 1, totalPages))}
          >
            <i className="ph ph-caret-right"></i>
          </button>
        </div>
      )}

      <div className="summary-actions">
        <button
          className="summary-action-btn"
          onClick={() => {
            onClose();
            onGoHistory();
          }}
          title="Ver Historial"
        >
          <i className="ph ph-clock-counter-clockwise summary-action-icon"></i>
        </button>
        <button
          className="summary-action-btn"
          onClick={() => {
            onClose();
            onGoHome();
          }}
          title="Volver al Inicio"
        >
          <i className="ph ph-house summary-action-icon"></i>
        </button>
      </div>
    </div>
  );
}
