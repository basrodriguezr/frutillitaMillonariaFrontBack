import { useEffect } from 'react';
import { HISTORY_MAX_ITEMS } from '../constants';
import { normalizeHistoryEntry, saveHistory, sortHistoryDesc } from '../utils/historyStorage';

/**
 * Hook de integración entre React UI y la escena Phaser vía `window`.
 * Expone callbacks globales para abrir modales, actualizar HUD y registrar historial.
 * Parámetros:
 * - `config` (object): Setters, estado UI actual y configuración de audio/velocidad.
 */
export function useSlotBridge({
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
}) {
  useEffect(() => {
    window.setCurrentScreen = setCurrentScreen;
    window.setHudDockTop = (top) => {
      setHudDockTop(typeof top === 'number' ? top : null);
    };
    window.showReactAlert = showSmallAlert;
    window.setReactSpinning = setIsSpinning;
    window.showBuyModal = (cost, qty, betVal) => setBuyModalConfig({ cost, qty, betVal });

    window.showReplayWarning = () => {
      closeAll();
      setReplayWarningConfig(true);
    };

    window.showSummaryModal = (data) => {
      closeAll();
      setSummaryPage(1);
      setSummaryModalConfig(data);
    };

    window.showPendingSpinModal = (data) => {
      closeAll();
      setPendingSpinAlert(data);
    };

    window.openHistoryMenu = () => openMenu('history');
    window.addHistoryEntry = (entry) => {
      setHistoryEntries((prev) => {
        const merged = sortHistoryDesc([normalizeHistoryEntry(entry), ...prev]).slice(0, HISTORY_MAX_ITEMS);
        saveHistory(merged);
        return merged;
      });
    };
    const safeSpeedLevel = speedLevel === 2 ? 2 : 1;

    window.reactUI = {
      isActive:
        activeTab !== '' ||
        alertConfig !== null ||
        buyModalConfig !== null ||
        replayWarningConfig !== null ||
        summaryModalConfig !== null ||
        pendingSpinAlert !== null,
      speedLevel: safeSpeedLevel,
      audioConfig: {
        isMuted,
        music: musicVolume / 100,
        sfx: sfxVolume / 100
      }
    };
  }, [
    activeTab,
    alertConfig,
    buyModalConfig,
    closeAll,
    isMuted,
    musicVolume,
    openMenu,
    pendingSpinAlert,
    replayWarningConfig,
    setBuyModalConfig,
    setCurrentScreen,
    setHistoryEntries,
    setHudDockTop,
    setIsSpinning,
    setPendingSpinAlert,
    setReplayWarningConfig,
    setSummaryModalConfig,
    setSummaryPage,
    sfxVolume,
    showSmallAlert,
    speedLevel,
    summaryModalConfig
  ]);
}
