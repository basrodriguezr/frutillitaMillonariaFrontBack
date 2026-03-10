import React, { useState, useEffect, useCallback } from 'react';

const BET_VALUES = [100, 200, 300, 400, 500, 1000, 2000, 5000, 10000];
const HISTORY_STORAGE_KEY = 'frutilla_history_v1';
const HISTORY_MAX_ITEMS = 500;
const ITEMS_PER_PAGE = 5;

function parseLegacyDate(value) {
    if (!value || typeof value !== 'string') return 0;
    const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/);
    if (match) {
        const [, day, month, year, hour, minute] = match;
        return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)).getTime();
    }
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeHistoryEntry(item) {
    const now = Date.now();
    const timestamp = Number(item?.timestamp) || parseLegacyDate(item?.date) || now;
    return {
        id: String(item?.id ?? item?.ticketId ?? Math.floor(1000000 + Math.random() * 9000000)),
        timestamp,
        date: item?.date ?? new Date(timestamp).toISOString(),
        bet: Number(item?.bet) || 0,
        win: Number(item?.win) || 0,
        mode: item?.mode ?? 'single'
    };
}

function sortHistoryDesc(items) {
    return [...items].sort((a, b) => {
        const tsDiff = (Number(b?.timestamp) || 0) - (Number(a?.timestamp) || 0);
        if (tsDiff !== 0) return tsDiff;
        return String(b?.id ?? '').localeCompare(String(a?.id ?? ''));
    });
}

function loadHistory() {
    try {
        const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return sortHistoryDesc(parsed.map(normalizeHistoryEntry)).slice(0, HISTORY_MAX_ITEMS);
    } catch {
        return [];
    }
}

function saveHistory(entries) {
    try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(entries));
    } catch {
        // Ignore localStorage write errors.
    }
}

function formatHistoryDate(timestamp) {
    const date = new Date(Number(timestamp) || Date.now());
    return new Intl.DateTimeFormat('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(date);
}

function VolumeSlider({ label, value, setter, icon, isMuted, tone }) {
    return (
        <div className={`volume-row ${isMuted ? 'is-muted' : ''}`}>
            <i className={`ph ${icon} volume-icon`}></i>
            <div className="volume-main">
                <div className="volume-head">
                    <span className="volume-label">{label}</span>
                    <span className="volume-value">{value}%</span>
                </div>
                <input
                    type="range" min="0" max="100" value={value} onChange={(e) => setter(Number(e.target.value))}
                    className={`volume-range volume-range-${tone}`}
                />
            </div>
        </div>
    );
}

export default function SlotUI() {
    const [currentScreen, setCurrentScreen] = useState('loading'); 
    const [hudDockTop, setHudDockTop] = useState(null);
    
    const [activeTab, setActiveTab] = useState('');
    const [alertConfig, setAlertConfig] = useState(null);
    const [buyModalConfig, setBuyModalConfig] = useState(null);
    const [replayWarningConfig, setReplayWarningConfig] = useState(null); 
    const [summaryModalConfig, setSummaryModalConfig] = useState(null); 
    
    // --- MODIFICACIÓN: ESTADO PARA JUGADA PENDIENTE ---
    const [pendingSpinAlert, setPendingSpinAlert] = useState(null); 

    const [summaryPage, setSummaryPage] = useState(1);
    const [isSpinning, setIsSpinning] = useState(false); 
    
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [speedLevel, setSpeedLevel] = useState(1);
    
    const [masterVolume, setMasterVolume] = useState(100);
    const [musicVolume, setMusicVolume] = useState(80);
    const [sfxVolume, setSfxVolume] = useState(100);
    const [historyEntries, setHistoryEntries] = useState(() => loadHistory());
    
    const closeAll = useCallback(() => {
        setActiveTab('');
        setAlertConfig(null);
        setBuyModalConfig(null);
        setReplayWarningConfig(null);
        setSummaryModalConfig(null);
        setPendingSpinAlert(null);
    }, []);

    const openMenu = useCallback((tab) => {
        if (activeTab === tab) { closeAll(); return; }
        setActiveTab(tab);
        if (tab === 'history') setCurrentPage(1);
    }, [activeTab, closeAll]);

    const showSmallAlert = useCallback((title, msg) => {
        closeAll();
        setAlertConfig({ title, msg });
    }, [closeAll]);

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

        // --- MODIFICACIÓN: FUNCIÓN PARA LLAMAR AL MODAL PENDIENTE DESDE PHASER ---
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

        window.reactUI = {
            isActive: activeTab !== '' || alertConfig !== null || buyModalConfig !== null || replayWarningConfig !== null || summaryModalConfig !== null || pendingSpinAlert !== null,
            speedLevel: speedLevel,
            audioConfig: { isMuted: isMuted, master: masterVolume / 100, music: musicVolume / 100, sfx: sfxVolume / 100 }
        };
    }, [activeTab, alertConfig, buyModalConfig, replayWarningConfig, summaryModalConfig, pendingSpinAlert, speedLevel, isMuted, masterVolume, musicVolume, sfxVolume, closeAll, openMenu, showSmallAlert]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => console.warn(err));
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const formatPoints = (num) => Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    const toggleSound = () => setIsMuted((prev) => !prev);

    const goToHome = () => {
        closeAll();
        if (window.gameRef && typeof window.gameRef.showLobby === 'function') {
            window.gameRef.showLobby();
        }
    };

    const totalPages = Math.max(1, Math.ceil(historyEntries.length / ITEMS_PER_PAGE));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const currentHistory = historyEntries.slice((safeCurrentPage - 1) * ITEMS_PER_PAGE, safeCurrentPage * ITEMS_PER_PAGE);
    const nextPage = () => setCurrentPage(p => Math.min(p + 1, totalPages));
    const prevPage = () => setCurrentPage(p => Math.max(Math.min(p - 1, totalPages), 1));

    const getModalTitle = () => {
        switch (activeTab) {
            case 'history': return <><i className="ph ph-clock-counter-clockwise"></i> Historial</>;
            case 'rules': return <><i className="ph ph-book-open"></i> Reglas</>;
            case 'settings': return <><i className="ph ph-gear"></i> Ajustes</>;
            default: return '';
        }
    };
    const hideRightHud = currentScreen === 'loading';
    const isRightHudBlocked = isSpinning || hideRightHud;
    const rightHudVisibilityClass = isRightHudBlocked ? 'hud-hidden' : 'hud-visible';
    const isModalOpen = Boolean(activeTab || alertConfig || buyModalConfig || replayWarningConfig || summaryModalConfig || pendingSpinAlert);

    useEffect(() => {
        const root = document.documentElement;
        if (typeof hudDockTop === 'number') {
            root.style.setProperty('--hud-dock-top', `${hudDockTop}px`);
        } else {
            root.style.removeProperty('--hud-dock-top');
        }
        root.style.setProperty('--vol-master', `${masterVolume}%`);
        root.style.setProperty('--vol-music', `${musicVolume}%`);
        root.style.setProperty('--vol-sfx', `${sfxVolume}%`);
    }, [hudDockTop, masterVolume, musicVolume, sfxVolume]);

    return (
        <div id="ui-layer">
            <div
                className={`modal-overlay ${isModalOpen ? 'active' : ''}`}
                // --- MODIFICACIÓN: NO SE PUEDE CERRAR HACIENDO CLICK AFUERA SI HAY JUGADA PENDIENTE ---
                onClick={pendingSpinAlert ? undefined : closeAll}
            >
                {(activeTab) && (
                    <div className="modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <span className="modal-title">{getModalTitle()}</span>
                            <i className="ph ph-x close-icon" onClick={closeAll}></i>
                        </div>
                        <div className="modal-content-area">
                            {activeTab === 'history' && (
                                <div className="tab-pane active tab-pane-history">
                                    <div className="history-table-wrap">
                                        <table className="history-table">
                                            <thead>
                                                <tr className="history-head-row">
                                                    <th className="history-head-cell">Fecha</th>
                                                    <th className="history-head-cell">N°Ticket</th>
                                                    <th className="history-head-cell">Precio</th>
                                                    <th className="history-head-cell">Premio</th>
                                                    <th className="history-head-cell history-head-cell-center"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentHistory.length === 0 && (
                                                    <tr>
                                                        <td colSpan={5} className="history-empty-row">
                                                            Aún no hay jugadas registradas.
                                                        </td>
                                                    </tr>
                                                )}
                                                {currentHistory.map((item, index) => (
                                                    <tr key={`${item.id}-${item.timestamp}-${index}`} className="history-row">
                                                        <td className="history-cell">{formatHistoryDate(item.timestamp)}</td>
                                                        <td className="history-cell">{item.id}</td>
                                                        <td className="history-cell">${formatPoints(item.bet)}</td>
                                                        <td className={`history-cell ${item.win > 0 ? 'history-cell-win' : 'history-cell-muted'}`}>
                                                            {item.win > 0 ? `$${formatPoints(item.win)}` : 'Sin premio'}
                                                        </td>
                                                        <td className="history-cell history-cell-action">
                                                            <button className="btn-replay" onClick={() => {
                                                                closeAll();
                                                                setTimeout(() => {
                                                                    if (window.gameRef) window.gameRef.setupReplay({ bet: item.bet, win: item.win }, 'history');
                                                                }, 50);
                                                            }}>
                                                                <i className="ph ph-play-circle"></i> Ver
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="pager-row">
                                        <button className="shop-btn-adjust shop-btn-small" disabled={safeCurrentPage === 1} onClick={prevPage}><i className="ph ph-caret-left"></i></button>
                                        <span className="pager-label">Pág {safeCurrentPage} de {totalPages}</span>
                                        <button className="shop-btn-adjust shop-btn-small" disabled={safeCurrentPage === totalPages} onClick={nextPage}><i className="ph ph-caret-right"></i></button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'rules' && (
                                <div className="tab-pane active">
                                    <h4 className="rules-title">Reglas del Juego</h4>
                                    <p className="rules-copy">
                                        Los premios se calculan encontrando <strong>Grupos (Clusters)</strong> de figuras iguales. 
                                        Para ganar, necesitas un mínimo de <strong>4 figuras conectadas</strong> horizontal o verticalmente. El premio final multiplica tu Apuesta.
                                    </p>
                                    <div className="info-row"><span className="info-label">Jackpot Máximo</span><span className="info-val info-val-jackpot">Hasta x500</span></div>
                                    <div className="info-row"><span className="info-label">Grupo de 9+ Figuras</span><span className="info-val">Apuesta x10 a x500</span></div>
                                    <div className="info-row"><span className="info-label">Grupo de 4 Figuras</span><span className="info-val">Apuesta x0.2 a x5.0</span></div>
                                </div>
                            )}

                            {activeTab === 'settings' && (
                                <div className="tab-pane active">
                                    <div className="settings-section">
                                        <div className="settings-head">
                                            <i className="ph ph-gauge settings-head-icon"></i>
                                            <span className="settings-head-title">Velocidad de Juego</span>
                                        </div>
                                        <div className="settings-speed-row">
                                            <button className={`settings-speed-btn ${speedLevel === 1 ? 'is-active' : ''}`} onClick={() => setSpeedLevel(1)}>Normal</button>
                                            <button className={`settings-speed-btn ${speedLevel === 2 ? 'is-active' : ''}`} onClick={() => setSpeedLevel(2)}>Rápido</button>
                                            <button className={`settings-speed-btn settings-speed-btn-turbo ${speedLevel === 3 ? 'is-active' : ''}`} onClick={() => setSpeedLevel(3)}>Turbo <i className="ph ph-lightning settings-speed-icon"></i></button>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="settings-audio-head">
                                            <div className="settings-head">
                                                <i className="ph ph-speaker-high settings-head-icon"></i>
                                                <span className="settings-head-title">Configuración de Audio</span>
                                            </div>
                                            <button onClick={toggleSound} className={`audio-toggle-btn ${isMuted ? 'is-muted' : ''}`}>
                                                <i className={isMuted ? "ph ph-speaker-slash" : "ph ph-speaker-high"}></i> {isMuted ? 'Muteado' : 'Silenciar Todo'}
                                            </button>
                                        </div>
                                        <div className="settings-audio-panel">
                                            <VolumeSlider label="Volumen Maestro" value={masterVolume} setter={setMasterVolume} icon="ph-faders" isMuted={isMuted} tone="master" />
                                            <VolumeSlider label="Música de Fondo" value={musicVolume} setter={setMusicVolume} icon="ph-music-notes" isMuted={isMuted} tone="music" />
                                            <VolumeSlider label="Efectos de Sonido" value={sfxVolume} setter={setSfxVolume} icon="ph-coin" isMuted={isMuted} tone="sfx" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                {alertConfig && (
                    <div className="modal-alert modal-alert-basic" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-alert-title">{alertConfig.title}</h3>
                        <p className="modal-alert-text">{alertConfig.msg}</p>
                        <button className="btn-confirm" onClick={closeAll}>Aceptar</button>
                    </div>
                )}

                {buyModalConfig && (
                    <div className="modal-alert modal-alert-buy" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-buy-title">Visualizar Jugadas</h2>
                        <p className="modal-buy-copy">
                            Compraste <strong>{buyModalConfig.qty} jugadas</strong> por ${formatPoints(buyModalConfig.cost)}.<br />Elige cómo quieres visualizarlas:
                        </p>
                        <div className="buy-options-layout">
                            <div
                                className="buy-option-card"
                                onClick={() => {
                                    closeAll();
                                    if (window.gameRef) window.gameRef.startAutoReveal(buyModalConfig.qty, buyModalConfig.cost);
                                }}
                            >
                                <div className="buy-option-head">
                                    <i className="ph ph-ticket buy-option-icon"></i>
                                    <h3 className="buy-option-title">Automática</h3>
                                </div>
                                <p className="buy-option-copy">Resultados inmediatos con opción a repetición.</p>
                            </div>
                            <div
                                className="buy-option-card"
                                onClick={() => {
                                    closeAll();
                                    if (window.gameRef) window.gameRef.startManualMode(buyModalConfig.qty, buyModalConfig.betVal, buyModalConfig.cost);
                                }}
                            >
                                <div className="buy-option-head">
                                    <i className="ph ph-youtube-logo buy-option-icon"></i>
                                    <h3 className="buy-option-title">Manual</h3>
                                </div>
                                <p className="buy-option-copy">Jugadas una por una en la pantalla de juego.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- MODIFICACIÓN: MODAL JUGADA PENDIENTE --- */}
                {pendingSpinAlert && (
                    <div className="modal-alert modal-alert-pending" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-alert-title">Jugada Pendiente</h3>
                        <p className="modal-alert-text">
                            Tienes una jugada pendiente de visualización. Por favor aceptar para continuar.
                        </p>
                        <button className="btn-confirm" onClick={() => {
                            const savedData = pendingSpinAlert;
                            closeAll();
                            setTimeout(() => {
                                if (window.gameRef) window.gameRef.playPendingSpin(savedData);
                            }, 100);
                        }}>Aceptar</button>
                    </div>
                )}

                {replayWarningConfig && (
                    <div className="modal-alert modal-alert-replay" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-alert-title">Repetición de Jugada</h3>
                        <p className="modal-alert-text">
                            Esta es una repetición de una jugada ya realizada.
                        </p>
                        <button className="btn-confirm" onClick={closeAll}>Continuar</button>
                    </div>
                )}

                {summaryModalConfig && (
                    <div className="modal-alert modal-alert-summary" onClick={(e) => e.stopPropagation()}>
                        <div className="summary-head">
                            <i className="ph ph-clipboard-text summary-head-icon"></i>
                            <h2 className="summary-head-title">Resumen</h2>
                        </div>

                        <div className="summary-table-wrap">
                            <table className="summary-table">
                                <thead>
                                    <tr className="summary-table-head-row">
                                        <th className="summary-table-head-cell">N°Jugada</th>
                                        <th className="summary-table-head-cell">Precio</th>
                                        <th className="summary-table-head-cell">Resultado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {summaryModalConfig.slice((summaryPage - 1) * 5, summaryPage * 5).map((item, index) => (
                                        <tr key={index} className="summary-table-row">
                                            <td className="summary-table-cell">{item.spinNum}</td>
                                            <td className="summary-table-cell">${formatPoints(item.bet)}</td>
                                            <td className={`summary-table-cell ${item.win > 0 ? 'summary-table-cell-win' : 'summary-table-cell-muted'}`}>
                                                {item.win > 0 ? `$${formatPoints(item.win)}` : 'Sin premio'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {summaryModalConfig.length > 5 && (
                            <div className="pager-row pager-row-summary">
                                <button className="shop-btn-adjust shop-btn-small" disabled={summaryPage === 1} onClick={() => setSummaryPage(p => Math.max(p - 1, 1))}><i className="ph ph-caret-left"></i></button>
                                <span className="pager-label">Pág {summaryPage} de {Math.ceil(summaryModalConfig.length / 5)}</span>
                                <button className="shop-btn-adjust shop-btn-small" disabled={summaryPage === Math.ceil(summaryModalConfig.length / 5)} onClick={() => setSummaryPage(p => Math.min(p + 1, Math.ceil(summaryModalConfig.length / 5)))}><i className="ph ph-caret-right"></i></button>
                            </div>
                        )}

                        <div className="summary-actions">
                            <button
                                className="summary-action-btn"
                                onClick={() => {
                                    closeAll();
                                    if (window.gameRef) window.gameRef.showLobby();
                                    setTimeout(() => openMenu('history'), 50);
                                }}
                                title="Ver Historial"
                            ><i className="ph ph-clock-counter-clockwise summary-action-icon"></i></button>
                            <button
                                className="summary-action-btn"
                                onClick={() => {
                                    closeAll();
                                    if (window.gameRef) window.gameRef.showLobby();
                                }}
                                title="Volver al Inicio"
                            ><i className="ph ph-house summary-action-icon"></i></button>
                        </div>
                    </div>
                )}
            </div>

            <div className={`pos-top-right hud-right ${rightHudVisibilityClass}`}>
                <button className="hud-btn" onClick={toggleFullscreen} title="Pantalla Completa">
                    <i className={isFullscreen ? "ph ph-corners-in" : "ph ph-corners-out"}></i>
                </button>
            </div>

            <div
                className={`pos-bottom-right hud-right ${rightHudVisibilityClass} ${typeof hudDockTop === 'number' ? 'hud-docked' : ''}`}
            >
                <button className={`hud-btn ${activeTab === 'history' ? 'active-hud' : ''}`} onClick={() => openMenu('history')} title="Historial">
                    <i className="ph ph-clock-counter-clockwise"></i>
                </button>
                <button className={`hud-btn ${activeTab === 'rules' ? 'active-hud' : ''}`} onClick={() => openMenu('rules')} title="Reglas">
                    <i className="ph ph-book-open"></i>
                </button>
                <button className={`hud-btn ${activeTab === 'settings' ? 'active-hud' : ''}`} onClick={() => openMenu('settings')} title="Ajustes">
                    <i className="ph ph-gear"></i>
                </button>
                <button className="hud-btn" onClick={toggleSound} title={isMuted ? "Activar Sonido" : "Silenciar"}>
                    <i className={isMuted ? "ph ph-speaker-slash" : "ph ph-speaker-high"}></i>
                </button>
                
                <button className="hud-btn" onClick={goToHome} title="Inicio">
                    <i className="ph ph-house"></i>
                </button>
            </div>
        </div>
    );
}
