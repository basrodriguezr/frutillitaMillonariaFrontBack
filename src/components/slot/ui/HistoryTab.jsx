import { formatHistoryDate } from '../utils/formatters';

/**
 * Pestaña de historial con tabla paginada y acción para reproducir jugadas.
 * Parámetros:
 * - `props` (object): Datos de historial, paginación y handlers de navegación/replay.
 */
export default function HistoryTab({
  currentHistory,
  safeCurrentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  onReplay,
  formatPoints
}) {
  return (
    <div className="tab-pane active tab-pane-history">
      <div className="history-table-wrap">
        <table className="history-table">
          <thead>
            <tr className="history-head-row">
              <th className="history-head-cell">Fecha</th>
              <th className="history-head-cell">N°Ticket</th>
              <th className="history-head-cell">Precio</th>
              <th className="history-head-cell">Premio</th>
              <th className="history-head-cell history-head-cell-center"></th>
            </tr>
          </thead>
          <tbody>
            {currentHistory.length === 0 && (
              <tr>
                <td colSpan={5} className="history-empty-row">
                  Aún no hay jugadas registradas.
                </td>
              </tr>
            )}
            {currentHistory.map((item, index) => (
              <tr key={`${item.id}-${item.timestamp}-${index}`} className="history-row">
                <td className="history-cell">{formatHistoryDate(item.timestamp)}</td>
                <td className="history-cell">{item.id}</td>
                <td className="history-cell">${formatPoints(item.bet)}</td>
                <td className={`history-cell ${item.win > 0 ? 'history-cell-win' : 'history-cell-muted'}`}>
                  {item.win > 0 ? `$${formatPoints(item.win)}` : 'Sin premio'}
                </td>
                <td className="history-cell history-cell-action">
                  <button className="btn-replay" onClick={() => onReplay(item)} title="Ver jugada">
                    <i className="ph ph-eye"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pager-row">
        <button
          className="shop-btn-adjust shop-btn-small"
          disabled={safeCurrentPage === 1}
          onClick={onPrevPage}
        >
          <i className="ph ph-caret-left"></i>
        </button>
        <span className="pager-label">
          Pág {safeCurrentPage} de {totalPages}
        </span>
        <button
          className="shop-btn-adjust shop-btn-small"
          disabled={safeCurrentPage === totalPages}
          onClick={onNextPage}
        >
          <i className="ph ph-caret-right"></i>
        </button>
      </div>
    </div>
  );
}
