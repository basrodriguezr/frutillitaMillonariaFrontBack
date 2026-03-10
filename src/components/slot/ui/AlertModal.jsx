/**
 * Modal de alerta genérico para mensajes simples con acción de confirmación.
 * Parámetros:
 * - `props` (object): Configuración visual y callback del botón principal.
 */
export default function AlertModal({
  title,
  message,
  onConfirm,
  confirmLabel = 'Aceptar',
  className = 'modal-alert-basic'
}) {
  return (
    <div className={`modal-alert ${className}`} onClick={(event) => event.stopPropagation()}>
      <h3 className="modal-alert-title">{title}</h3>
      <p className="modal-alert-text">{message}</p>
      <button className="btn-confirm" onClick={onConfirm}>
        {confirmLabel}
      </button>
    </div>
  );
}
