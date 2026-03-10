import Phaser from 'phaser';
import pozoAsset from '../assets/pozo.webp';
import { JackpotUI } from '../components/JackpotUI';

const CONFIG_GAME = { reelTotalWidth: 700, reelTotalHeight: 600, reels: 5, rows: 5 };
const CELL_W = CONFIG_GAME.reelTotalWidth / CONFIG_GAME.reels; 
const CELL_H = CONFIG_GAME.reelTotalHeight / CONFIG_GAME.rows;
const BET_VALUES = [100, 200, 300, 400, 500, 1000, 2000, 5000, 10000];
const JACKPOT_SIZE_BOOST = 1.15;
const HISTORY_STORAGE_KEY = 'frutilla_history_v1';
const VIEWPORT_SCALE_MODEL = {
    'mobile-portrait': {
        baseResolution: { width: 390, height: 844 },
        scaleClamp: { min: 0.78, max: 1.0 },
        layout: {
            sidePaddingPortrait: 10,
            sidePaddingLandscape: 14,
            hudRightReservePortrait: 66,
            hudRightReserveLandscapeRatio: 0.1,
            hudRightReserveLandscapeMin: 88,
            hudRightReserveLandscapeMax: 124,
            hudDockTopShop: 160
        },
        sections: {
            lobby: 0.92,
            shop: 0.88,
            shopCards: 0.88,
            shopResult: 0.9,
            gameBoard: 0.92,
            gameInfo: 0.9,
            gameControls: 0.88,
            shopTitle: 0.9
        },
        thresholds: {
            compactPortraitMaxW: 760,
            compactPortraitMaxH: 960,
            veryCompactPortraitMaxW: 460,
            veryCompactPortraitMaxH: 760,
            midPortraitMinW: 520,
            midPortraitMaxW: 860,
            shortLandscapeShopMaxH: 430,
            shortLandscapeGameMaxH: 520,
            veryShortLandscapeGameMaxH: 430,
            midLandscapeMinW: 640,
            midLandscapeMaxW: 940,
            wideLandscapeMinW: 1200
        }
    },
    'tablet-portrait': {
        baseResolution: { width: 834, height: 1112 },
        scaleClamp: { min: 0.84, max: 1.08 },
        layout: {
            sidePaddingPortrait: 12,
            sidePaddingLandscape: 16,
            hudRightReservePortrait: 52,
            hudRightReserveLandscapeRatio: 0.1,
            hudRightReserveLandscapeMin: 94,
            hudRightReserveLandscapeMax: 132,
            hudDockTopShop: 144
        },
        sections: {
            lobby: 0.98,
            shop: 0.96,
            shopCards: 0.96,
            shopResult: 0.96,
            gameBoard: 0.98,
            gameInfo: 0.97,
            gameControls: 0.96,
            shopTitle: 0.96
        },
        thresholds: {
            compactPortraitMaxW: 980,
            compactPortraitMaxH: 1180,
            veryCompactPortraitMaxW: 620,
            veryCompactPortraitMaxH: 900,
            midPortraitMinW: 760,
            midPortraitMaxW: 1120,
            shortLandscapeShopMaxH: 500,
            shortLandscapeGameMaxH: 560,
            veryShortLandscapeGameMaxH: 470,
            midLandscapeMinW: 900,
            midLandscapeMaxW: 1200,
            wideLandscapeMinW: 1400
        }
    },
    'mobile-landscape': {
        baseResolution: { width: 844, height: 390 },
        scaleClamp: { min: 0.74, max: 0.96 },
        layout: {
            sidePaddingPortrait: 10,
            sidePaddingLandscape: 14,
            hudRightReservePortrait: 66,
            hudRightReserveLandscapeRatio: 0.09,
            hudRightReserveLandscapeMin: 86,
            hudRightReserveLandscapeMax: 118,
            hudDockTopShop: 160
        },
        sections: {
            lobby: 0.86,
            shop: 0.82,
            shopCards: 0.82,
            shopResult: 0.84,
            gameBoard: 0.84,
            gameInfo: 0.84,
            gameControls: 0.82,
            shopTitle: 0.86
        },
        thresholds: {
            compactPortraitMaxW: 760,
            compactPortraitMaxH: 960,
            veryCompactPortraitMaxW: 460,
            veryCompactPortraitMaxH: 760,
            midPortraitMinW: 520,
            midPortraitMaxW: 860,
            shortLandscapeShopMaxH: 430,
            shortLandscapeGameMaxH: 520,
            veryShortLandscapeGameMaxH: 430,
            midLandscapeMinW: 640,
            midLandscapeMaxW: 940,
            wideLandscapeMinW: 1160
        }
    },
    'tablet-landscape': {
        baseResolution: { width: 1180, height: 820 },
        scaleClamp: { min: 0.82, max: 1.04 },
        layout: {
            sidePaddingPortrait: 12,
            sidePaddingLandscape: 16,
            hudRightReservePortrait: 52,
            hudRightReserveLandscapeRatio: 0.1,
            hudRightReserveLandscapeMin: 92,
            hudRightReserveLandscapeMax: 128,
            hudDockTopShop: 148
        },
        sections: {
            lobby: 0.94,
            shop: 0.92,
            shopCards: 0.92,
            shopResult: 0.93,
            gameBoard: 0.93,
            gameInfo: 0.92,
            gameControls: 0.91,
            shopTitle: 0.92
        },
        thresholds: {
            compactPortraitMaxW: 980,
            compactPortraitMaxH: 1180,
            veryCompactPortraitMaxW: 620,
            veryCompactPortraitMaxH: 900,
            midPortraitMinW: 760,
            midPortraitMaxW: 1120,
            shortLandscapeShopMaxH: 500,
            shortLandscapeGameMaxH: 560,
            veryShortLandscapeGameMaxH: 470,
            midLandscapeMinW: 900,
            midLandscapeMaxW: 1280,
            wideLandscapeMinW: 1400
        }
    },
    'desktop-landscape': {
        baseResolution: { width: 1440, height: 900 },
        scaleClamp: { min: 0.9, max: 1.12 },
        layout: {
            sidePaddingPortrait: 12,
            sidePaddingLandscape: 18,
            hudRightReservePortrait: 42,
            hudRightReserveLandscapeRatio: 0.1,
            hudRightReserveLandscapeMin: 96,
            hudRightReserveLandscapeMax: 140,
            hudDockTopShop: 132
        },
        sections: {
            lobby: 1,
            shop: 1,
            shopCards: 1,
            shopResult: 1,
            gameBoard: 1,
            gameInfo: 1,
            gameControls: 1,
            shopTitle: 1
        },
        thresholds: {
            compactPortraitMaxW: 980,
            compactPortraitMaxH: 1180,
            veryCompactPortraitMaxW: 620,
            veryCompactPortraitMaxH: 900,
            midPortraitMinW: 760,
            midPortraitMaxW: 1120,
            shortLandscapeShopMaxH: 560,
            shortLandscapeGameMaxH: 560,
            veryShortLandscapeGameMaxH: 470,
            midLandscapeMinW: 900,
            midLandscapeMaxW: 1320,
            wideLandscapeMinW: 1280
        }
    }
};

// Ajustes por rango para evitar repetir la misma configuracion por resolucion exacta.
// Puedes definir reglas por orientacion + min/max de width/height.
// Scopes disponibles en overrides: shared, lobby, shop, gamePortrait, gameLandscape, hud, fallbackJackpot.
const VIEWPORT_RANGE_OVERRIDES = [
    {
        id: 'landscape-over-1200-force-narrow-game-layout',
        match: {
            orientation: 'landscape',
            minWidth: 1200
        },
        overrides: {
            gameLandscape: {
                forceNarrowLayout: true,
                panelGlobalYOffset: 0
            }
        }
    },
    {
        id: 'landscape-over-1300-force-narrow-game-layout',
        match: {
            orientation: 'landscape',
            minWidth: 1320
        },
        overrides: {
            gameLandscape: {
                forceNarrowLayout: true,
                panelGlobalYOffset: 50
            }
        }
    },
    {
        id: 'mobile-under-905-buttons',
        match: {
            maxWidth: 905
        },
        overrides: {
            lobby: {
                landscapeStackButtonsGap: 150,
                landscapeButtonsGap: 24,
                landscapeStackScaleThreshold: 1,
                portraitButtonsGap: 150
            }
        }
    },
    {
        id: 'small-portrait-bigger-board',
        match: {
            orientation: 'portrait',
            minWidth: 320,
            maxWidth: 430,
            minHeight: 600,
            maxHeight: 760
        },
        overrides: {
            shared: {
                gameBoardScaleMin: 1.0,
                gameBoardScaleMax: 1.06
            },
            gamePortrait: {
                portraitWidthFactorDefault: 1.04,
                portraitWidthFactorMid: 1.02,
                gameTopGap: 8,
                gameBottomGapToWin: 36
            }
        }
    },
    {
        id: 'ipad-mini-portrait-bet-controls-up',
        match: {
            orientation: 'portrait',
            minWidth: 740,
            maxWidth: 790,
            minHeight: 980,
            maxHeight: 1060
        },
        overrides: {
            shared: {
                gameBoardScaleMin: 1.0,
                gameBoardScaleMax: 1.08
            },
            gamePortrait: {
                controlsGlobalYOffset: -80,
                contWinGlobalYOffset: 10,
                portraitWidthFactorMid: 1.08,
                gameBottomGapToWin: 36
            },
            hud: {
                dockBoardOffset: -150
            }
        }
    },
    {
        id: 'mobile-portrait-lobby-tight',
        match: {
            orientation: 'portrait',
            minWidth: 340,
            maxWidth: 540,
            minHeight: 660,
            maxHeight: 940
        },
        overrides: {
            lobby: {
                titleGapFromJackpot: 100
            },
            // Ejemplos:
            // shop: { portraitButtonsGap: 120 },
            // gamePortrait: { controlsYRatioDefault: 0.82 },
            // hud: { dockLobbyOffset: -120 }
            shared: {
                // Ajustes globales de escala por rango.
                // lobbyScaleMax: 1.08
            }
        }
    }
];

// Ajustes finos por resolucion exacta (solo excepciones puntuales).
// Tienen prioridad por encima del rango.
const VIEWPORT_RESOLUTION_OVERRIDES = {
    // '430x932': { lobby: { titleGapFromJackpot: 92 } }
};

export class MainScene extends Phaser.Scene {
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

        this.isReplayMode = false;
        this.replaySource = ''; 
        this.currentReplayData = null;
        this.currentReplayBet = 0;

        this.jackpotUI = null;
        this.externalJackpotUpdater = null;
    }

    preload() {
        if (!this.textures.exists('bg')) this.load.image('bg', 'img/backgrounds2.webp');
        if (!this.textures.exists('symbols')) this.load.image('symbols', 'img/frutas.webp');
        if (!this.textures.exists('pozo')) this.load.image('pozo', pozoAsset);
    }

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
            totalContribution: 0.8,
            minorShare: 0.2,
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

    formatPoints(num) {
        return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    getBottomSystemInset() {
        if (typeof window === 'undefined') return 0;
        const vv = window.visualViewport;
        if (!vv) return 0;
        const rawInset = (window.innerHeight || this.scale.height || 0) - (vv.height + vv.offsetTop);
        if (!Number.isFinite(rawInset)) return 0;
        return Math.max(0, rawInset);
    }

    getViewportScaleProfile(width, height) {
        const safeWidth = Math.max(1, Math.round(Number(width) || 1));
        const safeHeight = Math.max(1, Math.round(Number(height) || 1));
        const orientation = safeHeight > safeWidth ? 'portrait' : 'landscape';
        const shortSide = Math.min(safeWidth, safeHeight);
        const longSide = Math.max(safeWidth, safeHeight);
        const hasTouchInput = typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0;

        let profileKey = 'desktop-landscape';
        if (orientation === 'portrait') {
            profileKey = safeWidth <= 767 ? 'mobile-portrait' : 'tablet-portrait';
        } else if (safeWidth <= 960 || shortSide <= 500) {
            profileKey = 'mobile-landscape';
        } else if (safeWidth <= 1366 && (hasTouchInput || shortSide <= 900)) {
            profileKey = 'tablet-landscape';
        }

        const model = VIEWPORT_SCALE_MODEL[profileKey] || VIEWPORT_SCALE_MODEL['desktop-landscape'];
        const baseScale = Math.min(
            safeWidth / model.baseResolution.width,
            safeHeight / model.baseResolution.height
        );
        const viewportScale = Phaser.Math.Clamp(baseScale, model.scaleClamp.min, model.scaleClamp.max);

        return {
            width: safeWidth,
            height: safeHeight,
            shortSide,
            longSide,
            orientation,
            isPortrait: orientation === 'portrait',
            profileKey,
            deviceType: profileKey.split('-')[0],
            scale: viewportScale,
            ...model
        };
    }

    matchesViewportRange(match = {}, width, height, orientation) {
        if (match.orientation && match.orientation !== orientation) return false;
        if (Number.isFinite(match.minWidth) && width < match.minWidth) return false;
        if (Number.isFinite(match.maxWidth) && width > match.maxWidth) return false;
        if (Number.isFinite(match.minHeight) && height < match.minHeight) return false;
        if (Number.isFinite(match.maxHeight) && height > match.maxHeight) return false;
        return true;
    }

    mergeOverrideScopes(base = {}, incoming = {}) {
        const merged = { ...base };
        Object.entries(incoming || {}).forEach(([scope, values]) => {
            if (values && typeof values === 'object' && !Array.isArray(values)) {
                merged[scope] = { ...(merged[scope] || {}), ...values };
                return;
            }
            merged[scope] = values;
        });
        return merged;
    }

    getViewportOverrides(width, height, viewportProfile = null) {
        const safeWidth = Math.max(1, Math.round(Number(width) || 1));
        const safeHeight = Math.max(1, Math.round(Number(height) || 1));
        const orientation = viewportProfile?.orientation || (safeHeight > safeWidth ? 'portrait' : 'landscape');
        const key = `${safeWidth}x${safeHeight}`;

        let mergedOverrides = {};
        VIEWPORT_RANGE_OVERRIDES.forEach((rule) => {
            if (!rule?.match || !rule?.overrides) return;
            if (!this.matchesViewportRange(rule.match, safeWidth, safeHeight, orientation)) return;
            mergedOverrides = this.mergeOverrideScopes(mergedOverrides, rule.overrides);
        });

        const exactOverrides = VIEWPORT_RESOLUTION_OVERRIDES[key];
        if (exactOverrides) {
            mergedOverrides = this.mergeOverrideScopes(mergedOverrides, exactOverrides);
        }

        return Object.keys(mergedOverrides).length ? mergedOverrides : null;
    }

    generateTicketId() {
        return String(Phaser.Math.Between(1, 9999999)).padStart(7, '0');
    }

    addHistoryEntry({ ticketId, bet, win, mode = 'single' }) {
        const safeBet = Number.isFinite(Number(bet)) ? Number(bet) : 0;
        const safeWin = Number.isFinite(Number(win)) ? Number(win) : 0;
        const timestamp = Date.now();
        const entry = {
            id: String(ticketId || this.generateTicketId()),
            timestamp,
            date: new Date(timestamp).toISOString(),
            bet: safeBet,
            win: safeWin,
            mode
        };

        if (window.addHistoryEntry && typeof window.addHistoryEntry === 'function') {
            window.addHistoryEntry(entry);
            return;
        }

        // Fallback: persist directly if React UI bridge is not ready yet.
        try {
            const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
            const list = raw ? JSON.parse(raw) : [];
            const safeList = Array.isArray(list) ? list : [];
            const merged = [entry, ...safeList]
                .map((item) => ({
                    ...item,
                    timestamp: Number(item?.timestamp) || timestamp
                }))
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, 500);
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(merged));
        } catch (error) {
            console.warn('No se pudo guardar historial:', error);
        }
    }

    setJackpotValues(payload = {}, animate = true) {
        if (!this.jackpotUI) return;
        this.jackpotUI.setValues(payload, animate);
    }

    addJackpotContribution(amount) {
        if (!this.jackpotUI) return;
        this.jackpotUI.addContribution(amount);
    }

    interruptSpinKeepingPending() {
        if (this.isSpinning && !this.isManualMode && !this.isReplayMode) {
            this.isSpinning = false;
            if (window.setReactSpinning) window.setReactSpinning(false);
        }
    }

    shutdownScene() {
        if (this.jackpotUI) this.jackpotUI.destroy();
        if (window.updateJackpotValues === this.externalJackpotUpdater) {
            delete window.updateJackpotValues;
        }
        this.externalJackpotUpdater = null;
    }

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

    createStatBox(title, val, s1, s2) {
        const c = this.add.container(0, 0);
        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.7); bg.lineStyle(2, 0xFFD700);
        bg.fillRoundedRect(-100, -35, 200, 70, 15); bg.strokeRoundedRect(-100, -35, 200, 70, 15);
        const t = this.add.text(0, -45, title, s1).setOrigin(0.5);
        const v = this.add.text(0, 0, val, s2).setOrigin(0.5);
        c.add([bg, t, v]);
        return { container: c, val: v };
    }

    createBtn(text, x, y, cb) {
        const c = this.add.container(x, y);
        const g = this.add.graphics();
        g.fillStyle(0x333333); g.lineStyle(2, 0xFFFFFF);
        g.fillCircle(0,0,30); g.strokeCircle(0,0,30);
        const t = this.add.text(0,0,text, {fontSize:'30px', fontFamily:'Arial', fontStyle:'bold'}).setOrigin(0.5);
        const h = this.add.zone(0,0,60,60).setInteractive({cursor:'pointer'}).setOrigin(0.5);
        h.on('pointerdown', () => { if(window.reactUI && window.reactUI.isActive) return; cb(); });
        c.add([g, t, h]);
        return c;
    }

    changeBet(dir) {
        if(this.isSpinning) return;
        this.currentBetIndex = Phaser.Math.Clamp(this.currentBetIndex + dir, 0, BET_VALUES.length - 1);
        if(this.uiElements.betBox) this.uiElements.betBox.val.setText("$" + this.formatPoints(BET_VALUES[this.currentBetIndex]));
        if (this.layerShop.visible) this.updateShopUI(); 
    }

    getShopGridCols(qty, isPortrait) {
        if (!isPortrait) {
            return Math.min(10, Math.max(5, qty));
        }

        // En mobile portrait la grilla siempre usa 5 columnas:
        // 5 -> 1 fila, 10 -> 2 filas, 15 -> 3 filas, 20 -> 4 filas.
        return 5;
    }

    getShopCardMetrics(qty, isPortrait) {
        if (!isPortrait) {
            return { cardW: 100, cardH: 140, pad: 10 };
        }
        if (qty >= 20) {
            return { cardW: 45, cardH: 50, pad: 5 };
        }
        if (qty >= 15) {
            return { cardW: 50, cardH: 70, pad: 5 };
        }
        return { cardW: 100, cardH: 140, pad: 10 };
    }

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

    hideAllLayers() {
        if(this.layerLobby) this.layerLobby.setVisible(false).setAlpha(0);
        if(this.layerShop) this.layerShop.setVisible(false).setAlpha(0);
        if(this.layerGame) this.layerGame.setVisible(false).setAlpha(0);
        if(this.layerUI) this.layerUI.setVisible(false).setAlpha(0);
        if(this.layerJackpot) this.layerJackpot.setVisible(false).setAlpha(0);
        if(this.layerTopText) this.layerTopText.setVisible(false).setAlpha(0);
    }

    resetMainBetToDefault() {
        this.currentBetIndex = 0;
        if (this.uiElements.betBox) {
            this.uiElements.betBox.val.setText("$" + this.formatPoints(BET_VALUES[this.currentBetIndex]));
        }
    }

    showLobby() {
        this.interruptSpinKeepingPending();
        this.isReplayMode = false;
        this.isManualMode = false;
        this.resetBoardState();
        this.hideAllLayers();
        this.bg.setTint(0x1a2235);
        this.layerLobby.setVisible(true).setAlpha(1);
        this.layerJackpot.setVisible(true).setAlpha(1);
        this.applyResponsiveLayout({ width: this.scale.width, height: this.scale.height });
        if (window.setCurrentScreen) window.setCurrentScreen('home');
    }

    showGame() {
        this.isReplayMode = false;
        this.isManualMode = false;
        this.hideAllLayers();
        this.bg.clearTint();
        this.layerGame.setVisible(true).setAlpha(1);
        this.layerUI.setVisible(true).setAlpha(1);
        this.layerJackpot.setVisible(true).setAlpha(1);
        this.layerTopText.setVisible(true).setAlpha(1); 
        
        this.uiElements.controlsGroup.setVisible(true);
        this.uiElements.replayControlsGroup.setVisible(false);
        this.uiElements.manualControlsGroup.setVisible(false);
        this.replayTitleBox.setVisible(false);
        this.applyResponsiveLayout({ width: this.scale.width, height: this.scale.height });

        if (window.setCurrentScreen) window.setCurrentScreen('game');
    }

    showShop(options = {}) {
        const { resetState = true } = options;
        this.interruptSpinKeepingPending();
        this.isReplayMode = false;
        this.isManualMode = false;
        this.resetBoardState();
        if (resetState) {
            this.resetShopState();
        }
        this.hideAllLayers();
        this.bg.setTint(0x0a0e17);
        this.layerShop.setVisible(true).setAlpha(1);
        this.layerJackpot.setVisible(true).setAlpha(1);
        
        this.updateShopUI(); 
        this.applyResponsiveLayout({ width: this.scale.width, height: this.scale.height });
        if (window.setCurrentScreen) window.setCurrentScreen('shop');
    }

    resetShopState() {
        this.currentBetIndex = 0;
        this.shopQty = 5;
        this.currentShopQty = 5;
        this.currentShopWin = 0;

        if (this.uiElements.betBox) {
            this.uiElements.betBox.val.setText("$" + this.formatPoints(BET_VALUES[this.currentBetIndex]));
        }

        if (this.shopTotalWinBox) {
            this.shopTotalWinBox.val.setText("$0");
            this.shopTotalWinBox.container.setVisible(false);
        }

        this.drawShopCards(this.shopQty);
    }

    buildLobby() {
        this.lobbyTitle = this.add.text(0, 0, "FRUTILLITA\nMILLONARIA", {
            fontFamily: 'Luckiest Guy, Arial', fontSize: '45px', color: '#FFFFFF', 
            align: 'center', stroke: '#000000', strokeThickness: 8, shadow: { offsetX: 4, offsetY: 4, color: '#000', blur: 6, fill: true }
        }).setOrigin(0.5);

        this.btnLobbyComprar = this.createMenuButton("COMPRAR PAQUETE\nDE TICKETS", 0x1e3a8a, 480, 120, () => this.showShop());
        this.btnLobbyJugar = this.createMenuButton("JUGAR", 0x2563eb, 480, 120, () => {
            this.isManualMode = false;
            
            const savedPendingSpin = localStorage.getItem('frutilla_pending_spin');
            if (savedPendingSpin) {
                this.showGame(); 
                setTimeout(() => {
                    if (window.showPendingSpinModal) window.showPendingSpinModal(JSON.parse(savedPendingSpin));
                }, 100);
            } else {
                this.resetMainBetToDefault();
                this.showGame();
            }
        });
        
        this.layerLobby.add([this.lobbyTitle, this.btnLobbyComprar, this.btnLobbyJugar]);
    }

    createMenuButton(text, color, w, h, callback) {
        const c = this.add.container(0, 0);
        c.baseScale = 1;
        const bg = this.add.graphics();
        bg.fillStyle(color, 1); bg.lineStyle(3, 0xffffff, 0.3);
        bg.fillRoundedRect(-w/2, -h/2, w, h, 20); 
        bg.strokeRoundedRect(-w/2, -h/2, w, h, 20);
        const txt = this.add.text(0, 0, text, { fontFamily: 'Luckiest Guy, Arial', fontSize: '32px', color: '#FFFFFF', align: 'center' }).setOrigin(0.5);
        const hit = this.add.zone(0, 0, w, h).setInteractive({ cursor: 'pointer' }).setOrigin(0.5);
        const restoreScale = () => c.setScale(c.baseScale ?? 1);
        hit.on('pointerdown', () => { c.setScale((c.baseScale ?? 1) * 0.95); });
        hit.on('pointerup', () => { restoreScale(); callback(); });
        hit.on('pointerout', () => { restoreScale(); });
        c.add([bg, txt, hit]);
        return c;
    }

    buildShop() {
        this.shopTopLeft = this.add.container(0, 0);
        this.shopTopRight = this.add.container(0, 0);
        this.shopCardsContainer = this.add.container(0, 0);
        this.layerShop.add([this.shopTopLeft, this.shopTopRight, this.shopCardsContainer]);

        this.shopTitlePaquetes = this.add.text(0, -60, "SELECCIONAR PAQUETE DE TICKETS", { fontFamily: 'Luckiest Guy, Arial', fontSize: '32px', color: '#FFF' }).setOrigin(0.5);
        this.shopTopLeft.add(this.shopTitlePaquetes);

        this.qtyButtons = [];
        const options = [5, 10, 15, 20];
        options.forEach((opt, idx) => {
            const btn = this.add.container(-165 + (idx * 100), 20); 
            const bg = this.add.graphics();
            const hit = this.add.zone(0,0,90,70).setInteractive({cursor:'pointer'}).setOrigin(0.5);
            const txt = this.add.text(0,-10, opt.toString(), { fontFamily: 'Luckiest Guy, Arial', fontSize: '34px', color: '#FFF' }).setOrigin(0.5);
            const lbl = this.add.text(0, 18, "Tickets", { fontFamily: 'Arial', fontSize: '14px', color: '#FFF' }).setOrigin(0.5);
            
            btn.add([bg, txt, lbl, hit]);
            btn.optValue = opt;
            btn.bgDraw = bg;
            
            hit.on('pointerdown', () => { this.shopQty = opt; this.updateShopUI(); });
            this.shopTopLeft.add(btn);
            this.qtyButtons.push(btn);
        });

        const buyBtnW = 240;
        const buyBtnH = 68;
        const btnBuyBg = this.add.graphics();
        btnBuyBg.fillStyle(0x2563eb, 1); btnBuyBg.lineStyle(3, 0xffffff, 0.5);
        btnBuyBg.fillRoundedRect(-buyBtnW / 2, -buyBtnH / 2, buyBtnW, buyBtnH, 18);
        btnBuyBg.strokeRoundedRect(-buyBtnW / 2, -buyBtnH / 2, buyBtnW, buyBtnH, 18);
        const btnBuyTxt = this.add.text(0, 0, "COMPRAR", { fontFamily: 'Luckiest Guy, Arial', fontSize: '31px', color: '#FFF' }).setOrigin(0.5);
        const btnBuyHit = this.add.zone(0, 0, buyBtnW, buyBtnH).setInteractive({ cursor: 'pointer' }).setOrigin(0.5);
        this.btnBuyShopContainer = this.add.container(0, -74, [btnBuyBg, btnBuyTxt, btnBuyHit]);
        
        this.btnShopMinus = this.createBtn("-", -110, 26, () => this.changeBet(-1));
        this.lblShopBetInfo = this.add.text(0, 26, "APUESTA\n$100", { fontFamily: 'Luckiest Guy, Arial', fontSize: '20px', color: '#FFD700', align: 'center' }).setOrigin(0.5);
        this.btnShopPlus = this.createBtn("+", 110, 26, () => this.changeBet(1));

        this.lblShopTotal = this.add.text(0, 86, "COSTO TOTAL: $0", { fontFamily: 'Luckiest Guy, Arial', fontSize: '24px', color: '#aaaaaa' }).setOrigin(0.5);

        this.shopTopRight.add([this.btnBuyShopContainer, this.btnShopMinus, this.lblShopBetInfo, this.btnShopPlus, this.lblShopTotal]);

        btnBuyHit.on('pointerdown', () => { this.btnBuyShopContainer.setScale(0.95); });
        btnBuyHit.on('pointerout', () => { this.btnBuyShopContainer.setScale(1); });
        btnBuyHit.on('pointerup', () => { 
            this.btnBuyShopContainer.setScale(1);
            const total = BET_VALUES[this.currentBetIndex] * this.shopQty;
            
            if(this.balance < total) {
                if(window.showReactAlert) window.showReactAlert("Saldo Insuficiente", "No tienes fondos para este paquete.");
                return;
            }

            this.resetShopCards();
            if(this.shopTotalWinBox) {
                this.shopTotalWinBox.container.setVisible(false);
                this.shopTotalWinBox.val.setText("$0");
            }
            if(window.showBuyModal) window.showBuyModal(total, this.shopQty, BET_VALUES[this.currentBetIndex]); 
        });

        const fontTitle = { fontFamily: 'Luckiest Guy, Arial', fontSize: '24px', color: '#FFD700', stroke: '#000', strokeThickness: 4 };
        const fontVal = { fontFamily: 'Luckiest Guy, Arial', fontSize: '40px', color: '#FFFFFF', stroke: '#000', strokeThickness: 4 };
        
        this.shopTotalWinBox = this.createStatBox("RESULTADO", "$0", fontTitle, fontVal);
        this.shopTotalWinBox.container.setVisible(false);
        this.layerShop.add(this.shopTotalWinBox.container); 

        this.shopCards = [];
        this.drawShopCards(this.shopQty);
    }

    drawShopCards(qty) {
        this.shopCardsContainer.removeAll(true);
        this.shopCards = [];

        const maxCols = 10;
        const isPortrait = this.scale.height > this.scale.width;
        const actualCols = Math.min(maxCols, this.getShopGridCols(qty, isPortrait));
        this.currentShopCols = actualCols;
        const rows = Math.ceil(qty / actualCols);
        const { cardW, cardH, pad } = this.getShopCardMetrics(qty, isPortrait);
        const contentMetrics = this.getShopCardContentMetrics(cardW, cardH);
        const totalW = (actualCols * cardW) + ((actualCols - 1) * pad);
        const totalH = (rows * cardH) + ((rows - 1) * pad);
        const startX = -totalW / 2 + cardW / 2;
        const startY = -totalH / 2 + cardH / 2;

        for (let i = 0; i < qty; i++) {
            let r = Math.floor(i / actualCols);
            let c = i % actualCols;
            let posX = startX + c * (cardW + pad);
            let posY = startY + r * (cardH + pad);

            let card = this.add.container(posX, posY);
            let bg = this.add.graphics();
            bg.fillStyle(0x333333, 1); bg.lineStyle(2, 0xffffff, 0.3);
            bg.fillRoundedRect(-cardW/2, -cardH/2, cardW, cardH, 10); bg.strokeRoundedRect(-cardW/2, -cardH/2, cardW, cardH, 10);
            
            let txt = this.add.text(0, contentMetrics.hiddenTextY, "?", { fontSize: `${contentMetrics.hiddenFont}px`, fontFamily: 'Luckiest Guy, Arial', color: '#aaaaaa', align: 'center' }).setOrigin(0.5);
            txt.setLineSpacing(contentMetrics.lineSpacing);
            let btnVerBg = this.add.graphics().setVisible(false);
            let btnVerTxt = this.add.text(0, contentMetrics.verBtnCenterY, "VER", { fontFamily: 'Luckiest Guy, Arial', fontSize: `${contentMetrics.verBtnFont}px`, color: '#FFF' }).setOrigin(0.5).setVisible(false);
            let hit = this.add.zone(0, 0, cardW, cardH).setOrigin(0.5); 
            
            card.add([bg, txt, btnVerBg, btnVerTxt, hit]);
            card.bg = bg; card.txt = txt; card.btnVerBg = btnVerBg; card.btnVerTxt = btnVerTxt;
            card.hit = hit; card.cardW = cardW; card.cardH = cardH; card.replayData = null;
            card.contentMetrics = contentMetrics;
            
            this.shopCardsContainer.add(card);
            this.shopCards.push(card);
        }

    }

    updateShopUI() {
        const betVal = BET_VALUES[this.currentBetIndex];
        this.lblShopBetInfo.setText(`APUESTA\n$${this.formatPoints(betVal)}`);
        this.lblShopTotal.setText(`COSTO TOTAL: $${this.formatPoints(betVal * this.shopQty)}`);

        this.qtyButtons.forEach(btn => {
            btn.bgDraw.clear();
            if(btn.optValue === this.shopQty) {
                btn.bgDraw.fillStyle(0x00ff00, 0.3); btn.bgDraw.lineStyle(2, 0x00ff00, 1);
            } else {
                btn.bgDraw.fillStyle(0x333333, 1); btn.bgDraw.lineStyle(2, 0xffffff, 0.5);
            }
            btn.bgDraw.fillRoundedRect(-45, -35, 90, 70, 12);
            btn.bgDraw.strokeRoundedRect(-45, -35, 90, 70, 12);
        });

        if (this.currentShopQty !== this.shopQty) {
            this.currentShopQty = this.shopQty;
            this.drawShopCards(this.shopQty);
            if(this.shopTotalWinBox) {
                this.shopTotalWinBox.container.setVisible(false);
                this.shopTotalWinBox.val.setText("$0");
            }
            this.applyResponsiveLayout({ width: this.scale.width, height: this.scale.height });
        }
    }

    resetShopCards() {
        this.shopCards.forEach(card => {
            const cm = card.contentMetrics || this.getShopCardContentMetrics(card.cardW, card.cardH);
            card.setScale(1);
            card.bg.clear();
            card.bg.fillStyle(0x333333, 1); card.bg.lineStyle(2, 0xffffff, 0.3);
            card.bg.fillRoundedRect(-card.cardW/2, -card.cardH/2, card.cardW, card.cardH, 10);
            card.bg.strokeRoundedRect(-card.cardW/2, -card.cardH/2, card.cardW, card.cardH, 10);
            card.txt.setText("?");
            card.txt.setY(cm.hiddenTextY);
            card.txt.setColor('#aaaaaa');
            card.txt.setFontSize(`${cm.hiddenFont}px`);
            card.txt.setLineSpacing(cm.lineSpacing);
            card.btnVerTxt.setY(cm.verBtnCenterY);
            card.btnVerTxt.setFontSize(`${cm.verBtnFont}px`);
            card.btnVerBg.setVisible(false); card.btnVerTxt.setVisible(false); card.hit.disableInteractive(); 
            card.replayData = null;
        });
    }

    startAutoReveal(qty, totalCost) {
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

            this.time.delayedCall(i * 150, () => {
                this.tweens.add({
                    targets: card, scaleX: 0, duration: 150, yoyo: true,
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
                        
                        if(isWin) {
                            this.balance += prize;
                            this.uiElements.contBalance.val.setText("$" + this.formatPoints(this.balance));
                            
                            this.currentShopWin += prize;
                            this.shopTotalWinBox.val.setText("$" + this.formatPoints(this.currentShopWin));
                            
                            this.tweens.add({
                                targets: this.shopTotalWinBox.val, scaleX: 1.2, scaleY: 1.2, duration: 100, yoyo: true
                            });
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
                        card.hit.on('pointerup', () => {
                            if(this.isSpinning) return;
                            if(window.gameRef) window.gameRef.setupReplay({ replayData: card.replayData, replayBet: card.replayBet }, 'shop');
                        });
                    }
                });
            });
        }
    }

    startManualMode(qty, betVal, totalCost) {
        this.balance -= totalCost;
        this.uiElements.contBalance.val.setText("$" + this.formatPoints(this.balance));
        this.addJackpotContribution(totalCost);

        this.isManualMode = true;
        this.manualTotal = qty;
        this.manualCurrent = 1;
        this.manualBet = betVal;
        this.manualResults = [];

        this.hideAllLayers();
        this.bg.clearTint();
        this.layerGame.setVisible(true).setAlpha(1);
        this.layerUI.setVisible(true).setAlpha(1);
        this.layerJackpot.setVisible(true).setAlpha(1);
        this.layerTopText.setVisible(true).setAlpha(1); 
        
        this.uiElements.controlsGroup.setVisible(false);
        this.uiElements.replayControlsGroup.setVisible(false);
        this.replayTitleBox.setVisible(false);

        this.uiElements.manualControlsGroup.setVisible(true);
        this.uiElements.btnManualNext.setVisible(false); 
        
        this.uiElements.lblManualStatus.setText(`JUGADA ${this.manualCurrent} DE ${this.manualTotal}`);
        this.uiElements.manualBetBox.val.setText("$" + this.formatPoints(this.manualBet));
        
        this.resetBoardState();
        this.applyResponsiveLayout({ width: this.scale.width, height: this.scale.height });
        if (window.setCurrentScreen) window.setCurrentScreen('game');

        this.time.delayedCall(400, () => {
            this.executeManualSpin();
        });
    }

    executeManualSpin() {
        if(this.isSpinning) return;
        this.clearWinAnimations();
        if(window.setReactSpinning) window.setReactSpinning(true);

        this.isSpinning = true;
        this.uiElements.btnManualNext.setVisible(false); 
        
        this.uiElements.contWin.val.setText("$0");
        this.uiElements.contWin.val.setFontSize('40px');
        this.uiElements.contWin.val.setColor('#FFF');
        
        this.resetBoardState();
        for(let c=0; c<5; c++) { 
            for(let r=0; r<5; r++) { 
                this.symbolsMatrix[c][r].setAlpha(0); 
            } 
        }

        this.currentSpeedLevel = (window.reactUI && window.reactUI.speedLevel) || 1;
        let animDuration = 800; let colDelay = 120; let rowDelay = 30;

        if (this.currentSpeedLevel === 2) { animDuration = 500; colDelay = 80; rowDelay = 20; } 
        else if (this.currentSpeedLevel === 3) { animDuration = 250; colDelay = 40; rowDelay = 10; }

        const data = this.generateMockSpin(this.manualBet);
        this.currentManualSpinWin = data.totalWin;

        const resultGrid = data.grid, totalWin = data.totalWin, winGroups = data.winGroups;

        for(let c=0; c<5; c++) { 
            for(let r=0; r<5; r++) { 
                const sym = this.symbolsMatrix[c][r];
                sym.setTexture('symbols', resultGrid[c][r].toString());
                sym.clearTint(); 
                const targetScale = Math.min((CELL_W * 0.8) / sym.width, (CELL_H * 0.8) / sym.height);
                sym.baseScale = targetScale; sym.setScale(targetScale); 
                sym.setAlpha(1); sym.x = sym.homeX; sym.y = sym.homeY - 800; 
                const delay = (c * colDelay) + (r * rowDelay);
                this.tweens.add({
                    targets: sym, y: sym.homeY, duration: animDuration, delay: delay, ease: 'Back.out', 
                    onComplete: () => { if(c===4 && r===4) { this.endSpin(totalWin, winGroups); } }
                });
            }
        }
    }

    finishManualSpin(winAmount) {
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
            this.uiElements.btnManualNext.setVisible(true);
        } else {
            this.time.delayedCall(500, () => {
                if(window.showSummaryModal) window.showSummaryModal(this.manualResults);
            });
        }
    }

    playPendingSpin(savedData) {
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

        let animDuration = 800; let colDelay = 120; let rowDelay = 30;

        const data = savedData.data;
        const resultGrid = data.grid, totalWin = data.totalWin, winGroups = data.winGroups;

        for(let c=0; c<5; c++) { 
            for(let r=0; r<5; r++) { 
                const sym = this.symbolsMatrix[c][r];
                sym.setTexture('symbols', resultGrid[c][r].toString());
                sym.clearTint(); 
                const targetScale = Math.min((CELL_W * 0.8) / sym.width, (CELL_H * 0.8) / sym.height);
                sym.baseScale = targetScale; sym.setScale(targetScale); 
                sym.setAlpha(1); sym.x = sym.homeX; sym.y = sym.homeY - 800; 
                const delay = (c * colDelay) + (r * rowDelay);
                this.tweens.add({
                    targets: sym, y: sym.homeY, duration: animDuration, delay: delay, ease: 'Back.out', 
                    onComplete: () => { if(c===4 && r===4) { this.endSpin(totalWin, winGroups); } }
                });
            }
        }
    }

    setupReplay(configData, source) {
        this.isReplayMode = true;
        this.replaySource = source;

        if (source === 'shop') {
            this.currentReplayData = configData.replayData;
            this.currentReplayBet = configData.replayBet;
        } else if (source === 'history') {
            this.currentReplayData = this.generateHistoryMockSpin(configData.bet, configData.win);
            this.currentReplayBet = configData.bet;
        }

        this.hideAllLayers();
        this.bg.clearTint();
        this.layerGame.setVisible(true).setAlpha(1);
        this.layerUI.setVisible(true).setAlpha(1);
        this.layerTopText.setVisible(true).setAlpha(1); 
        
        this.uiElements.controlsGroup.setVisible(false);
        this.uiElements.manualControlsGroup.setVisible(false);
        this.uiElements.replayControlsGroup.setVisible(true);
        this.uiElements.btnReproducir.setVisible(true);
        this.uiElements.btnSiguiente.setVisible(true);

        this.replayTitleBox.setVisible(true);
        this.uiElements.replayBetBox.val.setText("$" + this.formatPoints(this.currentReplayBet));

        this.resetBoardState();
        if (window.setCurrentScreen) window.setCurrentScreen('game');
        this.applyResponsiveLayout({ width: this.scale.width, height: this.scale.height });

        setTimeout(() => {
            if(window.showReplayWarning) window.showReplayWarning();
        }, 100);
    }

    exitReplay() {
        this.replayTitleBox.setVisible(false);
        if(this.replaySource === 'shop') {
            this.showShop({ resetState: false }); 
        } else {
            this.showLobby();
            if(window.openHistoryMenu) window.openHistoryMenu();
        }
    }

    async executeReplay() {
        this.clearWinAnimations();
        if(this.isSpinning) return;
        if(window.setReactSpinning) window.setReactSpinning(true);

        this.isSpinning = true;
        this.uiElements.btnReproducir.setVisible(false); 
        this.uiElements.btnSiguiente.setVisible(false);
        
        this.resetBoardState();
        for(let c=0; c<5; c++) { 
            for(let r=0; r<5; r++) { 
                this.symbolsMatrix[c][r].setAlpha(0); 
            } 
        }

        this.currentSpeedLevel = (window.reactUI && window.reactUI.speedLevel) || 1;
        let animDuration = 800; let colDelay = 120; let rowDelay = 30;

        if (this.currentSpeedLevel === 2) { animDuration = 500; colDelay = 80; rowDelay = 20; } 
        else if (this.currentSpeedLevel === 3) { animDuration = 250; colDelay = 40; rowDelay = 10; }

        const data = this.currentReplayData;
        const resultGrid = data.grid, totalWin = data.totalWin, winGroups = data.winGroups;

        for(let c=0; c<5; c++) { 
            for(let r=0; r<5; r++) { 
                const sym = this.symbolsMatrix[c][r];
                sym.setTexture('symbols', resultGrid[c][r].toString());
                sym.clearTint(); 
                const targetScale = Math.min((CELL_W * 0.8) / sym.width, (CELL_H * 0.8) / sym.height);
                sym.baseScale = targetScale; sym.setScale(targetScale); 
                sym.setAlpha(1); sym.x = sym.homeX; sym.y = sym.homeY - 800; 
                const delay = (c * colDelay) + (r * rowDelay);
                this.tweens.add({
                    targets: sym, y: sym.homeY, duration: animDuration, delay: delay, ease: 'Back.out', 
                    onComplete: () => { if(c===4 && r===4) { this.endSpin(totalWin, winGroups); } }
                });
            }
        }
    }

    buildGameGrid() {
        const boardBg = this.add.graphics();
        boardBg.fillStyle(0x020E26, 1); 
        boardBg.fillRoundedRect(-CONFIG_GAME.reelTotalWidth/2, -CONFIG_GAME.reelTotalHeight/2, CONFIG_GAME.reelTotalWidth, CONFIG_GAME.reelTotalHeight, 20);
        boardBg.lineStyle(10, 0x00FFFF, 0.3); boardBg.strokeRoundedRect(-CONFIG_GAME.reelTotalWidth/2, -CONFIG_GAME.reelTotalHeight/2, CONFIG_GAME.reelTotalWidth, CONFIG_GAME.reelTotalHeight, 20);
        boardBg.lineStyle(4, 0x00FFFF, 1); boardBg.strokeRoundedRect(-CONFIG_GAME.reelTotalWidth/2, -CONFIG_GAME.reelTotalHeight/2, CONFIG_GAME.reelTotalWidth, CONFIG_GAME.reelTotalHeight, 20);
        this.layerGame.add(boardBg);

        this.replayTitleBox = this.add.container(0, 0); 
        const repBg = this.add.graphics();
        repBg.fillStyle(0x000000, 0.9);
        repBg.lineStyle(2, 0xFFD700); 
        repBg.fillRoundedRect(-200, -12, 400, 24, 8);
        repBg.strokeRoundedRect(-200, -12, 400, 24, 8);
        
        const repTxt = this.add.text(0, 0, "ESTA ES UNA REPETICIÓN DE UNA JUGADA ANTERIOR", {
            fontFamily: 'Luckiest Guy, Arial', fontSize: '14px', color: '#FFA500'
        }).setOrigin(0.5);

        this.replayTitleBox.add([repBg, repTxt]);
        this.replayTitleBox.setVisible(false);
        this.layerGame.add(this.replayTitleBox);

        this.maskShape = this.make.graphics();
        this.maskShape.fillStyle(0xffffff);
        this.maskShape.fillRoundedRect(-CONFIG_GAME.reelTotalWidth/2, -CONFIG_GAME.reelTotalHeight/2, CONFIG_GAME.reelTotalWidth, CONFIG_GAME.reelTotalHeight, 20);
        const mask = this.maskShape.createGeometryMask();

        this.symbolsContainer = this.add.container(0, 0);
        this.symbolsContainer.setMask(mask);
        this.layerGame.add(this.symbolsContainer);

        const startX = -CONFIG_GAME.reelTotalWidth / 2 + CELL_W / 2;
        const startY = -CONFIG_GAME.reelTotalHeight / 2 + CELL_H / 2;

        this.symbolsMatrix = [];
        for(let col=0; col < CONFIG_GAME.reels; col++) {
            this.symbolsMatrix[col] = [];
            for(let row=0; row < CONFIG_GAME.rows; row++) {
                const posX = startX + (col * CELL_W);
                const posY = startY + (row * CELL_H);
                
                const sym = this.add.image(posX, posY, 'symbols', Phaser.Math.Between(0,8).toString());
                const scale = Math.min((CELL_W * 0.8) / sym.width, (CELL_H * 0.8) / sym.height);
                sym.setScale(scale);
                sym.baseScale = scale; 
                sym.homeX = posX; 
                sym.homeY = posY;
                sym.setAlpha(0.6); 
                sym.setTint(0x555555);
                this.symbolsContainer.add(sym);
                this.symbolsMatrix[col][row] = sym;
            }
        }
    }

    buildUI() {
        const fontTitle = { fontFamily: 'Luckiest Guy, Arial', fontSize: '24px', color: '#FFD700', stroke: '#000', strokeThickness: 4 };
        const fontVal = { fontFamily: 'Luckiest Guy, Arial', fontSize: '40px', color: '#FFFFFF', stroke: '#000', strokeThickness: 4 };

        this.uiElements.contBalance = this.createStatBox("TOTAL", "$"+this.formatPoints(this.balance), fontTitle, fontVal);
        this.uiElements.contBalance.container.setVisible(false);
        this.layerUI.add(this.uiElements.contBalance.container);

        this.uiElements.contWin = this.createStatBox("RESULTADO", "$0", fontTitle, fontVal);
        this.layerUI.add(this.uiElements.contWin.container);

        this.uiElements.landscapeGameTitle = this.add.text(0, 0, "FRUTILLITA MILLONARIA", {
            fontFamily: 'Luckiest Guy, Arial',
            fontSize: '40px',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center',
            shadow: { offsetX: 3, offsetY: 3, color: '#000', blur: 6, fill: true }
        }).setOrigin(0.5).setVisible(false);
        this.layerUI.add(this.uiElements.landscapeGameTitle);

        this.uiElements.controlsGroup = this.add.container(0, 0);

        this.uiElements.spinBtn = this.add.container(0, 0);
        const circle = this.add.graphics();
        circle.fillStyle(0x00C853); circle.lineStyle(4, 0xFFFFFF);
        circle.fillCircle(0,0,70); circle.strokeCircle(0,0,70);
        const txtSpin = this.add.text(5, 0, "▶", {fontSize:'60px', color:'#FFF'}).setOrigin(0.5);
        const hit = this.add.zone(0, 0, 150, 150).setInteractive({cursor:'pointer'}).setOrigin(0.5);
        hit.on('pointerdown', () => { if(window.reactUI && window.reactUI.isActive) return; this.spin(); });
        this.uiElements.spinBtn.add([circle, txtSpin, hit]);

        this.uiElements.btnMinus = this.createBtn("-", -120, 0, () => this.changeBet(-1));
        this.uiElements.btnPlus = this.createBtn("+", 120, 0, () => this.changeBet(1));

        this.uiElements.betBox = this.createStatBox("APUESTA", "$"+this.formatPoints(BET_VALUES[this.currentBetIndex]), fontTitle, fontVal);
        this.uiElements.betBox.container.setPosition(0, 145); 

        this.uiElements.controlsGroup.add([this.uiElements.btnMinus, this.uiElements.spinBtn, this.uiElements.btnPlus, this.uiElements.betBox.container]);
        this.layerUI.add(this.uiElements.controlsGroup);


        this.uiElements.manualControlsGroup = this.add.container(0, 0);
        
        const btnManBg = this.add.graphics();
        btnManBg.fillStyle(0x00C853, 1); 
        btnManBg.lineStyle(2, 0xffffff, 0.8);
        btnManBg.fillRoundedRect(-110, -35, 220, 70, 35); 
        btnManBg.strokeRoundedRect(-110, -35, 220, 70, 35);
        const txtMan = this.add.text(0, 0, "SIGUIENTE", {fontFamily:'Luckiest Guy, Arial', fontSize:'28px', color:'#FFF'}).setOrigin(0.5);
        const hitMan = this.add.zone(0,0, 220, 70).setInteractive({cursor:'pointer'}).setOrigin(0.5);
        
        this.uiElements.btnManualNext = this.add.container(0, -15, [btnManBg, txtMan, hitMan]);
        
        hitMan.on('pointerdown', () => this.uiElements.btnManualNext.setScale(0.95));
        hitMan.on('pointerout', () => this.uiElements.btnManualNext.setScale(1));
        hitMan.on('pointerup', () => { 
            this.uiElements.btnManualNext.setScale(1); 
            this.manualCurrent++;
            this.uiElements.lblManualStatus.setText(`JUGADA ${this.manualCurrent} DE ${this.manualTotal}`);
            this.executeManualSpin(); 
        });

        this.uiElements.manualStatusBox = this.add.container(0, 65); 
        const stBg = this.add.graphics();
        stBg.fillStyle(0x000000, 0.8);
        stBg.lineStyle(2, 0xffffff, 0.3);
        stBg.fillRoundedRect(-130, -22, 260, 44, 22); 
        stBg.strokeRoundedRect(-130, -22, 260, 44, 22);
        
        this.uiElements.lblManualStatus = this.add.text(0, 0, "JUGADA 1 DE 5", {
            fontFamily: 'Arial', 
            fontStyle: 'bold',   
            fontSize: '22px',    
            color: '#FFFFFF'
        }).setOrigin(0.5);
        
        this.uiElements.manualStatusBox.add([stBg, this.uiElements.lblManualStatus]);

        this.uiElements.manualBetBox = this.createStatBox("APUESTA", "$0", fontTitle, fontVal);
        this.uiElements.manualBetBox.container.setPosition(0, 145); 

        this.uiElements.manualControlsGroup.add([
            this.uiElements.btnManualNext, 
            this.uiElements.manualStatusBox, 
            this.uiElements.manualBetBox.container
        ]);
        this.uiElements.manualControlsGroup.setVisible(false);
        this.layerUI.add(this.uiElements.manualControlsGroup);


        this.uiElements.replayControlsGroup = this.add.container(0, 0);
        
        const btnRepBg = this.add.graphics();
        btnRepBg.fillStyle(0x2563eb, 1); btnRepBg.lineStyle(2, 0xffffff, 0.8);
        btnRepBg.fillRoundedRect(-110, -35, 220, 70, 15); btnRepBg.strokeRoundedRect(-110, -35, 220, 70, 15);
        const txtRep = this.add.text(0, 0, "REPRODUCIR", {fontFamily:'Luckiest Guy, Arial', fontSize:'24px', color:'#FFF'}).setOrigin(0.5);
        const hitRep = this.add.zone(0,0, 220, 70).setInteractive({cursor:'pointer'}).setOrigin(0.5);
        this.uiElements.btnReproducir = this.add.container(-130, 0, [btnRepBg, txtRep, hitRep]);
        
        hitRep.on('pointerdown', () => this.uiElements.btnReproducir.setScale(0.95));
        hitRep.on('pointerout', () => this.uiElements.btnReproducir.setScale(1));
        hitRep.on('pointerup', () => { this.uiElements.btnReproducir.setScale(1); this.executeReplay(); });

        const btnSigBg = this.add.graphics();
        btnSigBg.fillStyle(0x444444, 1); btnSigBg.lineStyle(2, 0xffffff, 0.8);
        btnSigBg.fillRoundedRect(-110, -35, 220, 70, 15); btnSigBg.strokeRoundedRect(-110, -35, 220, 70, 15);
        const txtSig = this.add.text(0, 0, "SIGUIENTE", {fontFamily:'Luckiest Guy, Arial', fontSize:'24px', color:'#FFF'}).setOrigin(0.5);
        const hitSig = this.add.zone(0,0, 220, 70).setInteractive({cursor:'pointer'}).setOrigin(0.5);
        this.uiElements.btnSiguiente = this.add.container(130, 0, [btnSigBg, txtSig, hitSig]);

        hitSig.on('pointerdown', () => this.uiElements.btnSiguiente.setScale(0.95));
        hitSig.on('pointerout', () => this.uiElements.btnSiguiente.setScale(1));
        hitSig.on('pointerup', () => { this.uiElements.btnSiguiente.setScale(1); this.exitReplay(); });

        this.uiElements.replayBetBox = this.createStatBox("APUESTA", "$0", fontTitle, fontVal);
        this.uiElements.replayBetBox.container.setPosition(0, 145); 

        this.uiElements.replayControlsGroup.add([this.uiElements.btnReproducir, this.uiElements.btnSiguiente, this.uiElements.replayBetBox.container]);
        this.uiElements.replayControlsGroup.setVisible(false);
        this.layerUI.add(this.uiElements.replayControlsGroup);

        this.currentTicket = String(Phaser.Math.Between(1, 9999999)).padStart(7, '0');
        this.lblTicket = this.add.text(0, 0, `Ticket: #${this.currentTicket}`, {
            fontFamily: 'Arial', fontSize: '14px', color: '#FFFFFF', fontStyle: 'bold'
        }).setOrigin(1, 1); 

        this.layerUI.add(this.lblTicket);
    }

    generateMockSpin(bet) {
        let forceWin = Math.random() > 0.6; 
        let grid = [];
        for(let c = 0; c < 5; c++) {
            grid[c] = [];
            for(let r = 0; r < 5; r++) grid[c][r] = Phaser.Math.Between(0, 8);
        }

        if(forceWin) {
            let sym = Phaser.Math.Between(0, 8);
            let startC = Phaser.Math.Between(1, 3);
            let startR = Phaser.Math.Between(1, 3);
            grid[startC][startR] = sym; grid[startC+1][startR] = sym;
            grid[startC][startR+1] = sym; grid[startC+1][startR+1] = sym;
        }

        let visited = Array(5).fill(false).map(() => Array(5).fill(false));
        let winGroups = [];
        let totalWin = 0;

        for(let c = 0; c < 5; c++) {
            for(let r = 0; r < 5; r++) {
                if(!visited[c][r]) {
                    let sym = grid[c][r];
                    let cluster = [];
                    let stack = [{c, r}];

                    while(stack.length > 0) {
                        let {c: curC, r: curR} = stack.pop();
                        if(curC < 0 || curC >= 5 || curR < 0 || curR >= 5) continue;
                        if(visited[curC][curR] || grid[curC][curR] !== sym) continue;

                        visited[curC][curR] = true;
                        cluster.push({c: curC, r: curR});

                        stack.push({c: curC + 1, r: curR}); stack.push({c: curC - 1, r: curR});
                        stack.push({c: curC, r: curR + 1}); stack.push({c: curC, r: curR - 1});
                    }

                    if(cluster.length >= 4) {
                        let multiplier = 0;
                        if (cluster.length === 4) multiplier = 0.5;
                        else if (cluster.length === 5) multiplier = 1;
                        else if (cluster.length >= 6 && cluster.length <= 8) multiplier = 2;
                        else multiplier = 5; 

                        let amount = bet * multiplier;
                        winGroups.push({ symbol: sym.toString(), count: cluster.length, amount: amount, positions: cluster });
                        totalWin += amount;
                    }
                }
            }
        }
        return { grid, totalWin, winGroups };
    }

    generateHistoryMockSpin(bet, targetWin) {
        let grid = [];
        for(let c = 0; c < 5; c++) {
            grid[c] = [];
            for(let r = 0; r < 5; r++) grid[c][r] = Phaser.Math.Between(0, 8);
        }
        let winGroups = [];
        
        if (targetWin > 0) {
            let sym = Phaser.Math.Between(0, 8);
            grid[1][2] = sym; grid[2][2] = sym; grid[3][2] = sym; grid[2][3] = sym;
            winGroups.push({
                symbol: sym.toString(), count: 4, amount: targetWin,
                positions: [{c:1,r:2}, {c:2,r:2}, {c:3,r:2}, {c:2,r:3}]
            });
        }
        return { grid, totalWin: targetWin, winGroups };
    }

    async spin() {
        this.clearWinAnimations();
        if(this.isSpinning) return;
        const betVal = BET_VALUES[this.currentBetIndex];

        if(!this.isManualMode) {
            if(this.balance < betVal) { 
                if (window.showReactAlert) window.showReactAlert("Saldo Insuficiente", "No tienes suficientes saldo para jugar.");
                return; 
            }
            this.balance -= betVal;
            this.uiElements.contBalance.val.setText("$" + this.formatPoints(this.balance)); 
            this.addJackpotContribution(betVal);
        }

        this.currentTicket = String(Phaser.Math.Between(1, 9999999)).padStart(7, '0');
        this.lblTicket.setText(`Ticket: #${this.currentTicket}`);

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
        else if (this.currentSpeedLevel === 3) { animDuration = 250; colDelay = 40; rowDelay = 10; }

        try {
            const data = this.generateMockSpin(betVal);
            
            // GUARDAR JUGADA PENDIENTE
            localStorage.setItem('frutilla_pending_spin', JSON.stringify({ bet: betVal, ticket: this.currentTicket, data: data }));
            await new Promise(resolve => setTimeout(resolve, 200)); 

            const resultGrid = data.grid, totalWin = data.totalWin, winGroups = data.winGroups;

            for(let c=0; c<5; c++) { 
                for(let r=0; r<5; r++) { 
                    const sym = this.symbolsMatrix[c][r];
                    sym.setTexture('symbols', resultGrid[c][r].toString());
                    sym.clearTint(); 
                    const targetScale = Math.min((CELL_W * 0.8) / sym.width, (CELL_H * 0.8) / sym.height);
                    sym.baseScale = targetScale; sym.setScale(targetScale); 
                    sym.setAlpha(1); sym.x = sym.homeX; sym.y = sym.homeY - 800; 
                    const delay = (c * colDelay) + (r * rowDelay);
                    this.tweens.add({
                        targets: sym, y: sym.homeY, duration: animDuration, delay: delay, ease: 'Back.out', 
                        onComplete: () => { if(c===4 && r===4) { this.endSpin(totalWin, winGroups); } }
                    });
                }
            }
        } catch (error) {
            console.error("Error al obtener giro:", error);
            this.isSpinning = false; 
            this.uiElements.spinBtn.setVisible(true);
            this.uiElements.btnMinus.setVisible(true);
            this.uiElements.btnPlus.setVisible(true);
            if(window.setReactSpinning) window.setReactSpinning(false);
        }
    }

    resetBoardState() {
        if(this.winTimer) this.winTimer.remove();
        this.tweens.killTweensOf([this.lblWinFloat, this.lblLoseFloat, this.lblTotalWinFloat]);
        this.lblWinFloat.setVisible(false); this.lblLoseFloat.setVisible(false); this.lblTotalWinFloat.setVisible(false); 
        this.uiElements.contWin.val.setText("$0"); this.uiElements.contWin.val.setFontSize('40px'); this.uiElements.contWin.val.setColor('#FFF');

        for(let c=0; c<5; c++) {
            for(let r=0; r<5; r++) {
                const sym = this.symbolsMatrix[c][r];
                this.tweens.killTweensOf(sym); 
                sym.setAlpha(0.6); 
                sym.setTint(0x555555);
                if (sym.baseScale) sym.setScale(sym.baseScale); 
                sym.y = sym.homeY; 
            }
        }
    }

    endSpin(totalWin, winGroups) {
        if(totalWin > 0) {
            this.accumulatedWin = 0; this.uiElements.contWin.val.setText("$0"); this.playSequentialWins(winGroups);
        } else {
            this.isSpinning = false; 
            
            // BORRAR JUGADA PENDIENTE SI NO GANÓ
            localStorage.removeItem('frutilla_pending_spin');

            if (!this.isManualMode && !this.isReplayMode) {
                this.addHistoryEntry({
                    ticketId: this.currentTicket,
                    bet: BET_VALUES[this.currentBetIndex],
                    win: 0,
                    mode: 'single'
                });
            }

            if(this.isManualMode) {
                this.finishManualSpin(0);
            } else if(this.isReplayMode) {
                this.uiElements.btnReproducir.setVisible(true);
                this.uiElements.btnSiguiente.setVisible(true);
            } else {
                this.uiElements.spinBtn.setVisible(true); 
                this.uiElements.btnMinus.setVisible(true);
                this.uiElements.btnPlus.setVisible(true);
            }

            if(window.setReactSpinning) window.setReactSpinning(false);

            this.uiElements.contWin.val.setFontSize('22px'); this.uiElements.contWin.val.setText("TICKET SIN PREMIO"); this.uiElements.contWin.val.setColor('#FFFFFF');
            
            this.lblWinFloat.setVisible(false); this.lblTotalWinFloat.setVisible(false);
            this.lblLoseFloat.setVisible(true); this.lblLoseFloat.setScale(0); 

            for(let c=0; c<5; c++) {
                for(let r=0; r<5; r++) { this.tweens.add({ targets: this.symbolsMatrix[c][r], alpha: 0.5, duration: 300, ease: 'Sine.easeOut' }); }
            }
            this.tweens.add({ targets: this.lblLoseFloat, scaleX: 1, scaleY: 1, duration: 500, ease: 'Back.out' });
        }
    }

    playSequentialWins(winGroups) {
        if(winGroups.length === 0) return;
        let currentIndex = 0;
        let countDuration = 1000; let nextWinDelay = 1500; let lblAnimDuration = 400; 

        if (this.currentSpeedLevel === 2) { countDuration = 600; nextWinDelay = 1000; lblAnimDuration = 300; } 
        else if (this.currentSpeedLevel === 3) { countDuration = 300; nextWinDelay = 600; lblAnimDuration = 200; }

        const showNext = () => {
            if(!this.isSpinning) return;
            this.clearWinAnimations();
            for(let c=0; c<5; c++) { for(let r=0; r<5; r++) { this.tweens.killTweensOf(this.symbolsMatrix[c][r]); } }
            this.lblWinFloat.setVisible(false);

            if(currentIndex >= winGroups.length) {
                
                // BORRAR JUGADA PENDIENTE AL TERMINAR LOS PREMIOS
                localStorage.removeItem('frutilla_pending_spin');

                if(!this.isReplayMode) {
                    this.balance += this.accumulatedWin;
                    this.uiElements.contBalance.val.setText("$" + this.formatPoints(this.balance));
                }

                if (!this.isManualMode && !this.isReplayMode) {
                    this.addHistoryEntry({
                        ticketId: this.currentTicket,
                        bet: BET_VALUES[this.currentBetIndex],
                        win: this.accumulatedWin,
                        mode: 'single'
                    });
                }

                for(let c=0; c<5; c++) { for(let r=0; r<5; r++) { this.symbolsMatrix[c][r].setAlpha(0.3); } }
                this.lblTotalWinFloat.setText("¡GANASTE!\n$" + this.formatPoints(this.accumulatedWin));
                this.lblTotalWinFloat.setVisible(true); this.lblTotalWinFloat.setScale(0);
                this.tweens.add({ targets: this.lblTotalWinFloat, scaleX: 1, scaleY: 1, duration: 800, ease: 'Back.out' });

                this.isSpinning = false; 

                if (this.isManualMode) {
                    this.finishManualSpin(this.accumulatedWin);
                } else if(this.isReplayMode) {
                    this.uiElements.btnReproducir.setVisible(true);
                    this.uiElements.btnSiguiente.setVisible(true);
                } else {
                    this.uiElements.spinBtn.setVisible(true); 
                    this.uiElements.btnMinus.setVisible(true);
                    this.uiElements.btnPlus.setVisible(true);
                }
                
                if(window.setReactSpinning) window.setReactSpinning(false);
                return; 
            }

            const currentGroup = winGroups[currentIndex];
            if(!currentGroup) return; 

            const startVal = this.accumulatedWin; this.accumulatedWin += currentGroup.amount; 
            this.tweens.addCounter({
                from: startVal, to: this.accumulatedWin, duration: countDuration, ease: 'Power1',
                onUpdate: (tween) => { this.uiElements.contWin.val.setText("$" + this.formatPoints(Math.floor(tween.getValue()))); }
            });
            this.uiElements.contWin.val.setColor('#FFFF00'); 

            for(let c=0; c<5; c++) {
                for(let r=0; r<5; r++) {
                    const sym = this.symbolsMatrix[c][r];
                    const isInCluster = currentGroup.positions && currentGroup.positions.some(pos => pos.c === c && pos.r === r);
                    if(isInCluster) { sym.setAlpha(1); sym.setScale(sym.baseScale); this.animateWinningSymbol(sym); } 
                    else { sym.setAlpha(0.5); this.tweens.add({ targets: sym, scaleX: sym.baseScale * 0.8, scaleY: sym.baseScale * 0.8, duration: 300, ease: 'Sine.easeOut' }); }
                }
            }

            this.lblWinFloat.setText("$" + this.formatPoints(currentGroup.amount));
            this.lblWinFloat.setVisible(true); this.lblWinFloat.setScale(0);
            this.tweens.add({ targets: this.lblWinFloat, scaleX: 1, scaleY: 1, duration: lblAnimDuration, ease: 'Back.out' });

            currentIndex++; this.winTimer = this.time.delayedCall(nextWinDelay, showNext); 
        };
        showNext();
    }

    applyResponsiveLayout(size) {
        if (!this.layerGame) return; 
        
        const w = size.width;
        const h = size.height;
        const viewportProfile = this.getViewportScaleProfile(w, h);
        const isPortrait = viewportProfile.isPortrait;
        const isMobilePortrait = viewportProfile.profileKey === 'mobile-portrait';
        const isTabletPortrait = viewportProfile.profileKey === 'tablet-portrait';
        const isMobileLandscape = viewportProfile.profileKey === 'mobile-landscape';
        const isTabletLandscape = viewportProfile.profileKey === 'tablet-landscape';
        const thresholds = viewportProfile.thresholds;
        const viewportOverrides = this.getViewportOverrides(w, h, viewportProfile) || {};
        const sharedCfg = {
            contentMinWidth: 240,
            jackpotCompactAspectThreshold: 2.2,
            jackpotCompactHeightFactor: 0.38,
            lobbyScaleMin: 0.72,
            lobbyScaleMax: 1.12,
            shopScaleMin: 0.72,
            shopScaleMax: 1.12,
            shopCardsScaleMin: 0.72,
            shopCardsScaleMax: 1.14,
            shopResultScaleMin: 0.72,
            shopResultScaleMax: 1.12,
            gameBoardScaleMin: 0.74,
            gameBoardScaleMax: 1.0,
            gameInfoScaleMin: 0.72,
            gameInfoScaleMax: 1.06,
            gameControlsScaleMin: 0.7,
            gameControlsScaleMax: 1.04,
            shopTitleScaleMin: 0.8,
            shopTitleScaleMax: 1.1
        };
        const sharedTuning = { ...sharedCfg, ...(viewportOverrides.shared || {}) };
        const sidePadding = isPortrait
            ? viewportProfile.layout.sidePaddingPortrait
            : viewportProfile.layout.sidePaddingLandscape;
        const hudRightReserve = isPortrait
            ? viewportProfile.layout.hudRightReservePortrait
            : Math.round(
                Math.max(
                    viewportProfile.layout.hudRightReserveLandscapeMin,
                    Math.min(
                        viewportProfile.layout.hudRightReserveLandscapeMax,
                        w * viewportProfile.layout.hudRightReserveLandscapeRatio
                    )
                )
            );
        const contentLeft = sidePadding;
        const contentRight = Math.max(contentLeft + sharedTuning.contentMinWidth, w - hudRightReserve - sidePadding);
        const contentWidth = Math.max(sharedTuning.contentMinWidth, contentRight - contentLeft);
        const lobbyScaleFactor = Phaser.Math.Clamp(viewportProfile.scale * viewportProfile.sections.lobby, sharedTuning.lobbyScaleMin, sharedTuning.lobbyScaleMax);
        const shopScaleFactor = Phaser.Math.Clamp(viewportProfile.scale * viewportProfile.sections.shop, sharedTuning.shopScaleMin, sharedTuning.shopScaleMax);
        const shopCardsScaleFactor = Phaser.Math.Clamp(viewportProfile.scale * viewportProfile.sections.shopCards, sharedTuning.shopCardsScaleMin, sharedTuning.shopCardsScaleMax);
        const shopResultScaleFactor = Phaser.Math.Clamp(viewportProfile.scale * viewportProfile.sections.shopResult, sharedTuning.shopResultScaleMin, sharedTuning.shopResultScaleMax);
        const gameBoardScaleFactor = Phaser.Math.Clamp(viewportProfile.scale * viewportProfile.sections.gameBoard, sharedTuning.gameBoardScaleMin, sharedTuning.gameBoardScaleMax);
        const gameInfoScaleFactor = Phaser.Math.Clamp(viewportProfile.scale * viewportProfile.sections.gameInfo, sharedTuning.gameInfoScaleMin, sharedTuning.gameInfoScaleMax);
        const gameControlsScaleFactor = Phaser.Math.Clamp(viewportProfile.scale * viewportProfile.sections.gameControls, sharedTuning.gameControlsScaleMin, sharedTuning.gameControlsScaleMax);
        const shopTitleScaleFactor = Phaser.Math.Clamp(viewportProfile.scale * viewportProfile.sections.shopTitle, sharedTuning.shopTitleScaleMin, sharedTuning.shopTitleScaleMax);
        let jackpotHandled = false;
        const hasJackpot = this.layerJackpot && this.jackpotUI && this.jackpotUI.hasVisuals();
        const jackpotAspect = hasJackpot ? this.jackpotUI.getAspect() : 1.5;
        const jackpotVisualHeightFactor = jackpotAspect < sharedTuning.jackpotCompactAspectThreshold
            ? sharedTuning.jackpotCompactHeightFactor
            : 1;
        const jackpotVisualAspect = jackpotAspect / jackpotVisualHeightFactor;
        const fitJackpotWidth = (baseWidth, maxHeightRatio) => {
            const byHeight = h * maxHeightRatio * jackpotVisualAspect;
            return Math.min(baseWidth, byHeight);
        };
        const placeJackpot = (x, top, baseWidth, maxHeightRatio) => {
            if (!hasJackpot) return null;
            const targetWidth = fitJackpotWidth(baseWidth * JACKPOT_SIZE_BOOST, maxHeightRatio);
            const layout = this.jackpotUI.layoutByTop(x, top, targetWidth);
            if (!layout) return null;

            jackpotHandled = true;
            return layout;
        };

        if(this.bg) {
            this.bg.setPosition(w/2, h/2);
            this.bg.setScale(Math.max(w/this.bg.width, h/this.bg.height));
        }

        if (this.uiElements.landscapeGameTitle) {
            this.uiElements.landscapeGameTitle.setVisible(false);
        }

        if (this.layerLobby && this.layerLobby.visible) {
            this.layerLobby.setPosition(w/2, h/2);
            const lobbyOverrides = viewportOverrides.lobby || {};
            const lobbyBase = isPortrait
                ? {
                    jackpotTop: 8,
                    jackpotWidth: Math.min(w * 0.86, 860),
                    jackpotMaxHeightRatio: 0.38,
                    titleGapFromJackpot: 26,
                    titleFallbackRatio: 0.24,
                    portraitButtonsStartGap: 200,
                    portraitButtonsGap: 100,
                    portraitButtonScaleBaseWidthRatio: 0.90,
                    portraitButtonScaleBaseWidth: 480,
                    portraitButtonScaleMin: 0.62,
                    portraitButtonScaleMax: 1.08,
                    buttonHalfHeight: 60,
                    bottomSafeMargin: 24
                }
                : {
                    jackpotTop: 10,
                    jackpotWidth: Math.min(contentWidth * 0.72, 1080),
                    jackpotMaxHeightRatio: 0.46,
                    titleGapFromJackpot: 24,
                    titleFallbackRatio: 0.20,
                    landscapeStackButtonsStartGap: 120,
                    landscapeStackButtonsGap: 140,
                    landscapeRowButtonsYGap: 50,
                    landscapeButtonBaseWidth: 480,
                    landscapeButtonsGap: 24,
                    landscapeButtonsMaxPairWidthRatio: 0.95,
                    landscapeStackScaleThreshold: 0.45,
                    landscapeStackScaleWidthRatio: 0.90,
                    landscapeStackScaleMin: 0.52,
                    landscapeStackScaleMax: 1.0,
                    landscapeRowScaleMin: 0.45,
                    landscapeRowScaleMax: 1.08,
                    landscapeRowVerticalAnchorDivisor: 3,
                    buttonHalfHeight: 60,
                    bottomSafeMargin: 24
                };
            const lobbyCfg = { ...lobbyBase, ...lobbyOverrides };

            const lobbyJackpot = placeJackpot(
                w / 2,
                lobbyCfg.jackpotTop,
                lobbyCfg.jackpotWidth,
                lobbyCfg.jackpotMaxHeightRatio
            );

            let titleWorldY = lobbyJackpot
                ? (lobbyJackpot.bottom + lobbyCfg.titleGapFromJackpot)
                : (h * lobbyCfg.titleFallbackRatio);
            this.lobbyTitle.setPosition(0, titleWorldY - (h / 2));

            if (isPortrait) {
                let scaleBtn = Phaser.Math.Clamp(
                    ((contentWidth * lobbyCfg.portraitButtonScaleBaseWidthRatio) / lobbyCfg.portraitButtonScaleBaseWidth) * lobbyScaleFactor,
                    lobbyCfg.portraitButtonScaleMin,
                    lobbyCfg.portraitButtonScaleMax
                );
                let btnComprarY = titleWorldY + lobbyCfg.portraitButtonsStartGap;
                let btnJugarY = btnComprarY + lobbyCfg.portraitButtonsGap;
                const buttonBottom = btnJugarY + (lobbyCfg.buttonHalfHeight * scaleBtn);
                const overflow = Math.max(0, buttonBottom - (h - lobbyCfg.bottomSafeMargin));
                if (overflow > 0) {
                    titleWorldY -= overflow;
                    btnComprarY -= overflow;
                    btnJugarY -= overflow;
                    this.lobbyTitle.setPosition(0, titleWorldY - (h / 2));
                }
                this.lobbyTitle.setPosition(0, titleWorldY - (h / 2));
                this.btnLobbyComprar.setPosition(0, btnComprarY - (h / 2));
                this.btnLobbyJugar.setPosition(0, btnJugarY - (h / 2));
                this.btnLobbyComprar.baseScale = scaleBtn;
                this.btnLobbyJugar.baseScale = scaleBtn;
                this.btnLobbyComprar.setScale(scaleBtn);
                this.btnLobbyJugar.setScale(scaleBtn);
            } else {
                const buttonBaseWidth = lobbyCfg.landscapeButtonBaseWidth;
                const buttonGap = lobbyCfg.landscapeButtonsGap;
                const maxButtonPairWidth = contentWidth * lobbyCfg.landscapeButtonsMaxPairWidthRatio;
                const fitScaleHorizontal = (maxButtonPairWidth - buttonGap) / (buttonBaseWidth * 2);

                if (fitScaleHorizontal < lobbyCfg.landscapeStackScaleThreshold) {
                    const scaleBtn = Phaser.Math.Clamp(
                        ((contentWidth * lobbyCfg.landscapeStackScaleWidthRatio) / buttonBaseWidth) * lobbyScaleFactor,
                        lobbyCfg.landscapeStackScaleMin,
                        lobbyCfg.landscapeStackScaleMax
                    );
                    let btnComprarY = titleWorldY + lobbyCfg.landscapeStackButtonsStartGap;
                    // Gap en px reales para que el ajuste por rango sea predecible.
                    let btnJugarY = btnComprarY + lobbyCfg.landscapeStackButtonsGap;
                    const buttonBottom = btnJugarY + (lobbyCfg.buttonHalfHeight * scaleBtn);
                    if (buttonBottom > (h - lobbyCfg.bottomSafeMargin)) {
                        const shiftUp = buttonBottom - (h - lobbyCfg.bottomSafeMargin);
                        btnComprarY -= shiftUp;
                        btnJugarY -= shiftUp;
                        titleWorldY -= shiftUp;
                        this.lobbyTitle.setPosition(0, titleWorldY - (h / 2));
                    }
                    this.btnLobbyComprar.setPosition(0, btnComprarY - (h / 2));
                    this.btnLobbyJugar.setPosition(0, btnJugarY - (h / 2));
                    this.btnLobbyComprar.baseScale = scaleBtn;
                    this.btnLobbyJugar.baseScale = scaleBtn;
                    this.btnLobbyComprar.setScale(scaleBtn);
                    this.btnLobbyJugar.setScale(scaleBtn);
                } else {
                    const scaleBtn = Phaser.Math.Clamp(
                        fitScaleHorizontal * lobbyScaleFactor,
                        lobbyCfg.landscapeRowScaleMin,
                        lobbyCfg.landscapeRowScaleMax
                    );
                    const buttonWidth = buttonBaseWidth * scaleBtn;
                    const separation = (buttonWidth / 2) + (buttonGap / 2);
                    let buttonY = titleWorldY + lobbyCfg.landscapeRowButtonsYGap;
                    const buttonBottom = buttonY + (lobbyCfg.buttonHalfHeight * scaleBtn);
                    if (buttonBottom > (h - lobbyCfg.bottomSafeMargin)) {
                        const shiftUp = buttonBottom - (h - lobbyCfg.bottomSafeMargin);
                        buttonY -= shiftUp;
                        titleWorldY -= shiftUp;
                        this.lobbyTitle.setPosition(0, titleWorldY - (h / 2));
                    }
                    this.btnLobbyComprar.setPosition(-separation, buttonY - (h / lobbyCfg.landscapeRowVerticalAnchorDivisor));
                    this.btnLobbyJugar.setPosition(separation, buttonY - (h / lobbyCfg.landscapeRowVerticalAnchorDivisor));
                    this.btnLobbyComprar.baseScale = scaleBtn;
                    this.btnLobbyJugar.baseScale = scaleBtn;
                    this.btnLobbyComprar.setScale(scaleBtn);
                    this.btnLobbyJugar.setScale(scaleBtn);
                }
            }
        }

        if (this.layerShop && this.layerShop.visible) {
            const shopOverrides = viewportOverrides.shop || {};
            const shopBase = {
                safeTopPortrait: 10,
                safeTopLandscape: 12,
                bottomReservePortraitMobile: 58,
                bottomReservePortraitTablet: 44,
                bottomReserveLandscape: 12,
                bottomReservePortraitMax: 160,
                spacingPortrait: 12,
                spacingLandscapeShort: 8,
                spacingLandscape: 14,
                spacingScaleMin: 0.86,
                spacingScaleMax: 1.06,
                splitPortraitMinWMobile: 520,
                splitPortraitMinWTablet: 640,
                narrowLandscapeMaxWMobile: 980,
                narrowLandscapeMaxWTablet: 1200,
                narrowLandscapeMaxWDesktop: 1100,
                landscapeShiftXFactor: 0.10,
                leftScalePortraitDivisor: 540,
                leftScalePortraitMin: 0.78,
                leftScalePortraitMax: 1.05,
                leftScaleLandscapeShortWidthFactor: 0.38,
                leftScaleLandscapeShortHeightFactor: 0.33,
                leftScaleLandscapeShortDivisor: 200,
                leftScaleLandscapeShortMin: 0.62,
                leftScaleLandscapeShortMax: 0.90,
                leftScaleLandscapeWidthFactor: 0.42,
                leftScaleLandscapeHeightFactor: 0.46,
                leftScaleLandscapeDivisor: 200,
                leftScaleLandscapeMin: 0.82,
                leftScaleLandscapeMax: 1.10,
                leftScaleFinalMinPortrait: 0.62,
                leftScaleFinalMinLandscape: 0.54,
                leftScaleFinalMax: 1.12,
                rightScaleShortMultiplier: 0.68,
                rightScaleCompactMultiplier: 0.78,
                titlePxPortraitMobile: 26,
                titlePxPortraitDefault: 32,
                titlePxLandscapeShort: 22,
                titlePxLandscapeNarrow: 26,
                titlePxLandscapeDefault: 32,
                topLeftTopShort: 72,
                topLeftTopDefault: 95,
                topLeftBottomShort: 44,
                topLeftBottomDefault: 62,
                topRightTopShort: 84,
                topRightTopDefault: 112,
                topRightBottomShort: 72,
                topRightBottomDefault: 110,
                shopResultXPortraitSplitRatio: 0.22,
                shopResultScaleSplitMultiplier: 0.92,
                shopResultScalePortraitMultiplier: 0.86,
                shopResultScalePortraitMin: 0.62,
                shopResultScalePortraitMax: 0.90,
                shopResultScaleLandscapeNarrow: 0.82,
                shopResultScaleMin: 0.58,
                shopResultScaleMax: 1.04,
                resultHalfHeightBase: 52,
                jackpotWidthPortraitRatio: 0.92,
                jackpotWidthPortraitMax: 760,
                jackpotWidthLandscapeShortRatio: 0.46,
                jackpotWidthLandscapeRatio: 0.52,
                jackpotWidthLandscapeMax: 760,
                jackpotHeightRatioPortrait: 0.28,
                jackpotHeightRatioLandscapeShort: 0.20,
                jackpotHeightRatioLandscape: 0.28,
                mobileShopTopLiftBase: 18,
                mobileTopLeftTop: 84,
                mobileTopLeftBottom: 68,
                portraitRightScaleMobileMin: 0.56,
                portraitRightScaleMobileMax: 0.78,
                portraitRightScaleDefaultMin: 0.66,
                portraitRightScaleDefaultMax: 1.04,
                mobileTopRightTop: 98,
                resultGapTopMobileBase: 10,
                resultGapTopSplitBase: 8,
                resultGapTopDefaultBase: 14,
                reservedResultHalfMobile: 62,
                topRightYOffsetNarrow: 8,
                rightPanelBaseNarrow: 0.28,
                rightPanelBaseDefault: 0.24,
                topLeftXRatio: -0.25,
                topRightXExtraOffset: 100,
                maxWidthPortraitRatio: 0.95,
                maxWidthLandscapeRatio: 0.98,
                cardsTopPaddingShort: 10,
                cardScaleCapShort: 1.08,
                cardScaleCapDefault: 1.2,
                cardScaleMinHeight: 20,
                cardScaleShortMultiplier: 0.92,
                portraitCardsTopMobileAdjust: 6,
                portraitCardsTopOffset: -140,
                portraitMinTopWorldGap: 4,
                portraitCardScaleMin: 0.52,
                shortLandscapeDesiredCardsShift: 50,
                cardsShiftRightSafeInset: 6,
                totalWinPortraitFallbackOffset: 22,
                ticketRowYLocalBase: 20,
                maxCenterYLocalGap: 8,
                minCenterYFromJackpotGap: 92,
                resultHalfWidthBase: 100,
                minusCenterFallbackX: -110,
                ticket20LocalFallbackX: 135,
                ticket20RightEdgeHalfWidth: 45,
                minusHalfWidth: 30,
                totalWinDesiredCenterShift: 8,
                totalWinCenterEdgeGap: 6,
                shopLandscapeTitleScaleMultiplier: 0.56,
                shopLandscapeTitleScaleMin: 0.52,
                shopLandscapeTitleScaleMax: 0.86,
                shopLandscapeTitleYOffset: 34,
                shopLandscapeTitleHalfHeightBase: 26,
                shopLandscapeResultGapBelowTitle: 12,
                shopLandscapeResultGapToCards: 8
            };
            const shopCfg = { ...shopBase, ...shopOverrides };
            const shopCenterX = isPortrait ? (w / 2) : ((contentLeft + contentRight) / 2);
            const shopLayoutWidth = isPortrait ? w : contentWidth;
            this.layerShop.setPosition(shopCenterX, h / 2);
            
            const centerY = h / 2;
            const safeTop = isPortrait ? shopCfg.safeTopPortrait : shopCfg.safeTopLandscape;
            const shopBottomInset = isPortrait ? this.getBottomSystemInset() : 0;
            const shopBottomReserveBase = isMobilePortrait
                ? shopCfg.bottomReservePortraitMobile
                : (isTabletPortrait ? shopCfg.bottomReservePortraitTablet : shopCfg.bottomReserveLandscape);
            const shopBottomReserve = isPortrait
                ? Phaser.Math.Clamp(shopBottomReserveBase + Math.max(0, shopBottomInset), shopBottomReserveBase, shopCfg.bottomReservePortraitMax)
                : shopCfg.bottomReserveLandscape;
            const isShortLandscapeShop = !isPortrait && h <= thresholds.shortLandscapeShopMaxH;
            const spacing = Math.round(
                (isPortrait
                    ? shopCfg.spacingPortrait
                    : (isShortLandscapeShop ? shopCfg.spacingLandscapeShort : shopCfg.spacingLandscape))
                * Phaser.Math.Clamp(shopScaleFactor, shopCfg.spacingScaleMin, shopCfg.spacingScaleMax)
            );
            const actualCols = this.getShopGridCols(this.shopQty, isPortrait);
            if (this.currentShopCols !== actualCols) {
                this.drawShopCards(this.shopQty);
            }
            const rows = Math.ceil(this.shopQty / actualCols);
            const { cardW: shopCardW, cardH: shopCardH, pad: shopCardPad } = this.getShopCardMetrics(this.shopQty, isPortrait);
            const gridW = (actualCols * shopCardW) + ((actualCols - 1) * shopCardPad);
            const gridH = (rows * shopCardH) + ((rows - 1) * shopCardPad);
            const splitPortraitShopInfo = isPortrait && w >= (isTabletPortrait ? shopCfg.splitPortraitMinWTablet : shopCfg.splitPortraitMinWMobile);
            const isNarrowLandscapeShop = !isPortrait && w <= (
                isMobileLandscape
                    ? shopCfg.narrowLandscapeMaxWMobile
                    : (isTabletLandscape ? shopCfg.narrowLandscapeMaxWTablet : shopCfg.narrowLandscapeMaxWDesktop)
            );
            const landscapeShopShiftX = !isPortrait
                ? (isNarrowLandscapeShop
                    ? shopLayoutWidth * shopCfg.landscapeShiftXFactor
                    : 0)
                : 0;
            const leftScaleBase = isPortrait
                ? Phaser.Math.Clamp(shopLayoutWidth / shopCfg.leftScalePortraitDivisor, shopCfg.leftScalePortraitMin, shopCfg.leftScalePortraitMax)
                : (isShortLandscapeShop
                    ? Phaser.Math.Clamp(
                        Math.min(shopLayoutWidth * shopCfg.leftScaleLandscapeShortWidthFactor, h * shopCfg.leftScaleLandscapeShortHeightFactor) / shopCfg.leftScaleLandscapeShortDivisor,
                        shopCfg.leftScaleLandscapeShortMin,
                        shopCfg.leftScaleLandscapeShortMax
                    )
                    : Phaser.Math.Clamp(
                        Math.min(shopLayoutWidth * shopCfg.leftScaleLandscapeWidthFactor, h * shopCfg.leftScaleLandscapeHeightFactor) / shopCfg.leftScaleLandscapeDivisor,
                        shopCfg.leftScaleLandscapeMin,
                        shopCfg.leftScaleLandscapeMax
                    ));
            const leftScale = Phaser.Math.Clamp(
                leftScaleBase * shopScaleFactor,
                isPortrait ? shopCfg.leftScaleFinalMinPortrait : shopCfg.leftScaleFinalMinLandscape,
                shopCfg.leftScaleFinalMax
            );
            const useCompactInfoScale = isNarrowLandscapeShop || splitPortraitShopInfo;
            const rightScale = leftScale * (
                isShortLandscapeShop
                    ? shopCfg.rightScaleShortMultiplier
                    : (useCompactInfoScale ? shopCfg.rightScaleCompactMultiplier : 1)
            );

            if (this.shopTitlePaquetes) {
                const baseTitlePx = isPortrait
                    ? (isMobilePortrait ? shopCfg.titlePxPortraitMobile : shopCfg.titlePxPortraitDefault)
                    : (isShortLandscapeShop ? shopCfg.titlePxLandscapeShort : ((!isPortrait && isNarrowLandscapeShop) ? shopCfg.titlePxLandscapeNarrow : shopCfg.titlePxLandscapeDefault));
                const titleSize = `${Math.round(baseTitlePx * shopTitleScaleFactor)}px`;
                if (this.shopTitlePaquetes.style.fontSize !== titleSize) {
                    this.shopTitlePaquetes.setFontSize(titleSize);
                }
            }

            const topLeftTop = isShortLandscapeShop ? shopCfg.topLeftTopShort : shopCfg.topLeftTopDefault;
            const topLeftBottom = isShortLandscapeShop ? shopCfg.topLeftBottomShort : shopCfg.topLeftBottomDefault;
            const topRightTop = isShortLandscapeShop ? shopCfg.topRightTopShort : shopCfg.topRightTopDefault;
            const topRightBottom = isShortLandscapeShop ? shopCfg.topRightBottomShort : shopCfg.topRightBottomDefault;
            let flowY = safeTop + spacing;
            let controlsBottomYWorld = flowY;
            let shopResultYWorld = null;
            const shopResultX = isPortrait
                ? (splitPortraitShopInfo ? shopLayoutWidth * shopCfg.shopResultXPortraitSplitRatio : 0)
                : 0;
            const shopResultScaleBase = isPortrait
                ? Phaser.Math.Clamp(
                    leftScale * (splitPortraitShopInfo ? shopCfg.shopResultScaleSplitMultiplier : shopCfg.shopResultScalePortraitMultiplier),
                    shopCfg.shopResultScalePortraitMin,
                    shopCfg.shopResultScalePortraitMax
                )
                : (isNarrowLandscapeShop ? shopCfg.shopResultScaleLandscapeNarrow : 1);
            const shopResultScale = Phaser.Math.Clamp(shopResultScaleBase * shopResultScaleFactor, shopCfg.shopResultScaleMin, shopCfg.shopResultScaleMax);
            const resultHalfHeight = shopCfg.resultHalfHeightBase * shopResultScale;

            if (this.shopTotalWinBox && this.shopTotalWinBox.container) {
                this.shopTotalWinBox.container.setScale(shopResultScale);
            }

            const shopJackpot = placeJackpot(
                isPortrait ? (w / 2) : shopCenterX,
                safeTop,
                isPortrait
                    ? Math.min(contentWidth * shopCfg.jackpotWidthPortraitRatio, shopCfg.jackpotWidthPortraitMax)
                    : Math.min(shopLayoutWidth * (isShortLandscapeShop ? shopCfg.jackpotWidthLandscapeShortRatio : shopCfg.jackpotWidthLandscapeRatio), shopCfg.jackpotWidthLandscapeMax),
                isPortrait
                    ? shopCfg.jackpotHeightRatioPortrait
                    : (isShortLandscapeShop ? shopCfg.jackpotHeightRatioLandscapeShort : shopCfg.jackpotHeightRatioLandscape)
            );
            if (shopJackpot) {
                flowY = shopJackpot.bottom + spacing;
            }

            if (isPortrait) {
                const mobileShopTopLift = isMobilePortrait ? (shopCfg.mobileShopTopLiftBase * leftScale) : 0;
                const topLeftYWorld = flowY + ((isMobilePortrait ? shopCfg.mobileTopLeftTop : topLeftTop) * leftScale) - mobileShopTopLift;
                this.shopTopLeft.setPosition(0, topLeftYWorld - centerY);
                this.shopTopLeft.setScale(leftScale);
                flowY = topLeftYWorld + ((isMobilePortrait ? shopCfg.mobileTopLeftBottom : topLeftBottom) * leftScale) + spacing;

                const portraitRightScale = isMobilePortrait
                    ? Phaser.Math.Clamp(rightScale * gameControlsScaleFactor, shopCfg.portraitRightScaleMobileMin, shopCfg.portraitRightScaleMobileMax)
                    : Phaser.Math.Clamp(rightScale * gameControlsScaleFactor, shopCfg.portraitRightScaleDefaultMin, shopCfg.portraitRightScaleDefaultMax);
                const topRightYWorld = flowY + ((isMobilePortrait ? shopCfg.mobileTopRightTop : topRightTop) * portraitRightScale);
                const portraitBetX = 0;
                this.shopTopRight.setPosition(portraitBetX, topRightYWorld - centerY);
                this.shopTopRight.setScale(portraitRightScale);
                controlsBottomYWorld = this.shopTopRight.getBounds().bottom;
                const resultGapTop = isMobilePortrait
                    ? (shopCfg.resultGapTopMobileBase * portraitRightScale)
                    : (splitPortraitShopInfo ? (shopCfg.resultGapTopSplitBase * rightScale) : (shopCfg.resultGapTopDefaultBase * rightScale));
                const reservedResultHalf = (isMobilePortrait ? shopCfg.reservedResultHalfMobile : resultHalfHeight);
                shopResultYWorld = controlsBottomYWorld + resultGapTop + reservedResultHalf;
                flowY = shopResultYWorld + reservedResultHalf + spacing;
            } else {
                const topLeftYWorld = flowY + (topLeftTop * leftScale);
                const topRightYOffset = isShortLandscapeShop ? 0 : (isNarrowLandscapeShop ? shopCfg.topRightYOffsetNarrow : 0);
                const topRightYWorld = flowY + ((topRightTop + topRightYOffset) * rightScale);
                const rightPanelBase = isNarrowLandscapeShop ? shopCfg.rightPanelBaseNarrow : shopCfg.rightPanelBaseDefault;
                const rightPanelX = shopLayoutWidth * rightPanelBase;
                this.shopTopLeft.setPosition((shopCfg.topLeftXRatio * shopLayoutWidth) + landscapeShopShiftX, topLeftYWorld - centerY);
                this.shopTopRight.setPosition(rightPanelX + landscapeShopShiftX + shopCfg.topRightXExtraOffset, topRightYWorld - centerY);
                this.shopTopLeft.setScale(leftScale);
                this.shopTopRight.setScale(rightScale);
                controlsBottomYWorld = Math.max(
                    topLeftYWorld + (topLeftBottom * leftScale),
                    topRightYWorld + (topRightBottom * rightScale)
                );
                flowY = controlsBottomYWorld + spacing;
            }

            const maxW = shopLayoutWidth * (isPortrait ? shopCfg.maxWidthPortraitRatio : shopCfg.maxWidthLandscapeRatio);
            const cardsTopPadding = isShortLandscapeShop ? shopCfg.cardsTopPaddingShort : 0;
            const cardsStartY = flowY + cardsTopPadding;
            const cardScaleCap = isShortLandscapeShop ? shopCfg.cardScaleCapShort : shopCfg.cardScaleCapDefault;
            const maxH = Math.max(h - cardsStartY - shopBottomReserve, shopCfg.cardScaleMinHeight);
            let cardScale = Math.min(maxW / gridW, cardScaleCap);
            cardScale = Math.min(cardScale * shopCardsScaleFactor, cardScaleCap);
            if (!isPortrait) {
                const cardScaleRaw = Math.min(cardScale, maxH / gridH);
                cardScale = isShortLandscapeShop ? (cardScaleRaw * shopCfg.cardScaleShortMultiplier) : cardScaleRaw;
            }
            let cardsYWorld;
            if (isPortrait) {
                const cardsBottomLimit = h - shopBottomReserve;
                let cardsTopWorld = cardsStartY + (isMobilePortrait ? shopCfg.portraitCardsTopMobileAdjust : 0) + shopCfg.portraitCardsTopOffset;
                let projectedBottom = cardsTopWorld + (gridH * cardScale);
                if (projectedBottom > cardsBottomLimit) {
                    const minTopWorld = flowY + shopCfg.portraitMinTopWorldGap;
                    const shiftUp = Math.min(projectedBottom - cardsBottomLimit, Math.max(0, cardsTopWorld - minTopWorld));
                    cardsTopWorld -= shiftUp;
                    projectedBottom = cardsTopWorld + (gridH * cardScale);
                }
                if (projectedBottom > cardsBottomLimit) {
                    const fitScale = (cardsBottomLimit - cardsTopWorld) / gridH;
                    cardScale = Phaser.Math.Clamp(Math.min(cardScale, fitScale), shopCfg.portraitCardScaleMin, cardScaleCap);
                }
                cardsYWorld = cardsTopWorld + ((gridH * cardScale) / 2);
            } else {
                cardsYWorld = cardsStartY + ((gridH * cardScale) / 2);
            }
            const cardsBlockHeight = gridH * cardScale;
            const cardsBlockWidth = gridW * cardScale;
            const cardsTop = cardsYWorld - (cardsBlockHeight / 2);
            let cardsShiftX = 0;
            if (!isPortrait && isShortLandscapeShop) {
                const desiredCardsShiftX = shopCfg.shortLandscapeDesiredCardsShift * cardScale;
                const maxCardsShiftRight = Math.max(0, (contentRight - shopCfg.cardsShiftRightSafeInset) - (shopCenterX + (cardsBlockWidth / 2)));
                cardsShiftX = Math.min(desiredCardsShiftX, maxCardsShiftRight);
            }
            this.shopCardsContainer.setPosition(cardsShiftX, cardsYWorld - centerY);
            this.shopCardsContainer.setScale(cardScale);

            let totalWinYWorld;
            if (isPortrait) {
                totalWinYWorld = (shopResultYWorld !== null)
                    ? shopResultYWorld
                    : (cardsTop - shopCfg.totalWinPortraitFallbackOffset);
            } else {
                const cardsTopLocal = this.shopCardsContainer.y - (cardsBlockHeight / 2);
                const ticketRowYLocal = this.shopTopLeft.y + (shopCfg.ticketRowYLocalBase * leftScale);
                const maxCenterYLocal = cardsTopLocal - resultHalfHeight - shopCfg.maxCenterYLocalGap;
                const minCenterYWorldForTitle = shopJackpot ? (shopJackpot.bottom + shopCfg.minCenterYFromJackpotGap) : -Infinity;
                const minCenterYLocalForTitle = minCenterYWorldForTitle - centerY;
                const preferredCenterYLocal = Math.max(ticketRowYLocal, minCenterYLocalForTitle);
                const totalWinYLocal = Math.min(preferredCenterYLocal, maxCenterYLocal);
                totalWinYWorld = totalWinYLocal + centerY;
            }
            let totalWinX;
            if (isPortrait) {
                totalWinX = shopResultX;
            } else {
                const rightScaleNow = this.shopTopRight.scaleX || rightScale;
                const resultHalfWidth = shopCfg.resultHalfWidthBase * shopResultScale;
                const minusCenterX = this.shopTopRight.x + ((this.btnShopMinus?.x ?? shopCfg.minusCenterFallbackX) * rightScaleNow);
                const ticket20LocalX = this.qtyButtons?.[3]?.x ?? shopCfg.ticket20LocalFallbackX;
                const ticket20CenterX = this.shopTopLeft.x + (ticket20LocalX * leftScale);
                const ticket20RightEdge = ticket20CenterX + (shopCfg.ticket20RightEdgeHalfWidth * leftScale);
                const minusLeftEdge = minusCenterX - (shopCfg.minusHalfWidth * rightScaleNow);
                const desiredCenter = ((ticket20CenterX + minusCenterX) / 2) - (shopCfg.totalWinDesiredCenterShift * rightScaleNow);
                const minCenterAfterTickets = ticket20RightEdge + resultHalfWidth + (shopCfg.totalWinCenterEdgeGap * rightScaleNow);
                const maxCenterBeforeControls = minusLeftEdge - resultHalfWidth - (shopCfg.totalWinCenterEdgeGap * rightScaleNow);
                totalWinX = Phaser.Math.Clamp(
                    desiredCenter,
                    minCenterAfterTickets,
                    Math.max(minCenterAfterTickets, maxCenterBeforeControls)
                );
            }
            if (!isPortrait && this.uiElements.landscapeGameTitle && shopJackpot) {
                const shopResultWorldX = shopCenterX + totalWinX;
                const titleScale = Phaser.Math.Clamp(
                    rightScale * shopCfg.shopLandscapeTitleScaleMultiplier,
                    shopCfg.shopLandscapeTitleScaleMin,
                    shopCfg.shopLandscapeTitleScaleMax
                );
                const titleY = shopJackpot.bottom + (shopCfg.shopLandscapeTitleYOffset * titleScale);
                const titleHalfHeight = shopCfg.shopLandscapeTitleHalfHeightBase * titleScale;
                const minResultCenterY = titleY + titleHalfHeight + resultHalfHeight + shopCfg.shopLandscapeResultGapBelowTitle;
                const maxResultCenterY = cardsTop - resultHalfHeight - shopCfg.shopLandscapeResultGapToCards;
                totalWinYWorld = Phaser.Math.Clamp(
                    totalWinYWorld,
                    minResultCenterY,
                    Math.max(minResultCenterY, maxResultCenterY)
                );
                this.uiElements.landscapeGameTitle.setVisible(true);
                this.uiElements.landscapeGameTitle.setPosition(shopResultWorldX, titleY);
                this.uiElements.landscapeGameTitle.setScale(titleScale);
            }
            this.shopTotalWinBox.container.setPosition(totalWinX, totalWinYWorld - centerY);
        }

        if (isPortrait) {
            const gamePortraitOverrides = viewportOverrides.gamePortrait || {};
            const gamePortraitBase = {
                jackpotTop: 8,
                jackpotWidthRatio: 0.78,
                jackpotWidthMax: 640,
                jackpotHeightRatio: 0.22,
                infoScaleCompactWidthDivisor: 760,
                infoScaleCompactMin: 0.54,
                infoScaleCompactMax: 0.72,
                infoScaleDefaultWidthDivisor: 420,
                infoScaleDefaultMin: 0.82,
                infoScaleDefaultMax: 0.96,
                infoScaleMin: 0.48,
                infoScaleMax: 0.98,
                controlsScaleVeryCompactWidthDivisor: 860,
                controlsScaleVeryCompactMin: 0.46,
                controlsScaleVeryCompactMax: 0.60,
                controlsScaleCompactWidthDivisor: 800,
                controlsScaleCompactMin: 0.50,
                controlsScaleCompactMax: 0.66,
                controlsScaleMin: 0.44,
                controlsScaleMax: 0.96,
                contWinYRatioVeryCompact: 0.64,
                contWinYRatioCompact: 0.66,
                contWinYRatioMid: 0.72,
                contWinYRatioDefault: 0.67,
                contWinGlobalYOffset: 0,
                controlsYRatioVeryCompact: 0.7,
                controlsYRatioCompact: 0.82,
                controlsYRatioMid: 0.87,
                controlsYRatioDefault: 0.84,
                controlsGlobalYOffset: 0,
                baseLiftVeryCompact: 20,
                baseLiftCompact: 16,
                baseLiftDefault: 12,
                extraLift: 20,
                bottomReserveBase: 20,
                bottomReserveMin: 20,
                bottomReserveMax: 140,
                controlsBottomReachMin: 160,
                controlsBottomReachBase: 182,
                minGapToControlsBase: 72,
                minGapToControlsScaleBase: 96,
                contWinLiftBlendRatio: 0.55,
                gameTopFallbackRatio: 0.10,
                gameTopGap: 12,
                contWinMinGapFromGameTop: 96,
                gameBottomGapToWin: 70,
                availableGameHeightMin: 190,
                portraitWidthFactorMid: 0.99,
                portraitWidthFactorDefault: 0.96,
                replayTitleYOffset: 12,
                replayBtnLeftX: -130,
                replayBtnRightX: 130
            };
            const gamePortraitCfg = { ...gamePortraitBase, ...gamePortraitOverrides };
            const gameJackpot = (this.layerGame && this.layerGame.visible)
                ? placeJackpot(
                    w / 2,
                    gamePortraitCfg.jackpotTop,
                    Math.min(w * gamePortraitCfg.jackpotWidthRatio, gamePortraitCfg.jackpotWidthMax),
                    gamePortraitCfg.jackpotHeightRatio
                )
                : null;

            const isCompactPortraitHud = w <= thresholds.compactPortraitMaxW || h <= thresholds.compactPortraitMaxH;
            const isVeryCompactPortraitHud = w <= thresholds.veryCompactPortraitMaxW || h <= thresholds.veryCompactPortraitMaxH;
            const isMidPortraitHud = w >= thresholds.midPortraitMinW && w <= thresholds.midPortraitMaxW;
            const infoScaleBase = isCompactPortraitHud
                ? Phaser.Math.Clamp(w / gamePortraitCfg.infoScaleCompactWidthDivisor, gamePortraitCfg.infoScaleCompactMin, gamePortraitCfg.infoScaleCompactMax)
                : Phaser.Math.Clamp(w / gamePortraitCfg.infoScaleDefaultWidthDivisor, gamePortraitCfg.infoScaleDefaultMin, gamePortraitCfg.infoScaleDefaultMax);
            const infoScale = Phaser.Math.Clamp(infoScaleBase * gameInfoScaleFactor, gamePortraitCfg.infoScaleMin, gamePortraitCfg.infoScaleMax);
            const controlsScaleBase = isCompactPortraitHud
                ? (isVeryCompactPortraitHud
                    ? Phaser.Math.Clamp(
                        w / gamePortraitCfg.controlsScaleVeryCompactWidthDivisor,
                        gamePortraitCfg.controlsScaleVeryCompactMin,
                        gamePortraitCfg.controlsScaleVeryCompactMax
                    )
                    : Phaser.Math.Clamp(
                        w / gamePortraitCfg.controlsScaleCompactWidthDivisor,
                        gamePortraitCfg.controlsScaleCompactMin,
                        gamePortraitCfg.controlsScaleCompactMax
                    ))
                : infoScaleBase;
            const controlsScale = Phaser.Math.Clamp(controlsScaleBase * gameControlsScaleFactor, gamePortraitCfg.controlsScaleMin, gamePortraitCfg.controlsScaleMax);

            const baseContWinY = isCompactPortraitHud
                ? h * (isVeryCompactPortraitHud ? gamePortraitCfg.contWinYRatioVeryCompact : gamePortraitCfg.contWinYRatioCompact)
                : h * (isMidPortraitHud ? gamePortraitCfg.contWinYRatioMid : gamePortraitCfg.contWinYRatioDefault);
            const baseControlsY = isCompactPortraitHud
                ? h * (isVeryCompactPortraitHud ? gamePortraitCfg.controlsYRatioVeryCompact : gamePortraitCfg.controlsYRatioCompact)
                : h * (isMidPortraitHud ? gamePortraitCfg.controlsYRatioMid : gamePortraitCfg.controlsYRatioDefault);
            const portraitBaseLift = isVeryCompactPortraitHud
                ? gamePortraitCfg.baseLiftVeryCompact
                : (isCompactPortraitHud ? gamePortraitCfg.baseLiftCompact : gamePortraitCfg.baseLiftDefault);
            const portraitExtraLift = gamePortraitCfg.extraLift;
            const bottomSystemInset = this.getBottomSystemInset();
            const portraitBottomReserve = Phaser.Math.Clamp(
                gamePortraitCfg.bottomReserveBase + bottomSystemInset,
                gamePortraitCfg.bottomReserveMin,
                gamePortraitCfg.bottomReserveMax
            );
            const controlsBottomReach = Math.max(gamePortraitCfg.controlsBottomReachMin, gamePortraitCfg.controlsBottomReachBase * controlsScale);
            const controlsMaxY = h - controlsBottomReach - portraitBottomReserve;
            let controlsY = Math.min(baseControlsY - portraitBaseLift - portraitExtraLift, controlsMaxY);
            const minGapToControls = Math.max(gamePortraitCfg.minGapToControlsBase, gamePortraitCfg.minGapToControlsScaleBase * infoScale);
            let contWinY = Math.min(
                baseContWinY - Math.round((portraitBaseLift + portraitExtraLift) * gamePortraitCfg.contWinLiftBlendRatio) - portraitExtraLift,
                controlsY - minGapToControls
            );

            const gameTop = (gameJackpot ? gameJackpot.bottom : (h * gamePortraitCfg.gameTopFallbackRatio)) + gamePortraitCfg.gameTopGap;
            const contWinMinY = gameTop + gamePortraitCfg.contWinMinGapFromGameTop;
            const contWinMaxY = controlsY - minGapToControls;
            contWinY = Phaser.Math.Clamp(contWinY, contWinMinY, Math.max(contWinMinY, contWinMaxY));
            controlsY = Phaser.Math.Clamp(controlsY, 0, controlsMaxY);
            if (controlsY < (contWinY + minGapToControls)) {
                contWinY = controlsY - minGapToControls;
            }
            contWinY = Math.max(contWinMinY, contWinY);

            const gameBottom = contWinY - gamePortraitCfg.gameBottomGapToWin;
            const availableGameHeight = Math.max(gamePortraitCfg.availableGameHeightMin, gameBottom - gameTop);
            const portraitWidthFactor = isMidPortraitHud ? gamePortraitCfg.portraitWidthFactorMid : gamePortraitCfg.portraitWidthFactorDefault;
            const baseScaleGame = Math.min((w * portraitWidthFactor) / CONFIG_GAME.reelTotalWidth, availableGameHeight / CONFIG_GAME.reelTotalHeight);
            const scaleGame = Math.min(baseScaleGame, baseScaleGame * gameBoardScaleFactor);
            const gameCenterY = gameTop + (availableGameHeight / 2);

            this.layerGame.setPosition(w / 2, gameCenterY);
            this.layerGame.setScale(scaleGame);

            this.replayTitleBox.setPosition(0, -CONFIG_GAME.reelTotalHeight / 2 - gamePortraitCfg.replayTitleYOffset);

            const contWinGlobalYOffset = Number(gamePortraitCfg.contWinGlobalYOffset) || 0;
            const contWinRenderY = contWinY + contWinGlobalYOffset;
            this.uiElements.contWin.container.setPosition(w / 2, contWinRenderY); 
            this.uiElements.contWin.container.setScale(infoScale);
            
            const controlsGlobalYOffset = Number(gamePortraitCfg.controlsGlobalYOffset) || 0;
            const controlsRenderY = controlsY + controlsGlobalYOffset;
            this.uiElements.controlsGroup.setPosition(w / 2, controlsRenderY);
            this.uiElements.controlsGroup.setScale(controlsScale);

            this.uiElements.replayControlsGroup.setPosition(w / 2, controlsRenderY);
            this.uiElements.replayControlsGroup.setScale(controlsScale);
            if (this.uiElements.btnReproducir && this.uiElements.btnSiguiente) {
                this.uiElements.btnReproducir.setX(gamePortraitCfg.replayBtnLeftX);
                this.uiElements.btnSiguiente.setX(gamePortraitCfg.replayBtnRightX);
            }

            this.uiElements.manualControlsGroup.setPosition(w / 2, controlsRenderY);
            this.uiElements.manualControlsGroup.setScale(controlsScale);
        } else {
            const gameLandscapeOverrides = viewportOverrides.gameLandscape || {};
            const gameLandscapeBase = {
                forceNarrowLayout: false,
                panelGlobalYOffset: 0,
                areaFactorMid: 0.72,
                areaFactorDefault: 0.68,
                areaFactorReplayReduce: 0.06,
                areaFactorReplayMin: 0.60,
                areaFactorReplayMax: 0.68,
                narrowGamePanelWidthThreshold: 1200,
                narrowGamePanelMinWidth: 320,
                jackpotBaseWidthNarrowFactor: 2.0,
                jackpotBaseWidthNarrowMinFactor: 0.52,
                jackpotBaseWidthNarrowMax: 640,
                jackpotBaseWidthWideFactor: 1.02,
                jackpotBaseWidthDefaultFactor: 0.92,
                jackpotBaseWidthWideMax: 700,
                jackpotBaseWidthDefaultMax: 620,
                jackpotXWideOffset: 4,
                jackpotTopNarrow: 8,
                jackpotTopWide: 10,
                jackpotHeightRatioNarrow: 0.32,
                jackpotHeightRatioWide: 0.27,
                jackpotHeightRatioDefault: 0.24,
                verticalMargin: 18,
                jackpotBoardGapMid: 8,
                jackpotBoardGapDefault: 14,
                replayTopReserve: 126,
                maxGameHeightMin: 180,
                replayWidthScaleCap: 0.85,
                widthScaleFactor: 0.97,
                defaultGameXFactor: 0.50,
                defaultGameYReplayRatio: 0.55,
                defaultGameYRatio: 0.52,
                replayTitleYOffset: 12,
                panelScaleDivisor: 340,
                panelScaleShortMin: 0.52,
                panelScaleDefaultMin: 0.74,
                panelScaleVeryShortMax: 0.78,
                panelScaleShortMax: 0.86,
                panelScaleDefaultMax: 1.02,
                controlsHalfReach: 150,
                safeGapToBoardReplay: 30,
                safeGapToBoard: 12,
                panelScaleMin: 0.46,
                panelScaleScaledMin: 0.44,
                panelScaleShortMaxPost: 0.86,
                panelScaleVeryShortMaxPost: 0.76,
                panelScaleDefaultMaxPost: 1.02,
                contWinScaleDivisor: 300,
                contWinScaleBaseMin: 0.74,
                contWinScaleBaseMax: 1.0,
                contWinScaleShortMin: 0.48,
                contWinScaleDefaultMin: 0.52,
                contWinScaleShortMax: 0.86,
                contWinScaleDefaultMax: 1.0,
                contWinScaleFinalShortMin: 0.46,
                contWinScaleFinalDefaultMin: 0.5,
                contWinScaleFinalShortMax: 0.9,
                contWinScaleFinalDefaultMax: 1.02,
                contWinYBaseRatio: 0.56,
                contWinYBaseFromJackpot: 64,
                contWinYFallbackRatio: 0.45,
                contWinYMidRatio: 0.64,
                contWinYMidOffset: 52,
                contWinYFromJackpotMinGap: 92,
                contWinYShortRatio: 0.50,
                contWinYShortLift: 10,
                landscapeTitleScaleMultiplier: 0.70,
                landscapeTitleScaleMin: 0.52,
                landscapeTitleScaleMax: 0.92,
                landscapeTitleYOffset: 34,
                landscapeTitleHalfHeightBase: 26,
                resultHalfHeightBase: 52,
                titleToResultGap: 12,
                titleReplayGap: 12,
                controlsYOffsetWide: 24,
                controlsYOffsetMid: 44,
                controlsYOffsetShort: -36,
                controlsYCapWideRatio: 0.84,
                controlsYCapMidRatio: 0.88,
                controlsYCapShortRatio: 0.66,
                controlsYCapDefaultRatio: 0.78,
                controlsYShortGap: 128,
                controlsYDefaultGap: 165,
                controlsBottomLimitShort: 10,
                controlsBottomLimitDefault: 14,
                controlsBottomReachBase: 182,
                controlsMinYVeryShortGap: 72,
                controlsMinYShortGap: 84,
                replayBtnShiftShort: 26,
                replayBtnShiftMid: 20,
                replayBtnShiftDefault: 14,
                replayBtnLeftBase: -130,
                replayBtnRightBase: 130,
                titleHalfWidthBase: 220,
                titleSafePadding: 6,
                titleMinLeftGapFromBoard: 18
            };
            const gameLandscapeCfg = { ...gameLandscapeBase, ...gameLandscapeOverrides };
            const isMidLandscapeGame = w >= thresholds.midLandscapeMinW && w <= thresholds.midLandscapeMaxW;
            const isShortLandscapeGame = h <= thresholds.shortLandscapeGameMaxH;
            const isVeryShortLandscapeGame = h <= thresholds.veryShortLandscapeGameMaxH;
            const isReplayLandscape = this.isReplayMode === true;
            const gameAreaBaseFactor = (
                isMidLandscapeGame
                    ? gameLandscapeCfg.areaFactorMid
                    : gameLandscapeCfg.areaFactorDefault
            ) * Phaser.Math.Clamp(gameBoardScaleFactor, 0.9, 1);
            const gameAreaFactor = isReplayLandscape
                ? Phaser.Math.Clamp(
                    gameAreaBaseFactor - gameLandscapeCfg.areaFactorReplayReduce,
                    gameLandscapeCfg.areaFactorReplayMin,
                    gameLandscapeCfg.areaFactorReplayMax
                )
                : gameAreaBaseFactor;
            const gameAreaWidth = contentWidth * gameAreaFactor;
            const panelAreaWidth = contentWidth - gameAreaWidth;
            const panelX = contentLeft + gameAreaWidth + (panelAreaWidth * 0.50);
            const forceNarrowLandscapeGame = gameLandscapeCfg.forceNarrowLayout === true;
            const isWideLandscapeGame = !forceNarrowLandscapeGame && w >= thresholds.wideLandscapeMinW;
            const isNarrowLandscapeGame = forceNarrowLandscapeGame || (
                !isWideLandscapeGame && (
                w < gameLandscapeCfg.narrowGamePanelWidthThreshold
                || panelAreaWidth < gameLandscapeCfg.narrowGamePanelMinWidth
                )
            );
            const jackpotBaseWidthGame = isNarrowLandscapeGame
                ? Math.min(
                    Math.max(
                        panelAreaWidth * gameLandscapeCfg.jackpotBaseWidthNarrowFactor,
                        contentWidth * gameLandscapeCfg.jackpotBaseWidthNarrowMinFactor
                    ),
                    gameLandscapeCfg.jackpotBaseWidthNarrowMax
                )
                : Math.min(
                    panelAreaWidth * (isWideLandscapeGame ? gameLandscapeCfg.jackpotBaseWidthWideFactor : gameLandscapeCfg.jackpotBaseWidthDefaultFactor),
                    isWideLandscapeGame ? gameLandscapeCfg.jackpotBaseWidthWideMax : gameLandscapeCfg.jackpotBaseWidthDefaultMax
                );
            const jackpotXGame = isNarrowLandscapeGame
                ? (w * 0.5)
                : (panelX + (isWideLandscapeGame ? gameLandscapeCfg.jackpotXWideOffset : 0));
            const gameJackpot = (this.layerGame && this.layerGame.visible)
                ? placeJackpot(
                    jackpotXGame,
                    isNarrowLandscapeGame ? gameLandscapeCfg.jackpotTopNarrow : gameLandscapeCfg.jackpotTopWide,
                    jackpotBaseWidthGame,
                    isNarrowLandscapeGame
                        ? gameLandscapeCfg.jackpotHeightRatioNarrow
                        : (isWideLandscapeGame ? gameLandscapeCfg.jackpotHeightRatioWide : gameLandscapeCfg.jackpotHeightRatioDefault)
                )
                : null;

            const gameVerticalMargin = gameLandscapeCfg.verticalMargin;
            const jackpotBoardGap = isMidLandscapeGame ? gameLandscapeCfg.jackpotBoardGapMid : gameLandscapeCfg.jackpotBoardGapDefault;
            const jackpotClearTop = gameJackpot ? (gameJackpot.bottom + jackpotBoardGap) : gameVerticalMargin;
            const replayTopReserve = isReplayLandscape ? gameLandscapeCfg.replayTopReserve : 0;
            const boardTopReserve = (isWideLandscapeGame ? gameVerticalMargin : jackpotClearTop) + replayTopReserve;
            const maxGameHeight = Math.max(gameLandscapeCfg.maxGameHeightMin, h - gameVerticalMargin - boardTopReserve);
            const replayWidthScaleCap = isReplayLandscape ? gameLandscapeCfg.replayWidthScaleCap : 1;
            const scaleGameBase = Math.min(
                (gameAreaWidth * gameLandscapeCfg.widthScaleFactor * replayWidthScaleCap) / CONFIG_GAME.reelTotalWidth,
                maxGameHeight / CONFIG_GAME.reelTotalHeight
            );
            const scaleGame = Math.min(scaleGameBase, scaleGameBase * gameBoardScaleFactor);
            const gameWidthWorld = CONFIG_GAME.reelTotalWidth * scaleGame;
            const gameHeightWorld = CONFIG_GAME.reelTotalHeight * scaleGame;
            const gameXMin = contentLeft + (gameWidthWorld / 2);
            const gameXMax = contentLeft + gameAreaWidth - (gameWidthWorld / 2);
            const defaultGameX = contentLeft + (gameAreaWidth * gameLandscapeCfg.defaultGameXFactor);
            let gameX = Phaser.Math.Clamp(defaultGameX, gameXMin, Math.max(gameXMin, gameXMax));
            const defaultGameY = h * (isReplayLandscape ? gameLandscapeCfg.defaultGameYReplayRatio : gameLandscapeCfg.defaultGameYRatio);
            const gameYMin = boardTopReserve + (gameHeightWorld / 2);
            const gameYMax = h - gameVerticalMargin - (gameHeightWorld / 2);
            const gameY = Phaser.Math.Clamp(defaultGameY, gameYMin, Math.max(gameYMin, gameYMax));

            const basePanelScale = Phaser.Math.Clamp(
                panelAreaWidth / gameLandscapeCfg.panelScaleDivisor,
                isShortLandscapeGame ? gameLandscapeCfg.panelScaleShortMin : gameLandscapeCfg.panelScaleDefaultMin,
                isShortLandscapeGame
                    ? (isVeryShortLandscapeGame ? gameLandscapeCfg.panelScaleVeryShortMax : gameLandscapeCfg.panelScaleShortMax)
                    : gameLandscapeCfg.panelScaleDefaultMax
            );
            const controlsHalfReach = gameLandscapeCfg.controlsHalfReach;
            const safeGapToBoard = isReplayLandscape ? gameLandscapeCfg.safeGapToBoardReplay : gameLandscapeCfg.safeGapToBoard;
            const desiredBoardRightMax = panelX - (controlsHalfReach * basePanelScale) - safeGapToBoard;
            const currentBoardRight = gameX + (gameWidthWorld / 2);
            if (currentBoardRight > desiredBoardRightMax) {
                const shiftLeft = currentBoardRight - desiredBoardRightMax;
                gameX = Phaser.Math.Clamp(gameX - shiftLeft, gameXMin, Math.max(gameXMin, gameXMax));
            }

            this.layerGame.setPosition(gameX, gameY); 
            this.layerGame.setScale(scaleGame);

            this.replayTitleBox.setPosition(0, -CONFIG_GAME.reelTotalHeight / 2 - gameLandscapeCfg.replayTitleYOffset);

            const boardRightEdge = gameX + (gameWidthWorld / 2);
            const availableLeftSpan = Math.max(0, panelX - boardRightEdge - safeGapToBoard);
            const fitControlsScale = availableLeftSpan / controlsHalfReach;
            const fitResultScale = availableLeftSpan / gameLandscapeCfg.resultHalfHeightBase;
            let panelScale = Phaser.Math.Clamp(
                Math.min(basePanelScale, fitControlsScale),
                gameLandscapeCfg.panelScaleMin,
                isShortLandscapeGame
                    ? (isVeryShortLandscapeGame ? gameLandscapeCfg.panelScaleVeryShortMaxPost : gameLandscapeCfg.panelScaleShortMaxPost)
                    : gameLandscapeCfg.panelScaleDefaultMaxPost
            );
            panelScale = Phaser.Math.Clamp(
                panelScale * gameControlsScaleFactor,
                gameLandscapeCfg.panelScaleScaledMin,
                isShortLandscapeGame
                    ? (isVeryShortLandscapeGame ? gameLandscapeCfg.panelScaleVeryShortMaxPost : gameLandscapeCfg.panelScaleShortMaxPost)
                    : gameLandscapeCfg.panelScaleDefaultMaxPost
            );
            const contWinScaleBase = Phaser.Math.Clamp(
                Math.min(
                    Phaser.Math.Clamp(panelAreaWidth / gameLandscapeCfg.contWinScaleDivisor, gameLandscapeCfg.contWinScaleBaseMin, gameLandscapeCfg.contWinScaleBaseMax),
                    fitResultScale
                ),
                isShortLandscapeGame ? gameLandscapeCfg.contWinScaleShortMin : gameLandscapeCfg.contWinScaleDefaultMin,
                isShortLandscapeGame ? gameLandscapeCfg.contWinScaleShortMax : gameLandscapeCfg.contWinScaleDefaultMax
            );
            const contWinScale = Phaser.Math.Clamp(
                contWinScaleBase * gameInfoScaleFactor,
                isShortLandscapeGame ? gameLandscapeCfg.contWinScaleFinalShortMin : gameLandscapeCfg.contWinScaleFinalDefaultMin,
                isShortLandscapeGame ? gameLandscapeCfg.contWinScaleFinalShortMax : gameLandscapeCfg.contWinScaleFinalDefaultMax
            );
            const contWinYBase = gameJackpot
                ? Math.min(h * gameLandscapeCfg.contWinYBaseRatio, gameJackpot.bottom + gameLandscapeCfg.contWinYBaseFromJackpot)
                : (h * gameLandscapeCfg.contWinYFallbackRatio);
            let contWinY = isMidLandscapeGame
                ? Math.min(h * gameLandscapeCfg.contWinYMidRatio, contWinYBase + gameLandscapeCfg.contWinYMidOffset)
                : contWinYBase;
            if (gameJackpot) {
                contWinY = Math.max(contWinY, gameJackpot.bottom + gameLandscapeCfg.contWinYFromJackpotMinGap);
            }
            if (isShortLandscapeGame) {
                contWinY = Math.min(h * gameLandscapeCfg.contWinYShortRatio, contWinY - gameLandscapeCfg.contWinYShortLift);
            }
            let landscapeTitleY = null;
            let landscapeTitleScale = null;
            if (this.uiElements.landscapeGameTitle && gameJackpot) {
                landscapeTitleScale = Phaser.Math.Clamp(
                    contWinScale * gameLandscapeCfg.landscapeTitleScaleMultiplier,
                    gameLandscapeCfg.landscapeTitleScaleMin,
                    gameLandscapeCfg.landscapeTitleScaleMax
                );
                landscapeTitleY = gameJackpot.bottom + (gameLandscapeCfg.landscapeTitleYOffset * landscapeTitleScale);
                const titleHalfHeight = gameLandscapeCfg.landscapeTitleHalfHeightBase * landscapeTitleScale;
                const resultHalfHeightGame = gameLandscapeCfg.resultHalfHeightBase * contWinScale;
                const minContWinY = landscapeTitleY + titleHalfHeight + resultHalfHeightGame + gameLandscapeCfg.titleToResultGap;
                contWinY = Math.max(contWinY, minContWinY);
                if (isReplayLandscape) {
                    landscapeTitleY = contWinY - resultHalfHeightGame - titleHalfHeight - gameLandscapeCfg.titleReplayGap;
                }
            }
            const controlsYOffset = (isWideLandscapeGame ? gameLandscapeCfg.controlsYOffsetWide : 0)
                + (isMidLandscapeGame ? gameLandscapeCfg.controlsYOffsetMid : 0)
                + (isShortLandscapeGame ? gameLandscapeCfg.controlsYOffsetShort : 0);
            const controlsYCap = h * (
                isWideLandscapeGame
                    ? gameLandscapeCfg.controlsYCapWideRatio
                    : (isMidLandscapeGame
                        ? gameLandscapeCfg.controlsYCapMidRatio
                        : (isShortLandscapeGame ? gameLandscapeCfg.controlsYCapShortRatio : gameLandscapeCfg.controlsYCapDefaultRatio))
            );
            let controlsY = Math.min(
                controlsYCap,
                contWinY + (isShortLandscapeGame ? gameLandscapeCfg.controlsYShortGap : gameLandscapeCfg.controlsYDefaultGap) + controlsYOffset
            );
            const controlsBottomLimit = h - (isShortLandscapeGame ? gameLandscapeCfg.controlsBottomLimitShort : gameLandscapeCfg.controlsBottomLimitDefault);
            const controlsBottomReach = gameLandscapeCfg.controlsBottomReachBase * panelScale;
            const controlsMaxY = controlsBottomLimit - controlsBottomReach;
            if (isShortLandscapeGame) {
                const controlsMinY = contWinY + (isVeryShortLandscapeGame ? gameLandscapeCfg.controlsMinYVeryShortGap : gameLandscapeCfg.controlsMinYShortGap);
                if (controlsMaxY <= controlsMinY) {
                    controlsY = controlsMaxY;
                } else {
                    controlsY = Phaser.Math.Clamp(controlsY, controlsMinY, controlsMaxY);
                }
            } else if ((controlsY + controlsBottomReach) > controlsBottomLimit) {
                controlsY -= (controlsY + controlsBottomReach) - controlsBottomLimit;
            }
            const panelGlobalYOffset = Number(gameLandscapeCfg.panelGlobalYOffset) || 0;
            if (panelGlobalYOffset !== 0) {
                contWinY += panelGlobalYOffset;
                controlsY += panelGlobalYOffset;
                if (landscapeTitleY !== null) {
                    landscapeTitleY += panelGlobalYOffset;
                }
            }
            this.uiElements.contWin.container.setPosition(panelX, contWinY); 
            this.uiElements.contWin.container.setScale(contWinScale);
            
            this.uiElements.controlsGroup.setPosition(panelX, controlsY);
            this.uiElements.controlsGroup.setScale(panelScale);

            this.uiElements.replayControlsGroup.setPosition(panelX, controlsY);
            this.uiElements.replayControlsGroup.setScale(panelScale);
            if (this.uiElements.btnReproducir && this.uiElements.btnSiguiente) {
                const replayBtnShiftRight = isShortLandscapeGame
                    ? gameLandscapeCfg.replayBtnShiftShort
                    : (isMidLandscapeGame ? gameLandscapeCfg.replayBtnShiftMid : gameLandscapeCfg.replayBtnShiftDefault);
                this.uiElements.btnReproducir.setX(gameLandscapeCfg.replayBtnLeftBase + replayBtnShiftRight);
                this.uiElements.btnSiguiente.setX(gameLandscapeCfg.replayBtnRightBase);
            }

            this.uiElements.manualControlsGroup.setPosition(panelX, controlsY);
            this.uiElements.manualControlsGroup.setScale(panelScale);

            if (this.uiElements.landscapeGameTitle && gameJackpot && landscapeTitleY !== null && landscapeTitleScale !== null) {
                const titleHalfWidth = gameLandscapeCfg.titleHalfWidthBase * landscapeTitleScale;
                const minTitleX = contentLeft + titleHalfWidth + gameLandscapeCfg.titleSafePadding;
                const maxTitleX = contentRight - titleHalfWidth - gameLandscapeCfg.titleSafePadding;
                let titleX = Phaser.Math.Clamp(panelX, minTitleX, Math.max(minTitleX, maxTitleX));
                if (isReplayLandscape) {
                    titleX = Phaser.Math.Clamp(panelX, minTitleX, Math.max(minTitleX, maxTitleX));
                }
                this.uiElements.landscapeGameTitle.setVisible(true);
                this.uiElements.landscapeGameTitle.setPosition(titleX, landscapeTitleY);
                this.uiElements.landscapeGameTitle.setScale(landscapeTitleScale);
                const titleBounds = this.uiElements.landscapeGameTitle.getBounds();
                if (!isReplayLandscape) {
                    const minLeft = boardRightEdge + gameLandscapeCfg.titleMinLeftGapFromBoard;
                    if (titleBounds.left < minLeft) {
                        titleX += (minLeft - titleBounds.left);
                    }
                }
                if (titleBounds.right > (contentRight - gameLandscapeCfg.titleSafePadding)) {
                    titleX -= (titleBounds.right - (contentRight - gameLandscapeCfg.titleSafePadding));
                }
                this.uiElements.landscapeGameTitle.setPosition(titleX, landscapeTitleY);
            }
        }

        if (this.maskShape) { this.maskShape.setPosition(this.layerGame.x, this.layerGame.y); this.maskShape.setScale(this.layerGame.scaleX, this.layerGame.scaleY); }
        if (this.layerTopText) { this.layerTopText.setPosition(this.layerGame.x, this.layerGame.y); this.layerTopText.setScale(this.layerGame.scaleX, this.layerGame.scaleY); }
        const hudOverrides = viewportOverrides.hud || {};
        const hudBase = {
            ticketXPortraitOffset: 15,
            ticketXLandscapeShortRatio: 0.64,
            ticketXLandscapeRightOffset: 10,
            ticketBottomOffset: 15,
            dockButtonSize: 38,
            dockGap: 6,
            dockCount: 5,
            dockBottomMargin: 10,
            dockMinTop: 8,
            dockBoardOffset: 12,
            dockShopTop: viewportProfile.layout.hudDockTopShop,
            dockLobbyOffset: -200
        };
        const hudCfg = { ...hudBase, ...hudOverrides };
        if (this.lblTicket) {
            const isShortLandscapeHud = !isPortrait && h <= thresholds.shortLandscapeGameMaxH;
            const ticketX = isPortrait
                ? (w - hudCfg.ticketXPortraitOffset)
                : (isShortLandscapeHud ? (contentLeft + (contentWidth * hudCfg.ticketXLandscapeShortRatio)) : (contentRight - hudCfg.ticketXLandscapeRightOffset));
            this.lblTicket.setPosition(ticketX, h - hudCfg.ticketBottomOffset);
        }

        if (window.setHudDockTop) {
            let hudDockTop = null;
            if (isMobilePortrait || isTabletPortrait) {
                const hudBtnSize = hudCfg.dockButtonSize;
                const hudGap = hudCfg.dockGap;
                const hudCount = hudCfg.dockCount;
                const hudStackHeight = (hudBtnSize * hudCount) + (hudGap * (hudCount - 1));
                const maxTop = h - hudStackHeight - hudCfg.dockBottomMargin;

                if (this.layerGame && this.layerGame.visible) {
                    const boardBottom = this.layerGame.y + ((CONFIG_GAME.reelTotalHeight * this.layerGame.scaleY) / 2);
                    hudDockTop = Math.round(Phaser.Math.Clamp(boardBottom + hudCfg.dockBoardOffset, hudCfg.dockMinTop, maxTop));
                } else if (this.layerShop && this.layerShop.visible) {
                    // En tienda se ancla arriba para no tapar la grilla de tickets.
                    hudDockTop = Math.round(Phaser.Math.Clamp(hudCfg.dockShopTop, hudCfg.dockMinTop, maxTop));
                } else if (this.layerLobby && this.layerLobby.visible && this.btnLobbyJugar) {
                    const playBottom = this.btnLobbyJugar.getBounds().bottom;
                    hudDockTop = Math.round(Phaser.Math.Clamp(playBottom + hudCfg.dockLobbyOffset, hudCfg.dockMinTop, maxTop));
                }
            }
            window.setHudDockTop(hudDockTop);
        }

        if (!jackpotHandled && hasJackpot) {
            const fallbackOverrides = viewportOverrides.fallbackJackpot || {};
            const fallbackBase = {
                gameShopPortraitXRatio: 0.5,
                gameShopPortraitYRatio: 0.14,
                gameShopPortraitWidthRatio: 0.82,
                gameShopPortraitWidthMax: 720,
                gameShopPortraitMaxHeightRatio: 0.28,
                gameShopLandscapeWidthRatio: 0.40,
                gameShopLandscapeWidthMax: 620,
                gameShopLandscapeMaxHeightRatio: 0.30,
                gameShopLandscapeXInset: 8,
                gameShopLandscapeCenterY: 90,
                lobbySafeTopPortrait: 10,
                lobbySafeTopLandscape: 12,
                lobbyTitleFallbackPortraitRatio: 0.35,
                lobbyTitleFallbackLandscapeRatio: 0.33,
                lobbyMaxHeightMin: 80,
                lobbyMaxHeightBottomGap: 16,
                lobbyWidthRatio: 0.88,
                lobbyWidthMax: 920
            };
            const fallbackCfg = { ...fallbackBase, ...fallbackOverrides };
            let jackpotX;
            let jackpotCenterY;
            let targetWidth;
            if ((this.layerGame && this.layerGame.visible) || (this.layerShop && this.layerShop.visible)) {
                if (isPortrait) {
                    jackpotX = w * fallbackCfg.gameShopPortraitXRatio;
                    jackpotCenterY = h * fallbackCfg.gameShopPortraitYRatio;
                    targetWidth = fitJackpotWidth(
                        Math.min(w * fallbackCfg.gameShopPortraitWidthRatio, fallbackCfg.gameShopPortraitWidthMax) * JACKPOT_SIZE_BOOST,
                        fallbackCfg.gameShopPortraitMaxHeightRatio
                    );
                } else {
                    targetWidth = fitJackpotWidth(
                        Math.min(contentWidth * fallbackCfg.gameShopLandscapeWidthRatio, fallbackCfg.gameShopLandscapeWidthMax) * JACKPOT_SIZE_BOOST,
                        fallbackCfg.gameShopLandscapeMaxHeightRatio
                    );
                    jackpotX = contentRight - (targetWidth / 2) - fallbackCfg.gameShopLandscapeXInset;
                    jackpotCenterY = fallbackCfg.gameShopLandscapeCenterY;
                }
            } else {
                const safeTop = isPortrait ? fallbackCfg.lobbySafeTopPortrait : fallbackCfg.lobbySafeTopLandscape;
                const lobbyTitleWorldY = this.lobbyTitle
                    ? (this.layerLobby.y + this.lobbyTitle.y)
                    : (isPortrait ? h * fallbackCfg.lobbyTitleFallbackPortraitRatio : h * fallbackCfg.lobbyTitleFallbackLandscapeRatio);
                const maxLobbyHeight = Math.max(fallbackCfg.lobbyMaxHeightMin, lobbyTitleWorldY - safeTop - fallbackCfg.lobbyMaxHeightBottomGap);
                jackpotX = w / 2;
                jackpotCenterY = safeTop + (maxLobbyHeight / 2);
                targetWidth = Math.min(
                    Math.min(w * fallbackCfg.lobbyWidthRatio, fallbackCfg.lobbyWidthMax) * JACKPOT_SIZE_BOOST,
                    maxLobbyHeight * jackpotAspect
                );
            }
            this.jackpotUI.layoutByCenterY(jackpotX, jackpotCenterY, targetWidth);
        }
    }

    animateWinningSymbol(originalSprite) {
        const matrix = originalSprite.getWorldTransformMatrix();
        const clone = this.add.image(matrix.tx, matrix.ty, originalSprite.texture.key, originalSprite.frame.name);
        clone.setScale(matrix.scaleX, matrix.scaleY); this.layerAnimations.add(clone); originalSprite.alpha = 0;

        let pulseDuration = 750;
        if (this.currentSpeedLevel === 2) pulseDuration = 500; else if (this.currentSpeedLevel === 3) pulseDuration = 250;
        this.tweens.add({ targets: clone, scaleX: matrix.scaleX * 1.50, scaleY: matrix.scaleY * 1.50, duration: pulseDuration, yoyo: true, repeat: 0, ease: 'Sine.easeInOut' });

        if (!this.winningClones) this.winningClones = [];
        this.winningClones.push({ clone: clone, original: originalSprite });
    }

    clearWinAnimations() {
        if (!this.winningClones) return;
        this.winningClones.forEach(item => { item.clone.destroy(); item.original.alpha = 1; if (item.original.baseScale) { item.original.setScale(item.original.baseScale); } });
        this.winningClones = []; 
    }
}
