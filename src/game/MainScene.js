import Phaser from 'phaser';
import pozoAsset from '../assets/pozo.webp';
import { JackpotUI } from '../components/JackpotUI';

const CONFIG_GAME = { reelTotalWidth: 700, reelTotalHeight: 600, reels: 5, rows: 5 };
const CELL_W = CONFIG_GAME.reelTotalWidth / CONFIG_GAME.reels; 
const CELL_H = CONFIG_GAME.reelTotalHeight / CONFIG_GAME.rows;
const BET_VALUES = [100, 200, 300, 400, 500, 1000, 2000, 5000, 10000];
const JACKPOT_SIZE_BOOST = 1.15;
const HISTORY_STORAGE_KEY = 'frutilla_history_v1';

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
            this.resizeTimer = setTimeout(() => this.onResize(gameSize), 50);
        });
        
        this.onResize({ width: this.scale.width, height: this.scale.height });
        
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
        this.onResize({ width: this.scale.width, height: this.scale.height });
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
        this.onResize({ width: this.scale.width, height: this.scale.height });

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
        this.onResize({ width: this.scale.width, height: this.scale.height });
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
        
        const cardW = 100, cardH = 140, pad = 10;
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
            
            let txt = this.add.text(0, 0, "?", { fontSize: '45px', fontFamily: 'Luckiest Guy, Arial', color: '#aaaaaa', align: 'center' }).setOrigin(0.5);
            let btnVerBg = this.add.graphics().setVisible(false);
            let btnVerTxt = this.add.text(0, 40, "VER", { fontFamily: 'Luckiest Guy, Arial', fontSize: '18px', color: '#FFF' }).setOrigin(0.5).setVisible(false);
            let hit = this.add.zone(0, 0, cardW, cardH).setOrigin(0.5); 
            
            card.add([bg, txt, btnVerBg, btnVerTxt, hit]);
            card.bg = bg; card.txt = txt; card.btnVerBg = btnVerBg; card.btnVerTxt = btnVerTxt;
            card.hit = hit; card.cardW = cardW; card.cardH = cardH; card.replayData = null;
            
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
            this.onResize({ width: this.scale.width, height: this.scale.height });
        }
    }

    resetShopCards() {
        this.shopCards.forEach(card => {
            card.setScale(1);
            card.bg.clear();
            card.bg.fillStyle(0x333333, 1); card.bg.lineStyle(2, 0xffffff, 0.3);
            card.bg.fillRoundedRect(-card.cardW/2, -card.cardH/2, card.cardW, card.cardH, 10);
            card.bg.strokeRoundedRect(-card.cardW/2, -card.cardH/2, card.cardW, card.cardH, 10);
            card.txt.setText("?"); card.txt.setY(0); card.txt.setColor('#aaaaaa'); card.txt.setFontSize('45px');
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
                        card.txt.setFontSize(isWin ? '20px' : '16px');
                        card.txt.setColor(isWin ? '#FFD700' : '#888888');
                        card.txt.setY(-20); 

                        card.btnVerBg.clear();
                        card.btnVerBg.fillStyle(0x00C853, 1); 
                        card.btnVerBg.lineStyle(1, 0xffffff, 0.8);
                        card.btnVerBg.fillRoundedRect(-35, 25, 70, 30, 8);
                        card.btnVerBg.strokeRoundedRect(-35, 25, 70, 30, 8);
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
        this.onResize({ width: this.scale.width, height: this.scale.height });
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
        this.onResize({ width: this.scale.width, height: this.scale.height });

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

    onResize(size) {
        if (!this.layerGame) return; 
        
        const w = size.width;
        const h = size.height;
        const isPortrait = h > w;
        const isMobilePortrait = isPortrait && w <= 900;
        const sidePadding = isPortrait ? 10 : 16;
        const hudRightReserve = isPortrait
            ? (isMobilePortrait ? 66 : 10)
            : Math.round(Math.max(88, Math.min(132, w * 0.10)));
        const contentLeft = sidePadding;
        const contentRight = Math.max(contentLeft + 240, w - hudRightReserve - sidePadding);
        const contentWidth = Math.max(240, contentRight - contentLeft);
        let jackpotHandled = false;
        const hasJackpot = this.layerJackpot && this.jackpotUI && this.jackpotUI.hasVisuals();
        const jackpotAspect = hasJackpot ? this.jackpotUI.getAspect() : 1.5;
        const jackpotVisualHeightFactor = jackpotAspect < 2.2 ? 0.38 : 1;
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

            const lobbyJackpot = placeJackpot(
                w / 2,
                isPortrait ? 8 : 10,
                isPortrait ? Math.min(w * 0.86, 860) : Math.min(contentWidth * 0.72, 1080),
                isPortrait ? 0.38 : 0.46
            );

            let titleWorldY = lobbyJackpot ? (lobbyJackpot.bottom + (isPortrait ? 26 : 24)) : (isPortrait ? h * 0.24 : h * 0.20);
            this.lobbyTitle.setPosition(0, titleWorldY - (h / 2));

            if (isPortrait) {
                let scaleBtn = Phaser.Math.Clamp((contentWidth * 0.90) / 480, 0.68, 1.0);
                let btnComprarY = titleWorldY + 130;
                let btnJugarY = btnComprarY + 145;
                const buttonBottom = btnJugarY + (60 * scaleBtn);
                const overflow = Math.max(0, buttonBottom - (h - 24));
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
                const buttonBaseWidth = 480;
                const buttonGap = 24;
                const maxButtonPairWidth = contentWidth * 0.95;
                const fitScaleHorizontal = (maxButtonPairWidth - buttonGap) / (buttonBaseWidth * 2);

                if (fitScaleHorizontal < 0.45) {
                    const scaleBtn = Phaser.Math.Clamp((contentWidth * 0.90) / buttonBaseWidth, 0.58, 0.95);
                    let btnComprarY = titleWorldY + 120;
                    let btnJugarY = btnComprarY + (140 * scaleBtn);
                    const buttonBottom = btnJugarY + (60 * scaleBtn);
                    if (buttonBottom > (h - 24)) {
                        const shiftUp = buttonBottom - (h - 24);
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
                    const scaleBtn = Phaser.Math.Clamp(fitScaleHorizontal, 0.45, 1.08);
                    const buttonWidth = buttonBaseWidth * scaleBtn;
                    const separation = (buttonWidth / 2) + (buttonGap / 2);
                    let buttonY = titleWorldY + 145;
                    const buttonBottom = buttonY + (60 * scaleBtn);
                    if (buttonBottom > (h - 24)) {
                        const shiftUp = buttonBottom - (h - 24);
                        buttonY -= shiftUp;
                        titleWorldY -= shiftUp;
                        this.lobbyTitle.setPosition(0, titleWorldY - (h / 2));
                    }
                    this.btnLobbyComprar.setPosition(-separation, buttonY - (h / 2));
                    this.btnLobbyJugar.setPosition(separation, buttonY - (h / 2));
                    this.btnLobbyComprar.baseScale = scaleBtn;
                    this.btnLobbyJugar.baseScale = scaleBtn;
                    this.btnLobbyComprar.setScale(scaleBtn);
                    this.btnLobbyJugar.setScale(scaleBtn);
                }
            }
        }

        if (this.layerShop && this.layerShop.visible) {
            const shopCenterX = isPortrait ? (w / 2) : ((contentLeft + contentRight) / 2);
            const shopLayoutWidth = isPortrait ? w : contentWidth;
            this.layerShop.setPosition(shopCenterX, h / 2);
            
            const centerY = h / 2;
            const safeTop = isPortrait ? 10 : 12;
            const isShortLandscapeShop = !isPortrait && h <= 430;
            const spacing = isPortrait ? 12 : (isShortLandscapeShop ? 8 : 14);
            const actualCols = this.getShopGridCols(this.shopQty, isPortrait);
            if (this.currentShopCols !== actualCols) {
                this.drawShopCards(this.shopQty);
            }
            const rows = Math.ceil(this.shopQty / actualCols);
            const gridW = (actualCols * 100) + ((actualCols - 1) * 10);
            const gridH = (rows * 140) + ((rows - 1) * 10);
            const isDenseShopLayout = this.shopQty >= 15;
            const splitPortraitShopInfo = isPortrait && w >= 520;
            const isNarrowLandscapeShop = !isPortrait && w <= 1100;
            const landscapeShopShiftX = !isPortrait
                ? (isNarrowLandscapeShop
                    ? shopLayoutWidth * 0.10
                    : (isDenseShopLayout ? shopLayoutWidth * 0.06 : 0))
                : 0;
            const leftScale = isPortrait
                ? Phaser.Math.Clamp(shopLayoutWidth / 540, 0.78, 1.05)
                : (isShortLandscapeShop
                    ? Phaser.Math.Clamp(Math.min(shopLayoutWidth * 0.38, h * 0.33) / 200, 0.62, 0.90)
                    : Phaser.Math.Clamp(Math.min(shopLayoutWidth * 0.42, h * 0.46) / 200, 0.82, 1.10));
            const useCompactInfoScale = isDenseShopLayout || isNarrowLandscapeShop || splitPortraitShopInfo;
            const rightScale = leftScale * (isShortLandscapeShop ? 0.68 : (useCompactInfoScale ? 0.78 : 1));

            if (this.shopTitlePaquetes) {
                const titleSize = isPortrait
                    ? (isMobilePortrait ? '26px' : '32px')
                    : (isShortLandscapeShop ? '22px' : ((!isPortrait && isNarrowLandscapeShop) ? '26px' : '32px'));
                if (this.shopTitlePaquetes.style.fontSize !== titleSize) {
                    this.shopTitlePaquetes.setFontSize(titleSize);
                }
            }

            const topLeftTop = isShortLandscapeShop ? 72 : 95;
            const topLeftBottom = isShortLandscapeShop ? 44 : 62;
            const topRightTop = isShortLandscapeShop ? 84 : 112;
            const topRightBottom = isShortLandscapeShop ? 72 : 110;
            let flowY = safeTop + spacing;
            let controlsBottomYWorld = flowY;
            let shopResultYWorld = null;
            const shopResultX = isPortrait
                ? (splitPortraitShopInfo ? shopLayoutWidth * 0.22 : 0)
                : 0;
            const shopResultScale = isPortrait
                ? Phaser.Math.Clamp(leftScale * (splitPortraitShopInfo ? 0.92 : 0.86), 0.62, 0.9)
                : (isNarrowLandscapeShop ? 0.82 : 1);
            const resultHalfHeight = 52 * shopResultScale;

            if (this.shopTotalWinBox && this.shopTotalWinBox.container) {
                this.shopTotalWinBox.container.setScale(shopResultScale);
            }

            const shopJackpot = placeJackpot(
                isPortrait ? (w / 2) : shopCenterX,
                safeTop,
                isPortrait ? Math.min(contentWidth * 0.92, 760) : Math.min(shopLayoutWidth * (isShortLandscapeShop ? 0.46 : 0.52), 760),
                isPortrait ? 0.28 : (isShortLandscapeShop ? 0.20 : 0.28)
            );
            if (shopJackpot) {
                flowY = shopJackpot.bottom + spacing;
            }

            if (isPortrait) {
                const mobileShopTopLift = isMobilePortrait ? (18 * leftScale) : 0;
                const topLeftYWorld = flowY + ((isMobilePortrait ? 84 : topLeftTop) * leftScale) - mobileShopTopLift;
                this.shopTopLeft.setPosition(0, topLeftYWorld - centerY);
                this.shopTopLeft.setScale(leftScale);
                flowY = topLeftYWorld + ((isMobilePortrait ? 68 : topLeftBottom) * leftScale) + spacing;

                const portraitRightScale = isMobilePortrait
                    ? Phaser.Math.Clamp(rightScale, 0.56, 0.76)
                    : rightScale;
                const topRightYWorld = flowY + ((isMobilePortrait ? 98 : topRightTop) * portraitRightScale);
                const portraitBetX = 0;
                this.shopTopRight.setPosition(portraitBetX, topRightYWorld - centerY);
                this.shopTopRight.setScale(portraitRightScale);
                controlsBottomYWorld = this.shopTopRight.getBounds().bottom;
                const resultGapTop = isMobilePortrait ? (10 * portraitRightScale) : (splitPortraitShopInfo ? (8 * rightScale) : (14 * rightScale));
                const reservedResultHalf = (isMobilePortrait ? 62 : resultHalfHeight);
                shopResultYWorld = controlsBottomYWorld + resultGapTop + reservedResultHalf;
                flowY = shopResultYWorld + reservedResultHalf + spacing;
            } else {
                const topLeftYWorld = flowY + (topLeftTop * leftScale);
                const topRightYOffset = isShortLandscapeShop ? 0 : (isNarrowLandscapeShop ? 8 : 0);
                const topRightYWorld = flowY + ((topRightTop + topRightYOffset) * rightScale);
                const rightPanelBase = isNarrowLandscapeShop ? 0.28 : (isDenseShopLayout ? 0.28 : 0.24);
                const rightPanelX = shopLayoutWidth * rightPanelBase;
                this.shopTopLeft.setPosition((-shopLayoutWidth * 0.25) + landscapeShopShiftX, topLeftYWorld - centerY);
                this.shopTopRight.setPosition(rightPanelX + landscapeShopShiftX, topRightYWorld - centerY);
                this.shopTopLeft.setScale(leftScale);
                this.shopTopRight.setScale(rightScale);
                controlsBottomYWorld = Math.max(
                    topLeftYWorld + (topLeftBottom * leftScale),
                    topRightYWorld + (topRightBottom * rightScale)
                );
                flowY = controlsBottomYWorld + spacing;
            }

            if (!isPortrait && isDenseShopLayout && !isShortLandscapeShop) {
                // Da más aire entre controles superiores y la grilla cuando hay 15/20 tickets.
                flowY += 20;
            }

            const maxW = shopLayoutWidth * (isPortrait ? 0.95 : 0.98);
            const cardsTopPadding = isShortLandscapeShop ? 10 : 0;
            const cardsStartY = flowY + cardsTopPadding;
            const maxH = Math.max(h - cardsStartY - 12, 20);
            const cardScaleCap = isShortLandscapeShop ? 1.08 : 1.2;
            const cardScaleRaw = Math.min(maxW / gridW, maxH / gridH, cardScaleCap);
            const cardScale = isShortLandscapeShop ? (cardScaleRaw * 0.92) : cardScaleRaw;
            const cardsBlockHeight = gridH * cardScale;
            const cardsBlockWidth = gridW * cardScale;
            let cardsYWorld;
            if (isPortrait) {
                const cardsCenterTarget = cardsStartY + (maxH * (isMobilePortrait ? 0.46 : 0.68));
                const cardsCenterMin = cardsStartY + (cardsBlockHeight / 2);
                const cardsCenterMax = h - 12 - (cardsBlockHeight / 2);
                cardsYWorld = Phaser.Math.Clamp(cardsCenterTarget, cardsCenterMin, Math.max(cardsCenterMin, cardsCenterMax));
            } else {
                cardsYWorld = cardsStartY + (cardsBlockHeight / 2);
            }
            const cardsTop = cardsYWorld - (cardsBlockHeight / 2);
            let cardsShiftX = 0;
            if (!isPortrait && isShortLandscapeShop) {
                const desiredCardsShiftX = 50 * cardScale;
                const maxCardsShiftRight = Math.max(0, (contentRight - 6) - (shopCenterX + (cardsBlockWidth / 2)));
                cardsShiftX = Math.min(desiredCardsShiftX, maxCardsShiftRight);
            }
            this.shopCardsContainer.setPosition(cardsShiftX, cardsYWorld - centerY);
            this.shopCardsContainer.setScale(cardScale);

            let totalWinYWorld;
            if (isPortrait) {
                totalWinYWorld = (shopResultYWorld !== null)
                    ? shopResultYWorld
                    : (cardsTop - 22);
            } else {
                const cardsTopLocal = this.shopCardsContainer.y - (cardsBlockHeight / 2);
                const ticketRowYLocal = this.shopTopLeft.y + (20 * leftScale);
                const maxCenterYLocal = cardsTopLocal - resultHalfHeight - 8;
                const minCenterYWorldForTitle = shopJackpot ? (shopJackpot.bottom + 92) : -Infinity;
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
                const resultHalfWidth = 100 * shopResultScale;
                const minusCenterX = this.shopTopRight.x + ((this.btnShopMinus?.x ?? -110) * rightScaleNow);
                const ticket20LocalX = this.qtyButtons?.[3]?.x ?? 135;
                const ticket20CenterX = this.shopTopLeft.x + (ticket20LocalX * leftScale);
                const ticket20RightEdge = ticket20CenterX + (45 * leftScale);
                const minusLeftEdge = minusCenterX - (30 * rightScaleNow);
                const desiredCenter = ((ticket20CenterX + minusCenterX) / 2) - (8 * rightScaleNow);
                const minCenterAfterTickets = ticket20RightEdge + resultHalfWidth + (6 * rightScaleNow);
                const maxCenterBeforeControls = minusLeftEdge - resultHalfWidth - (6 * rightScaleNow);
                totalWinX = Phaser.Math.Clamp(
                    desiredCenter,
                    minCenterAfterTickets,
                    Math.max(minCenterAfterTickets, maxCenterBeforeControls)
                );
            }
            if (!isPortrait && this.uiElements.landscapeGameTitle && shopJackpot) {
                const shopResultWorldX = shopCenterX + totalWinX;
                const titleScale = Phaser.Math.Clamp(rightScale * 0.56, 0.52, 0.86);
                const titleY = shopJackpot.bottom + (34 * titleScale);
                const titleHalfHeight = 26 * titleScale;
                const minResultCenterY = titleY + titleHalfHeight + resultHalfHeight + 12;
                const maxResultCenterY = cardsTop - resultHalfHeight - 8;
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
            const gameJackpot = (this.layerGame && this.layerGame.visible)
                ? placeJackpot(w / 2, 8, Math.min(w * 0.78, 640), 0.22)
                : null;

            const isCompactPortraitHud = w <= 720 || h <= 900;
            const isVeryCompactPortraitHud = w <= 460 || h <= 760;
            const isMidPortraitHud = w >= 722 && w <= 900;
            const infoScale = isCompactPortraitHud
                ? Phaser.Math.Clamp(w / 760, 0.54, 0.72)
                : Phaser.Math.Clamp(w / 420, 0.82, 0.96);
            const controlsScale = isCompactPortraitHud
                ? (isVeryCompactPortraitHud
                    ? Phaser.Math.Clamp(w / 860, 0.46, 0.60)
                    : Phaser.Math.Clamp(w / 800, 0.50, 0.66))
                : infoScale;

            const baseContWinY = isCompactPortraitHud
                ? h * (isVeryCompactPortraitHud ? 0.64 : 0.66)
                : h * (isMidPortraitHud ? 0.72 : 0.67);
            const baseControlsY = isCompactPortraitHud
                ? h * (isVeryCompactPortraitHud ? 0.80 : 0.82)
                : h * (isMidPortraitHud ? 0.87 : 0.84);
            const portraitBaseLift = isVeryCompactPortraitHud ? 20 : (isCompactPortraitHud ? 16 : 12);
            const portraitExtraLift = 10;
            const bottomSystemInset = this.getBottomSystemInset();
            const portraitBottomReserve = Phaser.Math.Clamp(20 + bottomSystemInset, 20, 140);
            const controlsBottomReach = Math.max(160, 182 * controlsScale);
            const controlsMaxY = h - controlsBottomReach - portraitBottomReserve;
            let controlsY = Math.min(baseControlsY - portraitBaseLift - portraitExtraLift, controlsMaxY);
            const minGapToControls = Math.max(72, 96 * infoScale);
            let contWinY = Math.min(
                baseContWinY - Math.round((portraitBaseLift + portraitExtraLift) * 0.55) - portraitExtraLift,
                controlsY - minGapToControls
            );

            const gameTop = (gameJackpot ? gameJackpot.bottom : (h * 0.10)) + 12;
            const contWinMinY = gameTop + 96;
            const contWinMaxY = controlsY - minGapToControls;
            contWinY = Phaser.Math.Clamp(contWinY, contWinMinY, Math.max(contWinMinY, contWinMaxY));
            controlsY = Phaser.Math.Clamp(controlsY, 0, controlsMaxY);
            if (controlsY < (contWinY + minGapToControls)) {
                contWinY = controlsY - minGapToControls;
            }
            contWinY = Math.max(contWinMinY, contWinY);

            const gameBottom = contWinY - 70;
            const availableGameHeight = Math.max(190, gameBottom - gameTop);
            const scaleGame = Math.min((w * (isMidPortraitHud ? 0.99 : 0.96)) / CONFIG_GAME.reelTotalWidth, availableGameHeight / CONFIG_GAME.reelTotalHeight);
            const gameCenterY = gameTop + (availableGameHeight / 2);

            this.layerGame.setPosition(w / 2, gameCenterY);
            this.layerGame.setScale(scaleGame);

            this.replayTitleBox.setPosition(0, -CONFIG_GAME.reelTotalHeight/2 - 12);

            this.uiElements.contWin.container.setPosition(w / 2, contWinY); 
            this.uiElements.contWin.container.setScale(infoScale);
            
            this.uiElements.controlsGroup.setPosition(w / 2, controlsY);
            this.uiElements.controlsGroup.setScale(controlsScale);

            this.uiElements.replayControlsGroup.setPosition(w / 2, controlsY);
            this.uiElements.replayControlsGroup.setScale(controlsScale);
            if (this.uiElements.btnReproducir && this.uiElements.btnSiguiente) {
                this.uiElements.btnReproducir.setX(-130);
                this.uiElements.btnSiguiente.setX(130);
            }

            this.uiElements.manualControlsGroup.setPosition(w / 2, controlsY);
            this.uiElements.manualControlsGroup.setScale(controlsScale);
        } else {
            const isMidLandscapeGame = w >= 722 && w <= 900;
            const isShortLandscapeGame = h <= 520;
            const isVeryShortLandscapeGame = h <= 430;
            const isReplayLandscape = this.isReplayMode === true;
            const gameAreaBaseFactor = isMidLandscapeGame ? 0.72 : 0.68;
            const gameAreaFactor = isReplayLandscape
                ? Phaser.Math.Clamp(gameAreaBaseFactor - 0.06, 0.60, 0.68)
                : gameAreaBaseFactor;
            const gameAreaWidth = contentWidth * gameAreaFactor;
            const panelAreaWidth = contentWidth - gameAreaWidth;
            const panelX = contentLeft + gameAreaWidth + (panelAreaWidth * 0.50);
            const isWideLandscapeGame = w >= 1200;
            const isNarrowLandscapeGame = !isWideLandscapeGame && (w < 1200 || panelAreaWidth < 320);
            const jackpotBaseWidthGame = isNarrowLandscapeGame
                ? Math.min(Math.max(panelAreaWidth * 2.0, contentWidth * 0.52), 640)
                : Math.min(panelAreaWidth * (isWideLandscapeGame ? 1.02 : 0.92), isWideLandscapeGame ? 700 : 620);
            const jackpotXGame = isNarrowLandscapeGame
                ? (w * 0.5)
                : (panelX + (isWideLandscapeGame ? 4 : 0));
            const gameJackpot = (this.layerGame && this.layerGame.visible)
                ? placeJackpot(
                    jackpotXGame,
                    isNarrowLandscapeGame ? 8 : 10,
                    jackpotBaseWidthGame,
                    isNarrowLandscapeGame ? 0.32 : (isWideLandscapeGame ? 0.27 : 0.24)
                )
                : null;

            const gameVerticalMargin = 18;
            const jackpotBoardGap = isMidLandscapeGame ? 8 : 14;
            const jackpotClearTop = gameJackpot ? (gameJackpot.bottom + jackpotBoardGap) : gameVerticalMargin;
            const replayTopReserve = isReplayLandscape ? 126 : 0;
            const boardTopReserve = (isWideLandscapeGame ? gameVerticalMargin : jackpotClearTop) + replayTopReserve;
            const maxGameHeight = Math.max(180, h - gameVerticalMargin - boardTopReserve);
            const replayWidthScaleCap = isReplayLandscape ? 0.85 : 1;
            const scaleGame = Math.min(
                (gameAreaWidth * 0.97 * replayWidthScaleCap) / CONFIG_GAME.reelTotalWidth,
                maxGameHeight / CONFIG_GAME.reelTotalHeight
            );
            const gameWidthWorld = CONFIG_GAME.reelTotalWidth * scaleGame;
            const gameHeightWorld = CONFIG_GAME.reelTotalHeight * scaleGame;
            const gameXMin = contentLeft + (gameWidthWorld / 2);
            const gameXMax = contentLeft + gameAreaWidth - (gameWidthWorld / 2);
            const defaultGameX = contentLeft + (gameAreaWidth * 0.50);
            let gameX = Phaser.Math.Clamp(defaultGameX, gameXMin, Math.max(gameXMin, gameXMax));
            const defaultGameY = h * (isReplayLandscape ? 0.55 : 0.52);
            const gameYMin = boardTopReserve + (gameHeightWorld / 2);
            const gameYMax = h - gameVerticalMargin - (gameHeightWorld / 2);
            const gameY = Phaser.Math.Clamp(defaultGameY, gameYMin, Math.max(gameYMin, gameYMax));

            const basePanelScale = Phaser.Math.Clamp(
                panelAreaWidth / 340,
                isShortLandscapeGame ? 0.52 : 0.74,
                isShortLandscapeGame ? (isVeryShortLandscapeGame ? 0.78 : 0.86) : 1.02
            );
            const controlsHalfReach = 150;
            const safeGapToBoard = isReplayLandscape ? 30 : 12;
            const desiredBoardRightMax = panelX - (controlsHalfReach * basePanelScale) - safeGapToBoard;
            const currentBoardRight = gameX + (gameWidthWorld / 2);
            if (currentBoardRight > desiredBoardRightMax) {
                const shiftLeft = currentBoardRight - desiredBoardRightMax;
                gameX = Phaser.Math.Clamp(gameX - shiftLeft, gameXMin, Math.max(gameXMin, gameXMax));
            }

            this.layerGame.setPosition(gameX, gameY); 
            this.layerGame.setScale(scaleGame);

            this.replayTitleBox.setPosition(0, -CONFIG_GAME.reelTotalHeight/2 - 12);

            const boardRightEdge = gameX + (gameWidthWorld / 2);
            const availableLeftSpan = Math.max(0, panelX - boardRightEdge - safeGapToBoard);
            const fitControlsScale = availableLeftSpan / controlsHalfReach;
            const fitResultScale = availableLeftSpan / 100;
            let panelScale = Phaser.Math.Clamp(
                Math.min(basePanelScale, fitControlsScale),
                0.46,
                isShortLandscapeGame ? (isVeryShortLandscapeGame ? 0.76 : 0.86) : 1.02
            );
            const contWinScale = Phaser.Math.Clamp(
                Math.min(Phaser.Math.Clamp(panelAreaWidth / 300, 0.74, 1.0), fitResultScale),
                isShortLandscapeGame ? 0.48 : 0.52,
                isShortLandscapeGame ? 0.86 : 1.0
            );
            const contWinYBase = gameJackpot ? Math.min(h * 0.56, gameJackpot.bottom + 64) : (h * 0.45);
            let contWinY = isMidLandscapeGame
                ? Math.min(h * 0.64, contWinYBase + 52)
                : contWinYBase;
            if (gameJackpot) {
                contWinY = Math.max(contWinY, gameJackpot.bottom + 92);
            }
            if (isShortLandscapeGame) {
                contWinY = Math.min(h * 0.50, contWinY - 10);
            }
            let landscapeTitleY = null;
            let landscapeTitleScale = null;
            if (this.uiElements.landscapeGameTitle && gameJackpot) {
                landscapeTitleScale = Phaser.Math.Clamp(contWinScale * 0.70, 0.52, 0.92);
                landscapeTitleY = gameJackpot.bottom + (34 * landscapeTitleScale);
                const titleHalfHeight = 26 * landscapeTitleScale;
                const resultHalfHeightGame = 52 * contWinScale;
                const minContWinY = landscapeTitleY + titleHalfHeight + resultHalfHeightGame + 12;
                contWinY = Math.max(contWinY, minContWinY);
                if (isReplayLandscape) {
                    landscapeTitleY = contWinY - resultHalfHeightGame - titleHalfHeight - 12;
                }
            }
            const controlsYOffset = (isWideLandscapeGame ? 24 : 0) + (isMidLandscapeGame ? 44 : 0) + (isShortLandscapeGame ? -36 : 0);
            const controlsYCap = h * (isWideLandscapeGame ? 0.84 : (isMidLandscapeGame ? 0.88 : (isShortLandscapeGame ? 0.66 : 0.78)));
            let controlsY = Math.min(
                controlsYCap,
                contWinY + (isShortLandscapeGame ? 128 : 165) + controlsYOffset
            );
            const controlsBottomLimit = h - (isShortLandscapeGame ? 10 : 14);
            const controlsBottomReach = 182 * panelScale;
            const controlsMaxY = controlsBottomLimit - controlsBottomReach;
            if (isShortLandscapeGame) {
                const controlsMinY = contWinY + (isVeryShortLandscapeGame ? 72 : 84);
                if (controlsMaxY <= controlsMinY) {
                    controlsY = controlsMaxY;
                } else {
                    controlsY = Phaser.Math.Clamp(controlsY, controlsMinY, controlsMaxY);
                }
            } else if ((controlsY + controlsBottomReach) > controlsBottomLimit) {
                controlsY -= (controlsY + controlsBottomReach) - controlsBottomLimit;
            }
            this.uiElements.contWin.container.setPosition(panelX, contWinY); 
            this.uiElements.contWin.container.setScale(contWinScale);
            
            this.uiElements.controlsGroup.setPosition(panelX, controlsY);
            this.uiElements.controlsGroup.setScale(panelScale);

            this.uiElements.replayControlsGroup.setPosition(panelX, controlsY);
            this.uiElements.replayControlsGroup.setScale(panelScale);
            if (this.uiElements.btnReproducir && this.uiElements.btnSiguiente) {
                const replayBtnShiftRight = isShortLandscapeGame ? 26 : (isMidLandscapeGame ? 20 : 14);
                this.uiElements.btnReproducir.setX(-130 + replayBtnShiftRight);
                this.uiElements.btnSiguiente.setX(130);
            }

            this.uiElements.manualControlsGroup.setPosition(panelX, controlsY);
            this.uiElements.manualControlsGroup.setScale(panelScale);

            if (this.uiElements.landscapeGameTitle && gameJackpot && landscapeTitleY !== null && landscapeTitleScale !== null) {
                const titleHalfWidth = 220 * landscapeTitleScale;
                const minTitleX = contentLeft + titleHalfWidth + 6;
                const maxTitleX = contentRight - titleHalfWidth - 6;
                let titleX = Phaser.Math.Clamp(panelX, minTitleX, Math.max(minTitleX, maxTitleX));
                if (isReplayLandscape) {
                    titleX = Phaser.Math.Clamp(panelX, minTitleX, Math.max(minTitleX, maxTitleX));
                }
                this.uiElements.landscapeGameTitle.setVisible(true);
                this.uiElements.landscapeGameTitle.setPosition(titleX, landscapeTitleY);
                this.uiElements.landscapeGameTitle.setScale(landscapeTitleScale);
                const titleBounds = this.uiElements.landscapeGameTitle.getBounds();
                if (!isReplayLandscape) {
                    const minLeft = boardRightEdge + 18;
                    if (titleBounds.left < minLeft) {
                        titleX += (minLeft - titleBounds.left);
                    }
                }
                if (titleBounds.right > (contentRight - 6)) {
                    titleX -= (titleBounds.right - (contentRight - 6));
                }
                this.uiElements.landscapeGameTitle.setPosition(titleX, landscapeTitleY);
            }
        }

        if (this.maskShape) { this.maskShape.setPosition(this.layerGame.x, this.layerGame.y); this.maskShape.setScale(this.layerGame.scaleX, this.layerGame.scaleY); }
        if (this.layerTopText) { this.layerTopText.setPosition(this.layerGame.x, this.layerGame.y); this.layerTopText.setScale(this.layerGame.scaleX, this.layerGame.scaleY); }
        if (this.lblTicket) {
            const isShortLandscapeHud = !isPortrait && h <= 520;
            const ticketX = isPortrait
                ? (w - 15)
                : (isShortLandscapeHud ? (contentLeft + (contentWidth * 0.64)) : (contentRight - 10));
            this.lblTicket.setPosition(ticketX, h - 15);
        }

        if (window.setHudDockTop) {
            let hudDockTop = null;
            if (isMobilePortrait) {
                const hudBtnSize = 38;
                const hudGap = 6;
                const hudCount = 5;
                const hudStackHeight = (hudBtnSize * hudCount) + (hudGap * (hudCount - 1));
                const maxTop = h - hudStackHeight - 10;

                if (this.layerGame && this.layerGame.visible) {
                    const boardBottom = this.layerGame.y + ((CONFIG_GAME.reelTotalHeight * this.layerGame.scaleY) / 2);
                    hudDockTop = Math.round(Phaser.Math.Clamp(boardBottom + 12, 8, maxTop));
                } else if (this.layerLobby && this.layerLobby.visible && this.btnLobbyJugar) {
                    const playBottom = this.btnLobbyJugar.getBounds().bottom;
                    hudDockTop = Math.round(Phaser.Math.Clamp(playBottom + 12, 8, maxTop));
                }
            }
            window.setHudDockTop(hudDockTop);
        }

        if (!jackpotHandled && hasJackpot) {
            let jackpotX;
            let jackpotCenterY;
            let targetWidth;
            if ((this.layerGame && this.layerGame.visible) || (this.layerShop && this.layerShop.visible)) {
                if (isPortrait) {
                    jackpotX = w * 0.5;
                    jackpotCenterY = h * 0.14;
                    targetWidth = fitJackpotWidth(Math.min(w * 0.82, 720) * JACKPOT_SIZE_BOOST, 0.28);
                } else {
                    targetWidth = fitJackpotWidth(Math.min(contentWidth * 0.40, 620) * JACKPOT_SIZE_BOOST, 0.30);
                    jackpotX = contentRight - (targetWidth / 2) - 8;
                    jackpotCenterY = 90;
                }
            } else {
                const safeTop = isPortrait ? 10 : 12;
                const lobbyTitleWorldY = this.lobbyTitle ? (this.layerLobby.y + this.lobbyTitle.y) : (isPortrait ? h * 0.35 : h * 0.33);
                const maxLobbyHeight = Math.max(80, lobbyTitleWorldY - safeTop - 16);
                jackpotX = w / 2;
                jackpotCenterY = safeTop + (maxLobbyHeight / 2);
                targetWidth = Math.min(Math.min(w * 0.88, 920) * JACKPOT_SIZE_BOOST, maxLobbyHeight * jackpotAspect);
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
