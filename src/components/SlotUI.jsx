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

function VolumeSlider({ label, value, setter, icon, isMuted }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', opacity: isMuted ? 0.4 : 1, pointerEvents: isMuted ? 'none' : 'auto', transition: 'opacity 0.2s' }}>
            <i className={`ph ${icon}`} style={{ fontSize: '24px', color: 'var(--text-muted)', width: '30px' }}></i>
            <div style={{ flexGrow: 1, padding: '0 15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '14px', color: 'white' }}>{label}</span>
                    <span style={{ fontSize: '12px', color: 'var(--accent-blue)' }}>{value}%</span>
                </div>
                <input
                    type="range" min="0" max="100" value={value} onChange={(e) => setter(Number(e.target.value))}
                    style={{ width: '100%', appearance: 'none', height: '6px', background: `linear-gradient(90deg, var(--accent-blue) ${value}%, #333 ${value}%)`, borderRadius: '3px', outline: 'none' }}
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

    return (
        <div id="ui-layer" style={{ pointerEvents: 'none' }}>
            
            <div 
                className={`modal-overlay ${activeTab || alertConfig || buyModalConfig || replayWarningConfig || summaryModalConfig || pendingSpinAlert ? 'active' : ''}`} 
                // --- MODIFICACIÓN: NO SE PUEDE CERRAR HACIENDO CLICK AFUERA SI HAY JUGADA PENDIENTE ---
                onClick={pendingSpinAlert ? undefined : closeAll}
                style={{ display: (activeTab || alertConfig || buyModalConfig || replayWarningConfig || summaryModalConfig || pendingSpinAlert) ? 'flex' : 'none', pointerEvents: 'auto' }} 
            >
                {(activeTab) && (
                    <div className="modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <span className="modal-title">{getModalTitle()}</span>
                            <i className="ph ph-x close-icon" onClick={closeAll}></i>
                        </div>
                        <div className="modal-content-area">
                            {activeTab === 'history' && (
                                <div className="tab-pane active" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <div style={{ overflowX: 'auto', flexGrow: 1 }}>
                                        <table style={{ width: '100%', color: 'white', textAlign: 'left', borderCollapse: 'collapse', fontSize: '13px' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid #333', color: 'var(--text-muted)' }}>
                                                    <th style={{ padding: '10px 5px' }}>Fecha</th>
                                                    <th style={{ padding: '10px 5px' }}>N°Ticket</th>
                                                    <th style={{ padding: '10px 5px' }}>Precio</th>
                                                    <th style={{ padding: '10px 5px' }}>Premio</th>
                                                    <th style={{ padding: '10px 5px', textAlign: 'center' }}></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentHistory.length === 0 && (
                                                    <tr>
                                                        <td colSpan={5} style={{ padding: '24px 5px', color: 'var(--text-muted)', textAlign: 'center' }}>
                                                            Aún no hay jugadas registradas.
                                                        </td>
                                                    </tr>
                                                )}
                                                {currentHistory.map((item, index) => (
                                                    <tr key={`${item.id}-${item.timestamp}-${index}`} style={{ borderBottom: '1px solid #222' }}>
                                                        <td style={{ padding: '12px 5px' }}>{formatHistoryDate(item.timestamp)}</td>
                                                        <td style={{ padding: '12px 5px' }}>{item.id}</td>
                                                        <td style={{ padding: '12px 5px' }}>${formatPoints(item.bet)}</td>
                                                        <td style={{ padding: '12px 5px', color: item.win > 0 ? '#e3b341' : 'var(--text-muted)', fontWeight: item.win > 0 ? 'bold' : 'normal' }}>
                                                            {item.win > 0 ? `$${formatPoints(item.win)}` : 'Sin premio'}
                                                        </td>
                                                        <td style={{ padding: '8px 5px', textAlign: 'center' }}>
                                                            <button className="btn-replay" onClick={() => {
                                                                closeAll(); 
                                                                setTimeout(() => {
                                                                    if(window.gameRef) window.gameRef.setupReplay({ bet: item.bet, win: item.win }, 'history');
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
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '15px', gap: '15px' }}>
                                        <button className="shop-btn-adjust" style={{ width: '35px', height: '35px', opacity: safeCurrentPage === 1 ? 0.3 : 1 }} disabled={safeCurrentPage === 1} onClick={prevPage}><i className="ph ph-caret-left"></i></button>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 'bold' }}>Pág {safeCurrentPage} de {totalPages}</span>
                                        <button className="shop-btn-adjust" style={{ width: '35px', height: '35px', opacity: safeCurrentPage === totalPages ? 0.3 : 1 }} disabled={safeCurrentPage === totalPages} onClick={nextPage}><i className="ph ph-caret-right"></i></button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'rules' && (
                                <div className="tab-pane active">
                                    <h4 style={{ marginTop: 0, color: 'var(--text-main)', marginBottom: '15px', fontSize: '20px' }}>Reglas del Juego</h4>
                                    <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '25px', lineHeight: '1.5' }}>
                                        Los premios se calculan encontrando <strong>Grupos (Clusters)</strong> de figuras iguales. 
                                        Para ganar, necesitas un mínimo de <strong>4 figuras conectadas</strong> horizontal o verticalmente. El premio final multiplica tu Apuesta.
                                    </p>
                                    <div className="info-row"><span className="info-label">Jackpot Máximo</span><span className="info-val" style={{ color: '#e3b341' }}>Hasta x500</span></div>
                                    <div className="info-row"><span className="info-label">Grupo de 9+ Figuras</span><span className="info-val">Apuesta x10 a x500</span></div>
                                    <div className="info-row"><span className="info-label">Grupo de 4 Figuras</span><span className="info-val">Apuesta x0.2 a x5.0</span></div>
                                </div>
                            )}

                            {activeTab === 'settings' && (
                                <div className="tab-pane active">
                                    <div style={{ paddingBottom: '20px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                                            <i className="ph ph-gauge" style={{ fontSize: '24px', color: 'var(--text-main)', marginRight: '10px' }}></i>
                                            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>Velocidad de Juego</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: speedLevel === 1 ? 'var(--accent-blue)' : 'var(--panel-color)', color: speedLevel === 1 ? 'white' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }} onClick={() => setSpeedLevel(1)}>Normal</button>
                                            <button style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: speedLevel === 2 ? 'var(--accent-blue)' : 'var(--panel-color)', color: speedLevel === 2 ? 'white' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }} onClick={() => setSpeedLevel(2)}>Rápido</button>
                                            <button style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: speedLevel === 3 ? 'var(--accent-green)' : 'var(--panel-color)', color: speedLevel === 3 ? 'white' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }} onClick={() => setSpeedLevel(3)}>Turbo <i className="ph ph-lightning" style={{marginLeft: '4px'}}></i></button>
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <i className="ph ph-speaker-high" style={{ fontSize: '24px', color: 'var(--text-main)', marginRight: '10px' }}></i>
                                                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>Configuración de Audio</span>
                                            </div>
                                            <button onClick={toggleSound} style={{ background: isMuted ? '#ff4a4a20' : 'transparent', border: `1px solid ${isMuted ? '#ff4a4a' : 'var(--border-color)'}`, color: isMuted ? '#ff4a4a' : 'white', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', transition: 'all 0.2s' }}>
                                                <i className={isMuted ? "ph ph-speaker-slash" : "ph ph-speaker-high"}></i> {isMuted ? 'Muteado' : 'Silenciar Todo'}
                                            </button>
                                        </div>
                                        <div style={{ background: 'var(--panel-color)', padding: '15px', borderRadius: '10px', border: '1px solid #222' }}>
                                            <VolumeSlider label="Volumen Maestro" value={masterVolume} setter={setMasterVolume} icon="ph-faders" isMuted={isMuted} />
                                            <VolumeSlider label="Música de Fondo" value={musicVolume} setter={setMusicVolume} icon="ph-music-notes" isMuted={isMuted} />
                                            <VolumeSlider label="Efectos de Sonido" value={sfxVolume} setter={setSfxVolume} icon="ph-coin" isMuted={isMuted} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                {alertConfig && (
                    <div className="modal-alert" onClick={(e) => e.stopPropagation()} style={{ background: 'var(--panel-color)', padding: '25px', borderRadius: '15px', border: '1px solid var(--border-color)', textAlign: 'center', maxWidth: '350px' }}>
                        <h3 style={{ color: 'white', margin: '0 0 10px 0', fontSize: '20px' }}>{alertConfig.title}</h3>
                        <p style={{ color: '#8b949e', fontSize: '15px', whiteSpace: 'pre-wrap', marginBottom: '20px' }}>{alertConfig.msg}</p>
                        <button className="btn-confirm" onClick={closeAll}>Aceptar</button>
                    </div>
                )}

                {buyModalConfig && (
                    <div className="modal-alert" onClick={(e) => e.stopPropagation()} style={{ background: '#0a0e17', padding: '30px', borderRadius: '15px', border: '1px solid var(--border-color)', textAlign: 'center', maxWidth: '500px' }}>
                        <h2 style={{ color: 'white', margin: '0 0 10px 0', fontSize: '24px' }}>Visualizar Jugadas</h2>
                        <p style={{ color: '#aaaaaa', marginBottom: '25px', fontSize: '15px' }}>
                            Compraste <strong>{buyModalConfig.qty} jugadas</strong> por ${formatPoints(buyModalConfig.cost)}.<br/>Elige cómo quieres visualizarlas:
                        </p>
                        <div className="buy-options-layout">
                            <div 
                                onClick={() => {
                                    closeAll();
                                    if(window.gameRef) window.gameRef.startAutoReveal(buyModalConfig.qty, buyModalConfig.cost);
                                }}
                                style={{ flex: 1, border: '2px solid var(--accent-blue)', borderRadius: '12px', padding: '20px', cursor: 'pointer', background: 'rgba(37, 99, 235, 0.1)', transition: 'all 0.2s', textAlign: 'left' }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(37, 99, 235, 0.3)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(37, 99, 235, 0.1)'}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                    <i className="ph ph-ticket" style={{ fontSize: '32px', color: 'white' }}></i>
                                    <h3 style={{ color: 'white', margin: 0, fontSize: '18px' }}>Automática</h3>
                                </div>
                                <p style={{ color: '#aaaaaa', fontSize: '13px', margin: 0, lineHeight: 1.4 }}>Resultados inmediatos con opción a repetición.</p>
                            </div>
                            <div 
                                onClick={() => {
                                    closeAll();
                                    if(window.gameRef) window.gameRef.startManualMode(buyModalConfig.qty, buyModalConfig.betVal, buyModalConfig.cost);
                                }}
                                style={{ flex: 1, border: '2px solid var(--accent-blue)', borderRadius: '12px', padding: '20px', cursor: 'pointer', background: 'rgba(37, 99, 235, 0.1)', transition: 'all 0.2s', textAlign: 'left' }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(37, 99, 235, 0.3)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(37, 99, 235, 0.1)'}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                    <i className="ph ph-youtube-logo" style={{ fontSize: '32px', color: 'white' }}></i>
                                    <h3 style={{ color: 'white', margin: 0, fontSize: '18px' }}>Manual</h3>
                                </div>
                                <p style={{ color: '#aaaaaa', fontSize: '13px', margin: 0, lineHeight: 1.4 }}>Jugadas una por una en la pantalla de juego.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- MODIFICACIÓN: MODAL JUGADA PENDIENTE --- */}
                {pendingSpinAlert && (
                    <div className="modal-alert" onClick={(e) => e.stopPropagation()} style={{ background: 'var(--panel-color)', padding: '25px', borderRadius: '15px', border: '1px solid #FFD700', textAlign: 'center', maxWidth: '350px' }}>
                        <h3 style={{ color: 'white', margin: '0 0 10px 0', fontSize: '20px' }}>Jugada Pendiente</h3>
                        <p style={{ color: '#8b949e', fontSize: '15px', whiteSpace: 'pre-wrap', marginBottom: '20px' }}>
                            Tienes una jugada pendiente de visualización. Por favor aceptar para continuar.
                        </p>
                        <button className="btn-confirm" onClick={() => {
                            const savedData = pendingSpinAlert;
                            closeAll(); 
                            setTimeout(() => {
                                if(window.gameRef) window.gameRef.playPendingSpin(savedData);
                            }, 100);
                        }}>Aceptar</button>
                    </div>
                )}

                {replayWarningConfig && (
                    <div className="modal-alert" onClick={(e) => e.stopPropagation()} style={{ background: 'var(--panel-color)', padding: '25px', borderRadius: '15px', border: '1px solid var(--accent-blue)', textAlign: 'center', maxWidth: '350px' }}>
                        <h3 style={{ color: 'white', margin: '0 0 10px 0', fontSize: '20px' }}>Repetición de Jugada</h3>
                        <p style={{ color: '#8b949e', fontSize: '15px', whiteSpace: 'pre-wrap', marginBottom: '20px' }}>
                            Esta es una repetición de una jugada ya realizada.
                        </p>
                        <button className="btn-confirm" onClick={closeAll}>Continuar</button>
                    </div>
                )}

                {summaryModalConfig && (
                    <div className="modal-alert" onClick={(e) => e.stopPropagation()} style={{ background: '#0a0e17', padding: '30px', borderRadius: '15px', border: '1px solid #333', width: '100%', maxWidth: '500px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
                            <i className="ph ph-clipboard-text" style={{ fontSize: '28px', color: 'white', marginRight: '10px' }}></i>
                            <h2 style={{ color: 'white', margin: 0, fontSize: '22px' }}>Resumen</h2>
                        </div>
                        
                        <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
                            <table style={{ width: '100%', color: 'white', textAlign: 'left', borderCollapse: 'collapse', fontSize: '14px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #333', color: 'var(--text-muted)' }}>
                                        <th style={{ padding: '10px 5px' }}>N°Jugada</th>
                                        <th style={{ padding: '10px 5px' }}>Precio</th>
                                        <th style={{ padding: '10px 5px' }}>Resultado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {summaryModalConfig.slice((summaryPage - 1) * 5, summaryPage * 5).map((item, index) => (
                                        <tr key={index} style={{ borderBottom: '1px solid #222' }}>
                                            <td style={{ padding: '12px 5px' }}>{item.spinNum}</td>
                                            <td style={{ padding: '12px 5px' }}>${formatPoints(item.bet)}</td>
                                            <td style={{ padding: '12px 5px', color: item.win > 0 ? '#FFD700' : 'var(--text-muted)', fontWeight: item.win > 0 ? 'bold' : 'normal' }}>
                                                {item.win > 0 ? `$${formatPoints(item.win)}` : 'Sin premio'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {summaryModalConfig.length > 5 && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '25px', gap: '15px' }}>
                                <button className="shop-btn-adjust" style={{ width: '35px', height: '35px', opacity: summaryPage === 1 ? 0.3 : 1 }} disabled={summaryPage === 1} onClick={() => setSummaryPage(p => Math.max(p - 1, 1))}><i className="ph ph-caret-left"></i></button>
                                <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 'bold' }}>Pág {summaryPage} de {Math.ceil(summaryModalConfig.length / 5)}</span>
                                <button className="shop-btn-adjust" style={{ width: '35px', height: '35px', opacity: summaryPage === Math.ceil(summaryModalConfig.length / 5) ? 0.3 : 1 }} disabled={summaryPage === Math.ceil(summaryModalConfig.length / 5)} onClick={() => setSummaryPage(p => Math.min(p + 1, Math.ceil(summaryModalConfig.length / 5)))}><i className="ph ph-caret-right"></i></button>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                            <button 
                                style={{ width: '60px', height: '60px', borderRadius: '50%', border: '1px solid #444', background: 'transparent', color: 'white', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }} 
                                onClick={() => {
                                    closeAll();
                                    if(window.gameRef) window.gameRef.showLobby();
                                    setTimeout(() => openMenu('history'), 50);
                                }}
                                title="Ver Historial"
                            ><i className="ph ph-clock-counter-clockwise" style={{ fontSize: '28px' }}></i></button>
                            <button 
                                style={{ width: '60px', height: '60px', borderRadius: '50%', border: '1px solid #444', background: 'transparent', color: 'white', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }} 
                                onClick={() => {
                                    closeAll(); 
                                    if(window.gameRef) window.gameRef.showLobby();
                                }}
                                title="Volver al Inicio"
                            ><i className="ph ph-house" style={{ fontSize: '28px' }}></i></button>
                        </div>
                    </div>
                )}
            </div>

            <div className="pos-top-right" style={{ opacity: (isSpinning || hideRightHud) ? 0 : 1, pointerEvents: (isSpinning || hideRightHud) ? 'none' : 'auto', transition: 'opacity 0.3s', display: hideRightHud ? 'none' : 'flex' }}>
                <button className="hud-btn" onClick={toggleFullscreen} title="Pantalla Completa">
                    <i className={isFullscreen ? "ph ph-corners-in" : "ph ph-corners-out"}></i>
                </button>
            </div>

            <div
                className="pos-bottom-right"
                style={{
                    opacity: (isSpinning || hideRightHud) ? 0 : 1,
                    pointerEvents: (isSpinning || hideRightHud) ? 'none' : 'auto',
                    transition: 'opacity 0.3s',
                    display: hideRightHud ? 'none' : 'flex',
                    ...(typeof hudDockTop === 'number'
                        ? { top: `${hudDockTop}px`, bottom: 'auto', right: '8px', transform: 'none' }
                        : {})
                }}
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
