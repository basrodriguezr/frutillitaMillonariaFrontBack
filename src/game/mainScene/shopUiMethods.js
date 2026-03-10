import { BET_VALUES } from './constants';
import { hasAnyPendingPlay } from './modeMethods';

/**
 * Construye paneles, filtros y controles de la vista de tienda.
 * No requiere parámetros.
 */
export function buildShop() {
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
            
            hit.on('pointerdown', () => {
                if (window.playButtonSfx) window.playButtonSfx();
                this.shopQty = opt;
                this.updateShopUI();
            });
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
            if (window.playButtonSfx) window.playButtonSfx();

            if (hasAnyPendingPlay()) {
                if (window.showReactAlert) {
                    window.showReactAlert(
                        'Jugada pendiente',
                        'Tienes jugadas pendientes de visualización. Reanuda desde JUGAR para continuar.'
                    );
                }
                return;
            }

            const total = BET_VALUES[this.currentBetIndex] * this.shopQty;

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

/**
 * Dibuja o redibuja las tarjetas de tickets según cantidad seleccionada.
 * Parámetros:
 * - `qty` (number): Cantidad de tickets/cartas a procesar.
 */
export function drawShopCards(qty) {
        this.shopCardsContainer.removeAll(true);
        this.shopCards = [];

        const maxCols = 10;
        const isPortrait = this.scale.height > this.scale.width;
        const isMobilePortrait = isPortrait && this.scale.width <= 520;
        const actualCols = Math.min(maxCols, this.getShopGridCols(qty, isPortrait));
        this.currentShopCols = actualCols;
        const rows = Math.ceil(qty / actualCols);
        const visualCols = !isPortrait && qty === 5 ? 10 : actualCols;
        const { cardW, cardH, pad } = this.getShopCardMetrics(qty, isPortrait);
        const contentMetrics = this.getShopCardContentMetrics(cardW, cardH);
        const totalW = (visualCols * cardW) + ((visualCols - 1) * pad);
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
            const ticketOffset = isMobilePortrait
                ? Math.max(6, Math.round(cardH * 0.1))
                : Math.max(10, Math.round(cardH * 0.18));
            const ticketYOffset = (isMobilePortrait || r === 0)
                ? -((cardH / 2) + ticketOffset)
                : ((cardH / 2) + ticketOffset);
            const ticketFont = isMobilePortrait
                ? Math.max(8, Math.round(contentMetrics.hiddenFont * 0.4))
                : Math.max(10, Math.round(contentMetrics.hiddenFont * 0.45));
            const ticketTag = this.add
                .text(0, ticketYOffset, `TICKET ${i + 1}`, {
                    fontFamily: 'Luckiest Guy, Arial',
                    fontSize: `${ticketFont}px`,
                    color: '#FFFFFF',
                    stroke: '#000000',
                    strokeThickness: Math.max(2, Math.round(ticketFont * 0.18))
                })
                .setOrigin(0.5)
                .setVisible(false);
            
            card.add([bg, txt, btnVerBg, btnVerTxt, ticketTag, hit]);
            card.bg = bg; card.txt = txt; card.btnVerBg = btnVerBg; card.btnVerTxt = btnVerTxt;
            card.hit = hit; card.cardW = cardW; card.cardH = cardH; card.replayData = null;
            card.contentMetrics = contentMetrics;
            card.gridRow = r;
            card.ticketTag = ticketTag;
            
            this.shopCardsContainer.add(card);
            this.shopCards.push(card);
        }
    }

/**
 * Sincroniza textos, estados activos y totales de la UI de tienda.
 * No requiere parámetros.
 */
export function updateShopUI() {
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

/**
 * Limpia tarjetas previas de tienda para reconstrucción segura.
 * No requiere parámetros.
 */
export function resetShopCards() {
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
            if (card.ticketTag) card.ticketTag.setVisible(false);
        });
    }
