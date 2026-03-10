import AlertModal from './AlertModal';

/**
 * Modal especializado para forzar la reanudación de una jugada pendiente.
 * Parámetros:
 * - `props` (object): Callback de aceptación para continuar la jugada.
 */
export default function PendingSpinModal({ onAccept }) {
  return (
    <AlertModal
      title="Jugada Pendiente"
      message="Tienes una jugada pendiente de visualización. Por favor aceptar para continuar."
      onConfirm={onAccept}
      className="modal-alert-pending"
    />
  );
}
