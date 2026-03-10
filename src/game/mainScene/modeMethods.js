import { BET_VALUES, CELL_H, CELL_W } from './constants';

const MANUAL_PACK_PENDING_KEY = 'frutilla_pending_manual_pack_v1';
const SINGLE_SPIN_PENDING_KEY = 'frutilla_pending_spin';

/**
 * Restringe un valor numérico a un rango mínimo y máximo.
 * Parámetros:
 * - `value` (any): Valor a guardar en localStorage.
 * - `min` (number): Valor mínimo permitido.
 * - `max` (number): Valor máximo permitido.
 */
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Lee y parsea un valor JSON desde localStorage de forma segura.
 * Parámetros:
 * - `key` (string): Clave a leer/escribir en localStorage.
 */
function readJSONStorage(key) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

/**
 * Serializa y guarda un valor JSON en localStorage de forma segura.
 * Parámetros:
 * - `key` (string): Clave a leer/escribir en localStorage.
 * - `value` (any): Valor a guardar en localStorage.
 */
function writeJSONStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Ignore storage write failures.
    }
}

/**
 * Elimina una clave de localStorage de forma segura.
 * Parámetros:
 * - `key` (string): Clave a leer/escribir en localStorage.
 */
function removeStorageKey(key) {
    try {
        localStorage.removeItem(key);
    } catch {
        // Ignore storage remove failures.
    }
}

/**
 * Valida y normaliza la estructura de un pendiente manual.
 * Parámetros:
 * - `data` (object): Datos de entrada a validar o animar.
 */
function normalizeManualPending(data) {
    if (!data || typeof data !== 'object') return null;

    const total = Number(data.total);
    if (!Number.isFinite(total) || total < 1) return null;

    const results = Array.isArray(data.results)
        ? data.results
              .map((item) => ({
                  spinNum: Number(item?.spinNum) || 0,
                  bet: Number(item?.bet) || 0,
                  win: Number(item?.win) || 0
              }))
              .filter((item) => item.spinNum > 0)
        : [];

    if (results.length >= total) return null;

    const current = clamp(Number(data.current) || 1, 1, total);
    const bet = Number(data.bet);
    const safeBet = Number.isFinite(bet) && bet > 0 ? bet : BET_VALUES[0];
    const spinData = data.spinData && typeof data.spinData === 'object' ? data.spinData : null;
    const hasActiveSpin = Boolean(data.hasActiveSpin && spinData);

    return {
        mode: 'tickets-manual',
        total,
        current,
        bet: safeBet,
        results,
        hasActiveSpin,
        spinData: hasActiveSpin ? spinData : null
    };
}

/**
 * Carga y normaliza desde storage el pendiente de pack manual.
 * No requiere parámetros.
 */
function loadManualPackPending() {
    const parsed = readJSONStorage(MANUAL_PACK_PENDING_KEY);
    const normalized = normalizeManualPending(parsed);
    if (!normalized && parsed) {
        removeStorageKey(MANUAL_PACK_PENDING_KEY);
    }
    return normalized;
}

/**
 * Persiste en storage el estado pendiente manual ya normalizado.
 * Parámetros:
 * - `state` (object): Estado manual a persistir.
 */
function saveManualPackPending(state) {
    const normalized = normalizeManualPending(state);
    if (!normalized) {
        removeStorageKey(MANUAL_PACK_PENDING_KEY);
        return;
    }
    writeJSONStorage(MANUAL_PACK_PENDING_KEY, normalized);
}

/**
 * Guarda snapshot del progreso manual actual en storage.
 * Parámetros:
 * - `scene` (object): Instancia de la escena principal.
 * - `overrides` (object, opcional): Sobrescrituras puntuales sobre un estado base.
 */
function persistManualPackState(scene, overrides = {}) {
    saveManualPackPending({
        mode: 'tickets-manual',
        total: scene.manualTotal,
        current: scene.manualCurrent,
        bet: scene.manualBet,
        results: scene.manualResults,
        hasActiveSpin: false,
        spinData: null,
        ...overrides
    });
}

/**
 * Elimina del storage el estado pendiente del pack manual.
 * No requiere parámetros.
 */
function clearManualPackPending() {
    removeStorageKey(MANUAL_PACK_PENDING_KEY);
}

/**
 * Carga desde storage una jugada individual pendiente.
 * No requiere parámetros.
 */
function loadSingleSpinPending() {
    const parsed = readJSONStorage(SINGLE_SPIN_PENDING_KEY);
    if (!parsed || typeof parsed !== 'object') return null;
    if (!parsed.data || typeof parsed.data !== 'object') return null;
    return parsed;
}

/**
 * Prepara visibilidad de capas para mostrar el tablero en modos especiales.
 * Parámetros:
 * - `scene` (object): Instancia de la escena principal.
 */
function applyModeGameView(scene) {
    scene.hideAllLayers();
    scene.bg.clearTint();
    scene.layerGame.setVisible(true).setAlpha(1);
    scene.layerUI.setVisible(true).setAlpha(1);
    scene.layerJackpot.setVisible(true).setAlpha(1);
    scene.layerTopText.setVisible(true).setAlpha(1);
}

/**
 * Renderiza una grilla resultado y dispara la secuencia de caída de símbolos.
 * Parámetros:
 * - `scene` (object): Instancia de la escena principal.
 * - `data` (object): Datos de entrada a validar o animar.
 * - `timings` (object): Duraciones y delays para animación de símbolos.
 */
function playSpinAnimation(scene, data, timings) {
    const { animDuration, colDelay, rowDelay } = timings;
    const resultGrid = data.grid;
    const totalWin = data.totalWin;
    const winGroups = data.winGroups;

    for (let c = 0; c < 5; c++) {
        for (let r = 0; r < 5; r++) {
            const sym = scene.symbolsMatrix[c][r];
            sym.setTexture('symbols', resultGrid[c][r].toString());
            sym.clearTint();
            const targetScale = Math.min((CELL_W * 0.8) / sym.width, (CELL_H * 0.8) / sym.height);
            sym.baseScale = targetScale;
            sym.setScale(targetScale);
            sym.setAlpha(1);
            sym.x = sym.homeX;
            sym.y = sym.homeY - 800;

            const delay = c * colDelay + r * rowDelay;
            scene.tweens.add({
                targets: sym,
                y: sym.homeY,
                duration: animDuration,
                delay,
                ease: 'Back.out',
                onComplete: () => {
                    if (c === 4 && r === 4) {
                        scene.endSpin(totalWin, winGroups);
                    }
                }
            });
        }
    }
}

/**
 * Configura controles visibles para operar en modo manual.
 * Parámetros:
 * - `scene` (object): Instancia de la escena principal.
 */
function setupManualModeView(scene) {
    applyModeGameView(scene);
    scene.uiElements.controlsGroup.setVisible(false);
    scene.uiElements.replayControlsGroup.setVisible(false);
    scene.replayTitleBox.setVisible(false);
    scene.uiElements.manualControlsGroup.setVisible(true);
}

/**
 * Indica si existe un pack manual pendiente por continuar.
 * No requiere parámetros.
 */
export function hasPendingManualPack() {
    return Boolean(loadManualPackPending());
}

/**
 * Obtiene payload de reanudación priorizando jugada simple y luego pack manual.
 * No requiere parámetros.
 */
export function getPendingResumePayload() {
    const singleSpinPending = loadSingleSpinPending();
    if (singleSpinPending) return singleSpinPending;

    const manualPackPending = loadManualPackPending();
    if (manualPackPending) {
        return {
            mode: 'tickets-manual',
            pack: manualPackPending
        };
    }

    return null;
}

/**
 * Indica si hay cualquier jugada pendiente por reanudar.
 * No requiere parámetros.
 */
export function hasAnyPendingPlay() {
    return Boolean(getPendingResumePayload());
}

/**
 * Resuelve automáticamente todos los tickets del pack comprado.
 * Parámetros:
 * - `qty` (number): Cantidad de tickets/cartas a procesar.
 * - `totalCost` (number): Costo total del pack comprado.
 */
export function startAutoReveal(qty, totalCost) {
        this.balance -= totalCost;
        this.uiElements.contBalance.val.setText("$" + this.formatPoints(this.balance));
        this.addJackpotContribution(totalCost);

        this.currentShopWin = 0;
        this.shopTotalWinBox.val.setText("$0");
        this.shopTotalWinBox.container.setVisible(true);

        const betVal = BET_VALUES[this.currentBetIndex];

        for (let i = 0; i < qty; i++) {
            if(!this.shopCards[i]) break;
            const card = this.shopCards[i];
            
            const mockData = this.generateMockSpin(betVal);
            card.replayData = mockData;
            card.replayBet = betVal;
            card.ticketId = this.generateTicketId();
            if (card.ticketTag) {
                card.ticketTag.setText(`TICKET ${i + 1}`);
                card.ticketTag.setVisible(true);
            }

            this.time.delayedCall(i * 280, () => {
                this.tweens.add({
                    targets: card, scaleX: 0, duration: 220, yoyo: true,
                    onYoyo: () => {
                        const cm = card.contentMetrics || this.getShopCardContentMetrics(card.cardW, card.cardH);
                        const prize = card.replayData.totalWin;
                        const isWin = prize > 0;

                        this.addHistoryEntry({
                            ticketId: card.ticketId,
                            bet: betVal,
                            win: prize,
                            mode: 'tickets-auto'
                        });

                        this.currentShopWin += prize;
                        this.shopTotalWinBox.val.setText("$" + this.formatPoints(this.currentShopWin));
                        
                        if (isWin) {
                            if (window.playPackWinSfx) window.playPackWinSfx();
                            this.balance += prize;
                            this.uiElements.contBalance.val.setText("$" + this.formatPoints(this.balance));

                            this.tweens.add({
                                targets: this.shopTotalWinBox.val, scaleX: 1.2, scaleY: 1.2, duration: 100, yoyo: true
                            });
                        } else if (window.playPackLoseSfx) {
                            window.playPackLoseSfx();
                        }

                        card.bg.clear();
                        card.bg.fillStyle(isWin ? 0x1e3a8a : 0x222222, 1); 
                        card.bg.lineStyle(2, isWin ? 0xFFD700 : 0x555555, 1);
                        card.bg.fillRoundedRect(-card.cardW/2, -card.cardH/2, card.cardW, card.cardH, 10);
                        card.bg.strokeRoundedRect(-card.cardW/2, -card.cardH/2, card.cardW, card.cardH, 10);
                        
                        card.txt.setText(isWin ? `PREMIO\n$${this.formatPoints(prize)}` : `SIN\nPREMIO`);
                        card.txt.setFontSize(`${isWin ? cm.winFont : cm.loseFont}px`);
                        card.txt.setColor(isWin ? '#FFD700' : '#888888');
                        card.txt.setY(cm.resultTextY);
                        card.txt.setLineSpacing(cm.lineSpacing);
                        if (isWin) {
                            const maxTextWidth = Math.max(38, card.cardW - 12);
                            let fitFont = cm.winFont;
                            while (fitFont > cm.minWinFont && card.txt.width > maxTextWidth) {
                                fitFont -= 1;
                                card.txt.setFontSize(`${fitFont}px`);
                            }
                        }

                        card.btnVerBg.clear();
                        card.btnVerBg.fillStyle(0x00C853, 1); 
                        card.btnVerBg.lineStyle(1, 0xffffff, 0.8);
                        card.btnVerBg.fillRoundedRect(-(cm.verBtnWidth / 2), cm.verBtnTopY, cm.verBtnWidth, cm.verBtnHeight, cm.verBtnRadius);
                        card.btnVerBg.strokeRoundedRect(-(cm.verBtnWidth / 2), cm.verBtnTopY, cm.verBtnWidth, cm.verBtnHeight, cm.verBtnRadius);
                        card.btnVerTxt.setY(cm.verBtnCenterY);
                        card.btnVerTxt.setFontSize(`${cm.verBtnFont}px`);
                        card.btnVerBg.setVisible(true);
                        card.btnVerTxt.setVisible(true);

                        card.hit.setInteractive({cursor:'pointer'});
                        card.hit.removeAllListeners('pointerup');
                        card.hit.on('pointerup', () => {
                            if(this.isSpinning) return;
                            if (window.playButtonSfx) window.playButtonSfx();
                            if(window.gameRef) window.gameRef.setupReplay({ replayData: card.replayData, replayBet: card.replayBet }, 'shop');
                        });
                    }
                });
            });
        }
    }

/**
 * Inicializa modo manual para abrir tickets uno por uno.
 * Parámetros:
 * - `qty` (number): Cantidad de tickets/cartas a procesar.
 * - `betVal` (number): Valor de apuesta aplicado al modo manual.
 * - `totalCost` (number): Costo total del pack comprado.
 */
export function startManualMode(qty, betVal, totalCost) {
        this.balance -= totalCost;
        this.uiElements.contBalance.val.setText("$" + this.formatPoints(this.balance));
        this.addJackpotContribution(totalCost);

        this.isManualMode = true;
        this.manualTotal = qty;
        this.manualCurrent = 1;
        this.manualBet = betVal;
        this.manualResults = [];
        this.manualAccumulatedWin = 0;

        persistManualPackState(this, {
            current: 1,
            hasActiveSpin: false,
            spinData: null
        });

        setupManualModeView(this);
        this.uiElements.btnManualNext.setVisible(false); 
        
        this.uiElements.lblManualStatus.setText(`JUGADA ${this.manualCurrent} DE ${this.manualTotal}`);
        this.uiElements.manualBetBox.val.setText("$" + this.formatPoints(this.manualBet));
        this.uiElements.contWin.val.setText("$0");
        this.uiElements.contWin.val.setFontSize('40px');
        this.uiElements.contWin.val.setColor('#FFF');
        
        this.resetBoardState();
        this.applyResponsiveLayout({ width: this.scale.width, height: this.scale.height });
        if (window.setCurrentScreen) window.setCurrentScreen('game');

        this.time.delayedCall(400, () => {
            this.executeManualSpin();
        });
    }

/**
 * Ejecuta la siguiente jugada del modo manual.
 * No requiere parámetros.
 */
export function executeManualSpin() {
        if(this.isSpinning) return;
        this.clearWinAnimations();
        if(window.setReactSpinning) window.setReactSpinning(true);

        this.isSpinning = true;
        this.uiElements.btnManualNext.setVisible(false); 
        
        const runningManualTotal = Math.max(0, Number(this.manualAccumulatedWin) || 0);
        this.uiElements.contWin.val.setText("$" + this.formatPoints(runningManualTotal));
        this.uiElements.contWin.val.setFontSize('40px');
        this.uiElements.contWin.val.setColor(runningManualTotal > 0 ? '#FFFF00' : '#FFF');
        
        this.resetBoardState();
        for(let c=0; c<5; c++) { 
            for(let r=0; r<5; r++) { 
                this.symbolsMatrix[c][r].setAlpha(0); 
            } 
        }

        this.currentSpeedLevel = (window.reactUI && window.reactUI.speedLevel) || 1;
        let animDuration = 800; let colDelay = 120; let rowDelay = 30;

        if (this.currentSpeedLevel === 2) { animDuration = 500; colDelay = 80; rowDelay = 20; } 

        const data = this.generateMockSpin(this.manualBet);
        this.currentManualSpinWin = data.totalWin;

        persistManualPackState(this, {
            hasActiveSpin: true,
            spinData: data
        });

        playSpinAnimation(this, data, { animDuration, colDelay, rowDelay });
    }

/**
 * Cierra una jugada manual, acumula resultado y decide continuidad.
 * Parámetros:
 * - `winAmount` (number): Premio obtenido en la jugada manual.
 */
export function finishManualSpin(winAmount) {
        if (winAmount > 0) {
            if (window.playPackWinSfx) window.playPackWinSfx();
        } else if (window.playPackLoseSfx) {
            window.playPackLoseSfx();
        }
        this.manualAccumulatedWin = (Number(this.manualAccumulatedWin) || 0) + Math.max(0, Number(winAmount) || 0);
        this.uiElements.contWin.val.setText("$" + this.formatPoints(this.manualAccumulatedWin));
        this.uiElements.contWin.val.setFontSize('40px');
        this.uiElements.contWin.val.setColor(this.manualAccumulatedWin > 0 ? '#FFFF00' : '#FFF');

        this.manualResults.push({
            spinNum: this.manualCurrent,
            bet: this.manualBet,
            win: winAmount
        });

        this.addHistoryEntry({
            ticketId: this.generateTicketId(),
            bet: this.manualBet,
            win: winAmount,
            mode: 'tickets-manual'
        });

        if(this.manualCurrent < this.manualTotal) {
            persistManualPackState(this, {
                current: this.manualCurrent + 1,
                results: this.manualResults,
                hasActiveSpin: false,
                spinData: null
            });
            this.uiElements.btnManualNext.setVisible(true);
        } else {
            clearManualPackPending();
            this.time.delayedCall(500, () => {
                if(window.showSummaryModal) window.showSummaryModal(this.manualResults);
            });
        }
    }

/**
 * Reanuda una jugada pendiente desde estado persistido.
 * Parámetros:
 * - `savedData` (object): Datos persistidos de jugada pendiente.
 */
export function playPendingSpin(savedData) {
        if (savedData?.mode === 'tickets-manual') {
            const pendingPack = normalizeManualPending(savedData.pack || savedData);
            if (!pendingPack) {
                clearManualPackPending();
                if (window.showReactAlert) {
                    window.showReactAlert('Jugada pendiente', 'No se pudo restaurar la jugada pendiente.');
                }
                return;
            }

            this.isManualMode = true;
            this.isReplayMode = false;
            this.manualTotal = pendingPack.total;
            this.manualCurrent = pendingPack.current;
            this.manualBet = pendingPack.bet;
            this.manualResults = [...pendingPack.results];
            this.manualAccumulatedWin = this.manualResults.reduce((acc, result) => acc + (Number(result?.win) || 0), 0);

            setupManualModeView(this);
            this.uiElements.lblManualStatus.setText(`JUGADA ${this.manualCurrent} DE ${this.manualTotal}`);
            this.uiElements.manualBetBox.val.setText("$" + this.formatPoints(this.manualBet));
            this.uiElements.contWin.val.setText("$" + this.formatPoints(this.manualAccumulatedWin));
            this.uiElements.contWin.val.setFontSize('40px');
            this.uiElements.contWin.val.setColor(this.manualAccumulatedWin > 0 ? '#FFFF00' : '#FFF');
            this.resetBoardState();
            this.applyResponsiveLayout({ width: this.scale.width, height: this.scale.height });
            if (window.setCurrentScreen) window.setCurrentScreen('game');

            if (pendingPack.hasActiveSpin && pendingPack.spinData) {
                if(window.setReactSpinning) window.setReactSpinning(true);
                this.isSpinning = true;
                this.uiElements.btnManualNext.setVisible(false);
                for(let c=0; c<5; c++) { 
                    for(let r=0; r<5; r++) { 
                        this.symbolsMatrix[c][r].setAlpha(0); 
                    } 
                }
                playSpinAnimation(this, pendingPack.spinData, { animDuration: 800, colDelay: 120, rowDelay: 30 });
            } else {
                this.isSpinning = false;
                if(window.setReactSpinning) window.setReactSpinning(false);
                this.uiElements.btnManualNext.setVisible(this.manualCurrent < this.manualTotal + 1);
            }
            return;
        }

        this.showGame();

        if (savedData.ticket) {
            this.currentTicket = String(savedData.ticket);
            this.lblTicket.setText(`Ticket: #${this.currentTicket}`);
        }

        const betIdx = BET_VALUES.indexOf(savedData.bet);
        if(betIdx !== -1) {
            this.currentBetIndex = betIdx;
            this.uiElements.betBox.val.setText("$" + this.formatPoints(BET_VALUES[this.currentBetIndex]));
        }

        if(window.setReactSpinning) window.setReactSpinning(true);
        this.isSpinning = true;
        this.uiElements.spinBtn.setVisible(false); 
        this.uiElements.btnMinus.setVisible(false);
        this.uiElements.btnPlus.setVisible(false);

        this.resetBoardState();
        for(let c=0; c<5; c++) { 
            for(let r=0; r<5; r++) { 
                this.symbolsMatrix[c][r].setAlpha(0); 
            } 
        }

        playSpinAnimation(this, savedData.data, { animDuration: 800, colDelay: 120, rowDelay: 30 });
    }

/**
 * Configura la escena para reproducir una jugada histórica.
 * Parámetros:
 * - `configData` (object): Datos de configuración para replay.
 * - `source` (string): Origen del replay (por ejemplo `shop` o `history`).
 */
export function setupReplay(configData, source) {
        this.isReplayMode = true;
        this.replaySource = source;

        if (source === 'shop') {
            this.currentReplayData = configData.replayData;
            this.currentReplayBet = configData.replayBet;
        } else if (source === 'history') {
            this.currentReplayData = this.generateHistoryMockSpin(configData.bet, configData.win);
            this.currentReplayBet = configData.bet;
        }

        applyModeGameView(this);
        this.uiElements.controlsGroup.setVisible(true);
        this.uiElements.manualControlsGroup.setVisible(false);
        this.uiElements.replayControlsGroup.setVisible(false);
        this.uiElements.btnMinus.setVisible(true);
        this.uiElements.spinBtn.setVisible(true);
        this.uiElements.btnPlus.setVisible(true);
        if (this.uiElements.spinBtnLabel) {
            this.uiElements.spinBtnLabel
                .setText('↺')
                .setFontSize('64px')
                .setX(0)
                .setY(0)
                .setLineSpacing(0);
        }

        this.replayTitleBox.setVisible(true);
        const replayBetIdx = BET_VALUES.indexOf(this.currentReplayBet);
        if (replayBetIdx !== -1) {
            this.currentBetIndex = replayBetIdx;
        }
        this.uiElements.betBox.val.setText("$" + this.formatPoints(this.currentReplayBet));

        this.resetBoardState();
        if (window.setCurrentScreen) window.setCurrentScreen('game');
        this.applyResponsiveLayout({ width: this.scale.width, height: this.scale.height });

        setTimeout(() => {
            if(window.showReplayWarning) window.showReplayWarning();
        }, 100);
    }

/**
 * Sale del modo replay y restaura la interfaz normal.
 * No requiere parámetros.
 */
export function exitReplay() {
        this.replayTitleBox.setVisible(false);
        if(this.replaySource === 'shop') {
            this.showShop({ resetState: false }); 
        } else {
            this.showLobby();
            if(window.openHistoryMenu) window.openHistoryMenu();
        }
    }

/**
 * Ejecuta la reproducción de una jugada cargada en modo replay.
 * No requiere parámetros.
 */
export async function executeReplay() {
        this.clearWinAnimations();
        if(this.isSpinning) return;
        if(window.setReactSpinning) window.setReactSpinning(true);

        this.isSpinning = true;
        this.uiElements.spinBtn.setVisible(false); 
        this.uiElements.btnMinus.setVisible(false);
        this.uiElements.btnPlus.setVisible(false);
        
        this.resetBoardState();
        for(let c=0; c<5; c++) { 
            for(let r=0; r<5; r++) { 
                this.symbolsMatrix[c][r].setAlpha(0); 
            } 
        }

        this.currentSpeedLevel = (window.reactUI && window.reactUI.speedLevel) || 1;
        let animDuration = 800; let colDelay = 120; let rowDelay = 30;

        if (this.currentSpeedLevel === 2) { animDuration = 500; colDelay = 80; rowDelay = 20; } 

        playSpinAnimation(this, this.currentReplayData, { animDuration, colDelay, rowDelay });
    }
