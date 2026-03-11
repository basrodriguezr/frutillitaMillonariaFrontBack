import Phaser from 'phaser';
import pozoAsset from '../assets/pozo.webp';
import { JackpotUI } from '../components/JackpotUI';
import {
    BET_VALUES,
    animateWinningSymbol,
    clearWinAnimations,
    addHistoryEntry,
    generateTicketId,
    applyResponsiveLayout,
    getBottomSystemInset,
    getViewportOverrides,
    getViewportScaleProfile,
    matchesViewportRange,
    mergeOverrideScopes,
    endSpin,
    generateHistoryMockSpin,
    generateMockSpin,
    playSequentialWins,
    resetBoardState,
    spin,
    executeManualSpin,
    executeReplay,
    exitReplay,
    finishManualSpin,
    playPendingSpin,
    setupReplay,
    startAutoReveal,
    startManualMode,
    hideAllLayers,
    resetMainBetToDefault,
    resetShopState,
    showGame,
    showLobby,
    showShop,
    buildGameGrid,
    buildLobby,
    buildUI,
    createBtn,
    createMenuButton,
    createStatBox,
    buildShop,
    drawShopCards,
    resetShopCards,
    updateShopUI
} from './mainScene/index.js';

export class MainScene extends Phaser.Scene {
    /**
     * Inicializa el estado base de la escena, banderas de juego y referencias de UI.
     * No requiere parámetros.
     */
    constructor() {
        super({ key: 'MainScene' });
        this.symbolsMatrix = []; 
        this.isSpinning = false;
        this.uiElements = {};
        this.resizeTimer = null;
        this.winTimer = null;
        this.maskShape = null; 
        this.accumulatedWin = 0;
        
        this.currentBetIndex = 0;
        this.balance = 100000;

        this.shopQty = 5; 
        this.currentShopQty = 5; 
        this.currentShopWin = 0; 
        
        this.isManualMode = false;
        this.manualTotal = 0;
        this.manualCurrent = 0;
        this.manualBet = 0;
        this.manualResults = [];
        this.manualAccumulatedWin = 0;
        this.currentManualSpinWin = 0;

        this.isReplayMode = false;
        this.replaySource = ''; 
        this.currentReplayData = null;
        this.currentReplayBet = 0;

        this.jackpotUI = null;
        this.externalJackpotUpdater = null;
    }

    /**
     * Carga texturas e imágenes necesarias antes de crear la escena.
     * No requiere parámetros.
     */
    preload() {
        if (!this.textures.exists('bg')) this.load.image('bg', 'img/backgrounds2.webp');
        if (!this.textures.exists('symbols')) this.load.image('symbols', 'img/frutas.webp');
        if (!this.textures.exists('pozo')) this.load.image('pozo', pozoAsset);
    }

    /**
     * Construye capas, UI principal, eventos y estado inicial del flujo de juego.
     * No requiere parámetros.
     */
    create() {
        window.gameRef = this;
        this.createSymbolTextures();

        this.layerBG = this.add.container(0, 0).setDepth(0);
        this.layerLobby = this.add.container(0, 0).setDepth(5); 
        this.layerShop = this.add.container(0, 0).setDepth(6); 
        this.layerGame = this.add.container(0, 0).setDepth(10);
        this.layerAnimations = this.add.container(0, 0).setDepth(15);
        this.layerUI = this.add.container(0, 0).setDepth(20);
        this.layerJackpot = this.add.container(0, 0).setDepth(25);
        this.layerTopText = this.add.container(0, 0).setDepth(50);

        const gameW = this.scale.width;
        const gameH = this.scale.height;
        this.bg = this.add.image(gameW / 2, gameH / 2, 'bg').setOrigin(0.5);

        this.jackpotUI = new JackpotUI(this, this.layerJackpot, {
            textureKey: 'pozo',
            storageKey: 'frutilla_jackpot_state_v1',
            totalContribution: 0.4,
            valueYRatio: 0.008,
            formatPoints: (num) => this.formatPoints(num)
        });
        this.jackpotUI.create();
        this.jackpotUI.restoreState();
        this.jackpotUI.updateTexts(true);
        
        this.buildLobby(); 
        this.buildGameGrid();
        this.buildUI();
        this.buildShop(); 
        this.externalJackpotUpdater = (payload) => this.setJackpotValues(payload, true);
        window.updateJackpotValues = this.externalJackpotUpdater;
        
        this.hideAllLayers(); 

        this.lblWinFloat = this.add.text(0, 0, "", {
            fontFamily: 'Luckiest Guy, Arial', fontSize: '70px', color: '#FFD700', 
            stroke: '#000', strokeThickness: 8, shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 4, fill: true }
        }).setOrigin(0.5).setVisible(false);

        this.lblLoseFloat = this.add.text(0, 0, "¡Inténtalo de nuevo!", {
            fontFamily: 'Luckiest Guy, Arial', fontSize: '45px', color: '#FFFFFF', 
            stroke: '#000', strokeThickness: 6, shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 4, fill: true }
        }).setOrigin(0.5).setVisible(false);

        this.lblTotalWinFloat = this.add.text(0, 0, "", {
            fontFamily: 'Luckiest Guy, Arial', fontSize: '85px', color: '#FFD700', 
            stroke: '#000', strokeThickness: 10, align: 'center', shadow: { offsetX: 3, offsetY: 3, color: '#000', blur: 6, fill: true }
        }).setOrigin(0.5).setVisible(false);

        this.layerTopText.add([this.lblWinFloat, this.lblLoseFloat, this.lblTotalWinFloat]); 

        this.scale.on('resize', (gameSize) => {
            clearTimeout(this.resizeTimer);
            this.resizeTimer = setTimeout(() => this.applyResponsiveLayout(gameSize), 50);
        });
        
        this.applyResponsiveLayout({ width: this.scale.width, height: this.scale.height });
        
        this.updateShopUI();
        this.showLobby();

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownScene, this);
        this.events.once(Phaser.Scenes.Events.DESTROY, this.shutdownScene, this);
    }

    /**
     * Formatea un número con separador de miles para mostrar montos en pantalla.
     * Parámetros:
     * - `num` (number): Número a formatear.
     */
    formatPoints(num) {
        return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    /**
     * Obtiene el inset inferior del sistema para evitar solapamiento con barras del dispositivo.
     * No requiere parámetros.
     */
    getBottomSystemInset() {
        return getBottomSystemInset.call(this);
    }

    /**
     * Calcula el perfil de viewport usado por las reglas de escalado responsivo.
     * Parámetros:
     * - `width` (number): Ancho actual del viewport.
     * - `height` (number): Alto actual del viewport.
     */
    getViewportScaleProfile(width, height) {
        return getViewportScaleProfile.call(this, width, height);
    }

    /**
     * Evalúa si un viewport cumple una regla de rango configurable.
     * Parámetros:
     * - `match` (object, opcional): Regla de coincidencia de viewport a evaluar.
     * - `width` (number): Ancho actual del viewport.
     * - `height` (number): Alto actual del viewport.
     * - `orientation` (string): Orientación del viewport (`portrait` o `landscape`).
     */
    matchesViewportRange(match = {}, width, height, orientation) {
        return matchesViewportRange.call(this, match, width, height, orientation);
    }

    /**
     * Fusiona dos objetos de overrides preservando configuración previa.
     * Parámetros:
     * - `base` (object, opcional): Objeto base de configuración.
     * - `incoming` (object, opcional): Objeto de configuración entrante para fusionar.
     */
    mergeOverrideScopes(base = {}, incoming = {}) {
        return mergeOverrideScopes.call(this, base, incoming);
    }

    /**
     * Resuelve overrides de layout aplicables al viewport actual.
     * Parámetros:
     * - `width` (number): Ancho actual del viewport.
     * - `height` (number): Alto actual del viewport.
     * - `viewportProfile` (object|null, opcional): Perfil de viewport precalculado.
     */
    getViewportOverrides(width, height, viewportProfile = null) {
        return getViewportOverrides.call(this, width, height, viewportProfile);
    }

    /**
     * Genera un identificador único para una jugada o ticket.
     * No requiere parámetros.
     */
    generateTicketId() {
        return generateTicketId.call(this);
    }

    /**
     * Registra una jugada en historial y dispara su persistencia/exposición externa.
     * Parámetros:
     * - `ticketId` (string): Identificador único del ticket.
     * - `bet` (number): Monto apostado para generar/ejecutar la tirada.
     * - `win` (number): Monto ganado en la jugada.
     * - `mode` (string, opcional): Modo de juego asociado a la jugada.
     */
    addHistoryEntry({ ticketId, bet, win, mode = 'single' }) {
        return addHistoryEntry.call(this, { ticketId, bet, win, mode });
    }

    /**
     * Actualiza valor de pozo acumulado en la UI del jackpot.
     * Parámetros:
     * - `payload` (object, opcional): Valores del jackpot a aplicar.
     * - `animate` (boolean, opcional): Define si la actualización del jackpot debe animarse.
     */
    setJackpotValues(payload = {}, animate = true) {
        if (!this.jackpotUI) return;
        this.jackpotUI.setValues(payload, animate);
    }

    /**
     * Suma una contribución al pozo en base al monto apostado.
     * Parámetros:
     * - `amount` (number): Monto de aporte al pozo.
     */
    addJackpotContribution(amount) {
        if (!this.jackpotUI) return;
        this.jackpotUI.addContribution(amount);
    }

    /**
     * Interrumpe el spin activo guardando estado para reanudación posterior.
     * No requiere parámetros.
     */
    interruptSpinKeepingPending() {
        if (this.isSpinning && !this.isManualMode && !this.isReplayMode) {
            this.isSpinning = false;
            if (window.setReactSpinning) window.setReactSpinning(false);
        }
    }

    /**
     * Limpia listeners, timers y referencias globales al cerrar la escena.
     * No requiere parámetros.
     */
    shutdownScene() {
        if (this.jackpotUI) this.jackpotUI.destroy();
        if (window.updateJackpotValues === this.externalJackpotUpdater) {
            delete window.updateJackpotValues;
        }
        this.externalJackpotUpdater = null;
    }

    /**
     * Recorta y registra las texturas de símbolos usadas por la grilla.
     * No requiere parámetros.
     */
    createSymbolTextures() {
        if (!this.textures.exists('symbols')) return;
        const atlas = this.textures.get('symbols');
        const rects = [
            { id: '0', x: 56, y: 3, w: 140, h: 135 }, { id: '1', x: 56, y: 156, w: 140, h: 135 },
            { id: '2', x: 652, y: 7, w: 140, h: 145 }, { id: '3', x: 656, y: 321, w: 140, h: 145 },
            { id: '4', x: 656, y: 165, w: 140, h: 145 }, { id: '5', x: 56, y: 312, w: 150, h: 135 },
            { id: '6', x: 212, y: 311, w: 140, h: 135 }, { id: '7', x: 361, y: 153, w: 145, h: 145 },
            { id: '8', x: 359, y: 7, w: 140, h: 135 } 
        ];
        rects.forEach(r => atlas.add(r.id, 0, r.x, r.y, r.w, r.h));
    }

    /**
     * Crea un bloque visual de estadística con título y valor.
     * Parámetros:
     * - `title` (string): Texto de título a mostrar.
     * - `val` (string|number): Valor inicial a mostrar.
     * - `s1` (number): Escala horizontal base del contenedor.
     * - `s2` (number): Escala vertical base del contenedor.
     */
    createStatBox(title, val, s1, s2) {
        return createStatBox.call(this, title, val, s1, s2);
    }

    /**
     * Crea un botón de interfaz con texto, posición y callback de acción.
     * Parámetros:
     * - `text` (string): Texto visible del botón o etiqueta.
     * - `x` (number): Posición horizontal.
     * - `y` (number): Posición vertical.
     * - `cb` (Function): Callback a ejecutar al activar el botón.
     */
    createBtn(text, x, y, cb) {
        return createBtn.call(this, text, x, y, cb);
    }

    /**
     * Modifica el índice de apuesta actual y actualiza la UI asociada.
     * Parámetros:
     * - `dir` (number): Dirección del cambio de apuesta (`1` o `-1`).
     */
    changeBet(dir) {
        if(this.isSpinning || this.isReplayMode) return;
        this.currentBetIndex = Phaser.Math.Clamp(this.currentBetIndex + dir, 0, BET_VALUES.length - 1);
        if(this.uiElements.betBox) this.uiElements.betBox.val.setText("$" + this.formatPoints(BET_VALUES[this.currentBetIndex]));
        if (this.layerShop.visible) this.updateShopUI(); 
    }

    /**
     * Determina cuántas columnas usar para la grilla de tickets en tienda.
     * Parámetros:
     * - `qty` (number): Cantidad de tickets/cartas a procesar.
     * - `isPortrait` (boolean): Indica si el layout está en orientación vertical.
     */
    getShopGridCols(qty, isPortrait) {
        if (!isPortrait) {
            return Math.min(10, Math.max(5, qty));
        }

        // En mobile portrait la grilla siempre usa 5 columnas:
        // 5 -> 1 fila, 10 -> 2 filas, 15 -> 3 filas, 20 -> 4 filas.
        return 5;
    }

    /**
     * Calcula dimensiones base y separación de tarjetas de tienda.
     * Parámetros:
     * - `qty` (number): Cantidad de tickets/cartas a procesar.
     * - `isPortrait` (boolean): Indica si el layout está en orientación vertical.
     */
    getShopCardMetrics(qty, isPortrait) {
        if (!isPortrait) {
            return { cardW: 100, cardH: 140, pad: 10 };
        }
        const isMobilePortrait = this.scale.width <= 520;
        if (qty >= 20) {
            return isMobilePortrait
                ? { cardW: 56, cardH: 64, pad: 8 }
                : { cardW: 62, cardH: 72, pad: 10 };
        }
        if (qty >= 15) {
            return { cardW: 50, cardH: 64, pad: isMobilePortrait ? 10 : 5 };
        }
        if (qty >= 10 && isMobilePortrait) {
            return { cardW: 82, cardH: 116, pad: 12 };
        }
        return { cardW: 100, cardH: 140, pad: 10 };
    }

    /**
     * Calcula métricas internas de tipografía y padding para una tarjeta de tienda.
     * Parámetros:
     * - `cardW` (number): Ancho de la tarjeta base.
     * - `cardH` (number): Alto de la tarjeta base.
     */
    getShopCardContentMetrics(cardW, cardH) {
        const scale = Phaser.Math.Clamp(Math.min(cardW / 100, cardH / 140), 0.36, 1);
        const winFont = Math.max(12, Math.round(20 * scale));
        const loseFont = Math.max(10, Math.round(16 * scale));
        const verBtnWidth = Phaser.Math.Clamp(Math.round(cardW * 0.72), 24, 70);
        const verBtnHeight = Phaser.Math.Clamp(Math.round(cardH * 0.28), 14, 30);
        const verBtnMarginBottom = Math.max(3, Math.round(cardH * 0.08));
        const verBtnTopY = Math.round((cardH / 2) - verBtnHeight - verBtnMarginBottom);
        const verBtnFont = Phaser.Math.Clamp(Math.round(verBtnHeight * 0.60), 8, 18);
        return {
            hiddenTextY: 0,
            hiddenFont: Math.max(16, Math.round(45 * scale)),
            resultTextY: Math.round(-18 * scale),
            winFont,
            loseFont,
            minWinFont: Math.max(9, Math.round(winFont * 0.72)),
            lineSpacing: Math.round(-2 * scale),
            verBtnWidth,
            verBtnHeight,
            verBtnTopY,
            verBtnCenterY: verBtnTopY + Math.round(verBtnHeight / 2),
            verBtnRadius: Math.max(4, Math.round(verBtnHeight * 0.30)),
            verBtnFont
        };
    }

    /**
     * Oculta todas las capas principales para cambiar de vista sin arrastre visual.
     * No requiere parámetros.
     */
    hideAllLayers() {
        return hideAllLayers.call(this);
    }

    /**
     * Restablece la apuesta principal al valor inicial configurado.
     * No requiere parámetros.
     */
    resetMainBetToDefault() {
        return resetMainBetToDefault.call(this);
    }

    /**
     * Muestra la vista de lobby y aplica su layout.
     * No requiere parámetros.
     */
    showLobby() {
        return showLobby.call(this);
    }

    /**
     * Muestra la vista de juego y prepara controles de spin.
     * No requiere parámetros.
     */
    showGame() {
        return showGame.call(this);
    }

    /**
     * Muestra la vista de tienda aplicando opciones de apertura.
     * Parámetros:
     * - `options` (object, opcional): Opciones de comportamiento para la acción solicitada.
     */
    showShop(options = {}) {
        return showShop.call(this, options);
    }

    /**
     * Reinicia estado temporal de tienda y totales acumulados.
     * No requiere parámetros.
     */
    resetShopState() {
        return resetShopState.call(this);
    }

    /**
     * Construye elementos visuales y botones del lobby.
     * No requiere parámetros.
     */
    buildLobby() {
        return buildLobby.call(this);
    }

    /**
     * Crea un botón de menú reutilizable con estilo y acción.
     * Parámetros:
     * - `text` (string): Texto visible del botón o etiqueta.
     * - `color` (string|number): Color base del botón.
     * - `w` (number): Ancho disponible de la escena.
     * - `h` (number): Alto disponible de la escena.
     * - `callback` (Function): Callback a ejecutar al activar el botón.
     */
    createMenuButton(text, color, w, h, callback) {
        return createMenuButton.call(this, text, color, w, h, callback);
    }

    /**
     * Construye paneles, filtros y controles de la vista de tienda.
     * No requiere parámetros.
     */
    buildShop() {
        return buildShop.call(this);
    }

    /**
     * Dibuja o redibuja las tarjetas de tickets según cantidad seleccionada.
     * Parámetros:
     * - `qty` (number): Cantidad de tickets/cartas a procesar.
     * - `options` (object, opcional): Configuración de redraw.
     */
    drawShopCards(qty, options = {}) {
        return drawShopCards.call(this, qty, options);
    }

    /**
     * Sincroniza textos, estados activos y totales de la UI de tienda.
     * No requiere parámetros.
     */
    updateShopUI() {
        return updateShopUI.call(this);
    }

    /**
     * Limpia tarjetas previas de tienda para reconstrucción segura.
     * No requiere parámetros.
     */
    resetShopCards() {
        return resetShopCards.call(this);
    }

    /**
     * Resuelve automáticamente todos los tickets del pack comprado.
     * Parámetros:
     * - `qty` (number): Cantidad de tickets/cartas a procesar.
     * - `totalCost` (number): Costo total del pack comprado.
     */
    startAutoReveal(qty, totalCost) {
        return startAutoReveal.call(this, qty, totalCost);
    }

    /**
     * Inicializa modo manual para abrir tickets uno por uno.
     * Parámetros:
     * - `qty` (number): Cantidad de tickets/cartas a procesar.
     * - `betVal` (number): Valor de apuesta aplicado al modo manual.
     * - `totalCost` (number): Costo total del pack comprado.
     */
    startManualMode(qty, betVal, totalCost) {
        return startManualMode.call(this, qty, betVal, totalCost);
    }

    /**
     * Ejecuta la siguiente jugada del modo manual.
     * No requiere parámetros.
     */
    executeManualSpin() {
        return executeManualSpin.call(this);
    }

    /**
     * Cierra una jugada manual, acumula resultado y decide continuidad.
     * Parámetros:
     * - `winAmount` (number): Premio obtenido en la jugada manual.
     */
    finishManualSpin(winAmount) {
        return finishManualSpin.call(this, winAmount);
    }

    /**
     * Reanuda una jugada pendiente desde estado persistido.
     * Parámetros:
     * - `savedData` (object): Datos persistidos de jugada pendiente.
     */
    playPendingSpin(savedData) {
        return playPendingSpin.call(this, savedData);
    }

    /**
     * Configura la escena para reproducir una jugada histórica.
     * Parámetros:
     * - `configData` (object): Datos de configuración para replay.
     * - `source` (string): Origen del replay (por ejemplo `shop` o `history`).
     */
    setupReplay(configData, source) {
        return setupReplay.call(this, configData, source);
    }

    /**
     * Sale del modo replay y restaura la interfaz normal.
     * No requiere parámetros.
     */
    exitReplay() {
        return exitReplay.call(this);
    }

    /**
     * Ejecuta la animación de replay con datos precargados.
     * No requiere parámetros.
     */
    async executeReplay() {
        return executeReplay.call(this);
    }

    /**
     * Construye la matriz visual de símbolos del tablero.
     * No requiere parámetros.
     */
    buildGameGrid() {
        return buildGameGrid.call(this);
    }

    /**
     * Construye HUD, botones y contenedores de interacción del juego.
     * No requiere parámetros.
     */
    buildUI() {
        return buildUI.call(this);
    }

    /**
     * Genera datos de tirada simulada para juego actual.
     * Parámetros:
     * - `bet` (number): Monto apostado para generar/ejecutar la tirada.
     */
    generateMockSpin(bet) {
        return generateMockSpin.call(this, bet);
    }

    /**
     * Genera una tirada simulada ajustada a un premio objetivo histórico.
     * Parámetros:
     * - `bet` (number): Monto apostado para generar/ejecutar la tirada.
     * - `targetWin` (number): Premio objetivo a simular en historial.
     */
    generateHistoryMockSpin(bet, targetWin) {
        return generateHistoryMockSpin.call(this, bet, targetWin);
    }

    /**
     * Inicia una tirada normal validando estado y animaciones.
     * No requiere parámetros.
     */
    async spin() {
        return spin.call(this);
    }

    /**
     * Restablece símbolos, alfa y tweens del tablero antes de una nueva tirada.
     * No requiere parámetros.
     */
    resetBoardState() {
        return resetBoardState.call(this);
    }

    /**
     * Cierra una tirada aplicando premios, historial y transiciones de estado.
     * Parámetros:
     * - `totalWin` (number): Monto total ganado en la tirada.
     * - `winGroups` (Array<object>): Grupos ganadores detectados en la grilla.
     */
    endSpin(totalWin, winGroups) {
        return endSpin.call(this, totalWin, winGroups);
    }

    /**
     * Reproduce secuencialmente los grupos ganadores con animación.
     * Parámetros:
     * - `winGroups` (Array<object>): Grupos ganadores detectados en la grilla.
     */
    playSequentialWins(winGroups) {
        return playSequentialWins.call(this, winGroups);
    }

    /**
     * Recalcula posiciones y escalas según tamaño de pantalla.
     * Parámetros:
     * - `size` (object): Objeto con dimensiones de viewport (`width`, `height`).
     */
    applyResponsiveLayout(size) {
        return applyResponsiveLayout.call(this, size);
    }

    /**
     * Aplica animación resaltada a un símbolo ganador.
     * Parámetros:
     * - `originalSprite` (Phaser.GameObjects.Sprite): Símbolo ganador a animar.
     */
    animateWinningSymbol(originalSprite) {
        return animateWinningSymbol.call(this, originalSprite);
    }

    /**
     * Detiene y limpia animaciones activas de símbolos ganadores.
     * No requiere parámetros.
     */
    clearWinAnimations() {
        return clearWinAnimations.call(this);
    }
}
