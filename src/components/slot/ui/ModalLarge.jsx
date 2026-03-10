/**
 * Contenedor de modal grande reutilizable para pestañas de contenido extenso.
 * Parámetros:
 * - `props` (object): Título, callback de cierre y contenido hijo.
 */
export default function ModalLarge({ title, onClose, children }) {
  return (
    <div className="modal-large" onClick={(event) => event.stopPropagation()}>
      <div className="modal-header">
        <span className="modal-title">{title}</span>
        <i className="ph ph-x close-icon" onClick={onClose}></i>
      </div>
      <div className="modal-content-area">{children}</div>
    </div>
  );
}
