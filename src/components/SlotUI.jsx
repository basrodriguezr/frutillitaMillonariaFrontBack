import { useCallback, useEffect, useState } from 'react';
import { ITEMS_PER_PAGE } from './slot/constants';
import { useAudioEngine } from './slot/hooks/useAudioEngine';
import { useFullscreen } from './slot/hooks/useFullscreen';
import { useSlotBridge } from './slot/hooks/useSlotBridge';
import { formatPoints } from './slot/utils/formatters';
import { loadHistory } from './slot/utils/historyStorage';
import AlertModal from './slot/ui/AlertModal';
import BuyModal from './slot/ui/BuyModal';
import HistoryTab from './slot/ui/HistoryTab';
import HudControls from './slot/ui/HudControls';
import ModalLarge from './slot/ui/ModalLarge';
import PendingSpinModal from './slot/ui/PendingSpinModal';
import ReplayWarningModal from './slot/ui/ReplayWarningModal';
import RulesTab from './slot/ui/RulesTab';
import SettingsTab from './slot/ui/SettingsTab';
import SummaryModal from './slot/ui/SummaryModal';

/**
 * Resuelve el título del modal principal según la pestaña activa.
 * Parámetros:
 * - `activeTab` (string): Identificador de la pestaña (`history`, `rules`, `settings`).
 */
function getModalTitle(activeTab) {
  switch (activeTab) {
    case 'history':
      return (
        <>
          <i className="ph ph-clock-counter-clockwise"></i> Historial
        </>
      );
    case 'rules':
      return (
        <>
          <i className="ph ph-book-open"></i> Reglas
        </>
      );
    case 'settings':
      return (
        <>
          <i className="ph ph-gear"></i> Ajustes
        </>
      );
    default:
      return '';
  }
}

/**
 * Capa React principal del frontend del slot.
 * Representa HUD, modales y puente entre UI React y escena Phaser.
 * No requiere parámetros.
 */
export default function SlotUI() {
  const [currentScreen, setCurrentScreen] = useState('loading');
  const [hudDockTop, setHudDockTop] = useState(null);

  const [activeTab, setActiveTab] = useState('');
  const [alertConfig, setAlertConfig] = useState(null);
  const [buyModalConfig, setBuyModalConfig] = useState(null);
  const [replayWarningConfig, setReplayWarningConfig] = useState(null);
  const [summaryModalConfig, setSummaryModalConfig] = useState(null);
  const [pendingSpinAlert, setPendingSpinAlert] = useState(null);

  const [summaryPage, setSummaryPage] = useState(1);
  const [isSpinning, setIsSpinning] = useState(false);

  const [isMuted, setIsMuted] = useState(() => window.__audioConsentEnabled === false);
  const [currentPage, setCurrentPage] = useState(1);
  const [speedLevel, setSpeedLevel] = useState(1);

  const [musicVolume, setMusicVolume] = useState(80);
  const [sfxVolume, setSfxVolume] = useState(100);
  const [historyEntries, setHistoryEntries] = useState(() => loadHistory());

  useAudioEngine({
    isMuted,
    musicVolume,
    sfxVolume
  });

  const { isFullscreen, toggleFullscreen } = useFullscreen();

  const closeAll = useCallback(() => {
    setActiveTab('');
    setAlertConfig(null);
    setBuyModalConfig(null);
    setReplayWarningConfig(null);
    setSummaryModalConfig(null);
    setPendingSpinAlert(null);
  }, []);

  const openMenu = useCallback(
    (tab) => {
      if (activeTab === tab) {
        closeAll();
        return;
      }

      setActiveTab(tab);
      if (tab === 'history') setCurrentPage(1);
    },
    [activeTab, closeAll]
  );

  const showSmallAlert = useCallback(
    (title, msg) => {
      closeAll();
      setAlertConfig({ title, msg });
    },
    [closeAll]
  );

  const toggleSound = useCallback(() => {
    setIsMuted((prev) => {
      const nextMuted = !prev;
      if (prev && !nextMuted && window.bootstrapAudioEngine) {
        window.bootstrapAudioEngine();
      }
      return nextMuted;
    });
  }, []);

  const handleSpeedChange = useCallback((level) => {
    setSpeedLevel(level === 2 ? 2 : 1);
  }, []);

  const goToHome = useCallback(() => {
    closeAll();
    if (window.gameRef && typeof window.gameRef.showLobby === 'function') {
      window.gameRef.showLobby();
    }
  }, [closeAll]);

  const handleReplayFromHistory = useCallback(
    (item) => {
      closeAll();
      setTimeout(() => {
        if (window.gameRef) {
          window.gameRef.setupReplay({ bet: item.bet, win: item.win }, 'history');
        }
      }, 50);
    },
    [closeAll]
  );

  const handleAutoReveal = useCallback((config) => {
    if (window.gameRef) {
      window.gameRef.startAutoReveal(config.qty, config.cost);
    }
  }, []);

  const handleManualReveal = useCallback((config) => {
    if (window.gameRef) {
      window.gameRef.startManualMode(config.qty, config.betVal, config.cost);
    }
  }, []);

  const handlePendingSpinAccept = useCallback(() => {
    const savedData = pendingSpinAlert;
    closeAll();
    setTimeout(() => {
      if (window.gameRef) {
        window.gameRef.playPendingSpin(savedData);
      }
    }, 100);
  }, [closeAll, pendingSpinAlert]);

  const handleSummaryGoHistory = useCallback(() => {
    if (window.gameRef) {
      window.gameRef.showLobby();
    }
    setTimeout(() => openMenu('history'), 50);
  }, [openMenu]);

  const handleSummaryGoHome = useCallback(() => {
    if (window.gameRef) {
      window.gameRef.showLobby();
    }
  }, []);

  const handleReplayWarningContinue = useCallback(() => {
    closeAll();
    setTimeout(() => {
      if (window.gameRef && typeof window.gameRef.executeReplay === 'function') {
        window.gameRef.executeReplay();
      }
    }, 80);
  }, [closeAll]);

  useSlotBridge({
    setCurrentScreen,
    setHudDockTop,
    showSmallAlert,
    setIsSpinning,
    setBuyModalConfig,
    closeAll,
    setReplayWarningConfig,
    setSummaryPage,
    setSummaryModalConfig,
    setPendingSpinAlert,
    openMenu,
    setHistoryEntries,
    activeTab,
    alertConfig,
    buyModalConfig,
    replayWarningConfig,
    summaryModalConfig,
    pendingSpinAlert,
    speedLevel,
    isMuted,
    musicVolume,
    sfxVolume
  });

  const totalPages = Math.max(1, Math.ceil(historyEntries.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const currentHistory = historyEntries.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );

  const hideRightHud = currentScreen === 'loading';
  const isRightHudBlocked = isSpinning || hideRightHud;
  const rightHudVisibilityClass = isRightHudBlocked ? 'hud-hidden' : 'hud-visible';

  const isModalOpen = Boolean(
    activeTab || alertConfig || buyModalConfig || replayWarningConfig || summaryModalConfig || pendingSpinAlert
  );

  useEffect(() => {
    const root = document.documentElement;
    if (typeof hudDockTop === 'number') {
      root.style.setProperty('--hud-dock-top', `${hudDockTop}px`);
    } else {
      root.style.removeProperty('--hud-dock-top');
    }

    root.style.setProperty('--vol-music', `${musicVolume}%`);
    root.style.setProperty('--vol-sfx', `${sfxVolume}%`);
  }, [hudDockTop, musicVolume, sfxVolume]);

  useEffect(() => {
    /**
     * Sincroniza el estado visual de mute con la elección del modal inicial de audio.
     * Parámetros:
     * - `event` (CustomEvent): Evento con `detail.enabled` indicando si se habilitó sonido.
     */
    const onAudioConsentChanged = (event) => {
      const enabled = Boolean(event?.detail?.enabled);
      setIsMuted(!enabled);
    };

    window.addEventListener('audio-consent-changed', onAudioConsentChanged);
    return () => {
      window.removeEventListener('audio-consent-changed', onAudioConsentChanged);
    };
  }, []);

  return (
    <div id="ui-layer">
      <div className={`modal-overlay ${isModalOpen ? 'active' : ''}`} onClick={pendingSpinAlert ? undefined : closeAll}>
        {activeTab && (
          <ModalLarge title={getModalTitle(activeTab)} onClose={closeAll}>
            {activeTab === 'history' && (
              <HistoryTab
                currentHistory={currentHistory}
                safeCurrentPage={safeCurrentPage}
                totalPages={totalPages}
                onPrevPage={() => setCurrentPage((page) => Math.max(Math.min(page - 1, totalPages), 1))}
                onNextPage={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
                onReplay={handleReplayFromHistory}
                formatPoints={formatPoints}
              />
            )}

            {activeTab === 'rules' && <RulesTab />}

            {activeTab === 'settings' && (
              <SettingsTab
                speedLevel={speedLevel}
                onSpeedChange={handleSpeedChange}
                isMuted={isMuted}
                onToggleSound={toggleSound}
                musicVolume={musicVolume}
                onMusicChange={setMusicVolume}
                sfxVolume={sfxVolume}
                onSfxChange={setSfxVolume}
              />
            )}
          </ModalLarge>
        )}

        {alertConfig && (
          <AlertModal title={alertConfig.title} message={alertConfig.msg} onConfirm={closeAll} className="modal-alert-basic" />
        )}

        {buyModalConfig && (
          <BuyModal
            config={buyModalConfig}
            onClose={closeAll}
            onAutoReveal={handleAutoReveal}
            onManualReveal={handleManualReveal}
            formatPoints={formatPoints}
          />
        )}

        {pendingSpinAlert && <PendingSpinModal onAccept={handlePendingSpinAccept} />}

        {replayWarningConfig && <ReplayWarningModal onContinue={handleReplayWarningContinue} />}

        {summaryModalConfig && (
          <SummaryModal
            data={summaryModalConfig}
            page={summaryPage}
            onPageChange={setSummaryPage}
            onClose={closeAll}
            onGoHistory={handleSummaryGoHistory}
            onGoHome={handleSummaryGoHome}
            formatPoints={formatPoints}
          />
        )}
      </div>

      <HudControls
        rightHudVisibilityClass={rightHudVisibilityClass}
        hudDockTop={hudDockTop}
        activeTab={activeTab}
        onOpenMenu={openMenu}
        isMuted={isMuted}
        onToggleSound={toggleSound}
        onGoHome={goToHome}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />
    </div>
  );
}
