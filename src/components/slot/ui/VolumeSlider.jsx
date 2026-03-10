/**
 * Fila de control para un canal de volumen específico dentro de Ajustes.
 * Parámetros:
 * - `props` (object): Etiqueta, valor actual, callback de cambio e iconografía.
 */
export default function VolumeSlider({ label, value, setter, icon, isMuted, tone }) {
  return (
    <div className={`volume-row ${isMuted ? 'is-muted' : ''}`}>
      <i className={`ph ${icon} volume-icon`}></i>
      <div className="volume-main">
        <div className="volume-head">
          <span className="volume-label">{label}</span>
          <span className="volume-value">{value}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(event) => setter(Number(event.target.value))}
          className={`volume-range volume-range-${tone}`}
        />
      </div>
    </div>
  );
}
