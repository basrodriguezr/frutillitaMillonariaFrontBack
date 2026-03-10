import AlertModal from './AlertModal';

/**
 * Modal de aviso cuando el usuario está por ver una jugada en modo replay.
 * Parámetros:
 * - `props` (object): Callback para confirmar y continuar.
 */
export default function ReplayWarningModal({ onContinue }) {
  return (
    <AlertModal
      title="Repetición de Jugada"
      message="Esta es una repetición de una jugada ya realizada. Al aceptar, comenzará automáticamente."
      onConfirm={onContinue}
      confirmLabel="Aceptar"
      className="modal-alert-replay"
    />
  );
}
