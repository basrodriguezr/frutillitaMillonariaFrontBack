/**
 * Pestaña informativa con reglas y referencias de premios del juego.
 * No requiere parámetros.
 */
export default function RulesTab() {
  return (
    <div className="tab-pane active">
      <h4 className="rules-title">Reglas del Juego</h4>
      <p className="rules-copy">
        Los premios se calculan encontrando <strong>Grupos (Clusters)</strong> de figuras iguales. Para ganar,
        necesitas un mínimo de <strong>4 figuras conectadas</strong> horizontal o verticalmente. El premio final
        multiplica tu Apuesta.
      </p>
      <div className="info-row">
        <span className="info-label">Jackpot Máximo</span>
        <span className="info-val info-val-jackpot">Hasta x500</span>
      </div>
      <div className="info-row">
        <span className="info-label">Grupo de 9+ Figuras</span>
        <span className="info-val">Apuesta x10 a x500</span>
      </div>
      <div className="info-row">
        <span className="info-label">Grupo de 4 Figuras</span>
        <span className="info-val">Apuesta x0.2 a x5.0</span>
      </div>
    </div>
  );
}
