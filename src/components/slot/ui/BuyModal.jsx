/**
 * Modal de compra que permite elegir visualización automática o manual del pack.
 * Parámetros:
 * - `props` (object): Configuración del pack y callbacks de cierre/acción.
 */
export default function BuyModal({ config, onClose, onAutoReveal, onManualReveal, formatPoints }) {
  return (
    <div className="modal-alert modal-alert-buy" onClick={(event) => event.stopPropagation()}>
      <h2 className="modal-buy-title">Visualizar Jugadas</h2>
      <p className="modal-buy-copy">
        Compraste <strong>{config.qty} jugadas</strong> por ${formatPoints(config.cost)}.
        <br />
        Elige cómo quieres visualizarlas:
      </p>
      <div className="buy-options-layout">
        <div
          className="buy-option-card"
          onClick={() => {
            if (window.playButtonSfx) window.playButtonSfx();
            onClose();
            onAutoReveal(config);
          }}
        >
          <div className="buy-option-head">
            <i className="ph ph-ticket buy-option-icon"></i>
            <h3 className="buy-option-title">Automática</h3>
          </div>
          <p className="buy-option-copy">Resultados inmediatos con opción a repetición.</p>
        </div>
        <div
          className="buy-option-card"
          onClick={() => {
            if (window.playButtonSfx) window.playButtonSfx();
            onClose();
            onManualReveal(config);
          }}
        >
          <div className="buy-option-head">
            <i className="ph ph-youtube-logo buy-option-icon"></i>
            <h3 className="buy-option-title">Manual</h3>
          </div>
          <p className="buy-option-copy">Jugadas una por una en la pantalla de juego.</p>
        </div>
      </div>
    </div>
  );
}
