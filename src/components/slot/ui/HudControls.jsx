/**
 * HUD lateral con accesos rápidos a historial, reglas, ajustes, audio e inicio.
 * Parámetros:
 * - `props` (object): Estado de visibilidad/selección y callbacks de interacción.
 */
export default function HudControls({
  rightHudVisibilityClass,
  activeTab,
  onOpenMenu,
  isMuted,
  onToggleSound,
  onGoHome,
  isFullscreen,
  onToggleFullscreen,
  hudDockTop
}) {
  const dockStyle = typeof hudDockTop === 'number'
    ? { top: `${hudDockTop}px`, transform: 'none' }
    : {};

  return (
    <>
      <div className={`pos-top-right hud-right ${rightHudVisibilityClass}`}>
        <button className="hud-btn" onClick={onToggleFullscreen} title="Pantalla Completa">
          <i className={isFullscreen ? 'ph ph-corners-in' : 'ph ph-corners-out'}></i>
        </button>
      </div>

      <div className={`pos-bottom-right hud-right ${rightHudVisibilityClass}`} style={dockStyle}>
        <button
          className={`hud-btn ${activeTab === 'history' ? 'active-hud' : ''}`}
          onClick={() => onOpenMenu('history')}
          title="Historial"
        >
          <i className="ph ph-clock-counter-clockwise"></i>
        </button>
        <button
          className={`hud-btn ${activeTab === 'rules' ? 'active-hud' : ''}`}
          onClick={() => onOpenMenu('rules')}
          title="Reglas"
        >
          <i className="ph ph-book-open"></i>
        </button>
        <button
          className={`hud-btn ${activeTab === 'settings' ? 'active-hud' : ''}`}
          onClick={() => onOpenMenu('settings')}
          title="Ajustes"
        >
          <i className="ph ph-gear"></i>
        </button>
        <button className="hud-btn" onClick={onToggleSound} title={isMuted ? 'Activar Sonido' : 'Silenciar'}>
          <i className={isMuted ? 'ph ph-speaker-slash' : 'ph ph-speaker-high'}></i>
        </button>

        <button className="hud-btn" onClick={onGoHome} title="Inicio">
          <i className="ph ph-house"></i>
        </button>
      </div>
    </>
  );
}
