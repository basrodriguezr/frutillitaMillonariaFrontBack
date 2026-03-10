import VolumeSlider from './VolumeSlider';

/**
 * Pestaña de ajustes para velocidad de juego y configuración de audio.
 * Parámetros:
 * - `props` (object): Estado y callbacks de velocidad, mute y volúmenes.
 */
export default function SettingsTab({
  speedLevel,
  onSpeedChange,
  isMuted,
  onToggleSound,
  musicVolume,
  onMusicChange,
  sfxVolume,
  onSfxChange
}) {
  return (
    <div className="tab-pane active">
      <div className="settings-section">
        <div className="settings-head">
          <i className="ph ph-gauge settings-head-icon"></i>
          <span className="settings-head-title">Velocidad de Juego</span>
        </div>
        <div className="settings-speed-row">
          <button
            className={`settings-speed-btn ${speedLevel === 1 ? 'is-active' : ''}`}
            onClick={() => onSpeedChange(1)}
          >
            Normal
          </button>
          <button
            className={`settings-speed-btn ${speedLevel === 2 ? 'is-active' : ''}`}
            onClick={() => onSpeedChange(2)}
          >
            Rápido
          </button>
        </div>
      </div>
      <div>
        <div className="settings-audio-head">
          <div className="settings-head">
            <i className="ph ph-speaker-high settings-head-icon"></i>
            <span className="settings-head-title">Configuración de Audio</span>
          </div>
          <button onClick={onToggleSound} className={`audio-toggle-btn ${isMuted ? 'is-muted' : ''}`}>
            <i className={isMuted ? 'ph ph-speaker-slash' : 'ph ph-speaker-high'}></i>{' '}
            {isMuted ? 'Muteado' : 'Silenciar Todo'}
          </button>
        </div>
        <div className="settings-audio-panel">
          <VolumeSlider
            label="Música de Fondo"
            value={musicVolume}
            setter={onMusicChange}
            icon="ph-music-notes"
            isMuted={isMuted}
            tone="music"
          />
          <VolumeSlider
            label="Efectos de Sonido"
            value={sfxVolume}
            setter={onSfxChange}
            icon="ph-coin"
            isMuted={isMuted}
            tone="sfx"
          />
        </div>
      </div>
    </div>
  );
}
