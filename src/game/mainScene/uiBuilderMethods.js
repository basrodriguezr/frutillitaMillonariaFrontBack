import Phaser from 'phaser';
import { BET_VALUES, CELL_H, CELL_W, CONFIG_GAME } from './constants';
import { getPendingResumePayload, hasAnyPendingPlay } from './modeMethods';

/**
 * Crea un bloque visual de estadística con título y valor.
 * Parámetros:
 * - `title` (string): Texto de título a mostrar.
 * - `val` (string|number): Valor inicial a mostrar.
 * - `s1` (number): Escala horizontal base del contenedor.
 * - `s2` (number): Escala vertical base del contenedor.
 */
export function createStatBox(title, val, s1, s2) {
        const c = this.add.container(0, 0);
        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.7); bg.lineStyle(2, 0xFFD700);
        bg.fillRoundedRect(-100, -35, 200, 70, 15); bg.strokeRoundedRect(-100, -35, 200, 70, 15);
        const t = this.add.text(0, -45, title, s1).setOrigin(0.5);
        const v = this.add.text(0, 0, val, s2).setOrigin(0.5);
        c.add([bg, t, v]);
        return { container: c, val: v };
    }

/**
 * Crea un botón de interfaz con texto, posición y callback de acción.
 * Parámetros:
 * - `text` (string): Texto visible del botón o etiqueta.
 * - `x` (number): Posición horizontal.
 * - `y` (number): Posición vertical.
 * - `cb` (Function): Callback a ejecutar al activar el botón.
 */
export function createBtn(text, x, y, cb) {
        const c = this.add.container(x, y);
        const g = this.add.graphics();
        g.fillStyle(0x333333); g.lineStyle(2, 0xFFFFFF);
        g.fillCircle(0,0,30); g.strokeCircle(0,0,30);
        const t = this.add.text(0,0,text, {fontSize:'30px', fontFamily:'Arial', fontStyle:'bold'}).setOrigin(0.5);
        const h = this.add.zone(0,0,60,60).setInteractive({cursor:'pointer'}).setOrigin(0.5);
        h.on('pointerdown', () => {
            if(window.reactUI && window.reactUI.isActive) return;
            if (window.playButtonSfx) window.playButtonSfx();
            cb();
        });
        c.add([g, t, h]);
        return c;
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
export function createMenuButton(text, color, w, h, callback) {
        const c = this.add.container(0, 0);
        c.baseScale = 1;
        const bg = this.add.graphics();
        bg.fillStyle(color, 1); bg.lineStyle(3, 0xffffff, 0.3);
        bg.fillRoundedRect(-w/2, -h/2, w, h, 20); 
        bg.strokeRoundedRect(-w/2, -h/2, w, h, 20);
        const txt = this.add.text(0, 0, text, { fontFamily: 'Luckiest Guy, Arial', fontSize: '32px', color: '#FFFFFF', align: 'center' }).setOrigin(0.5);
        const hit = this.add.zone(0, 0, w, h).setInteractive({ cursor: 'pointer' }).setOrigin(0.5);
        /**
         * Restaura la escala base del botón luego de interacción.
         * No requiere parámetros.
         */
        const restoreScale = () => c.setScale(c.baseScale ?? 1);
        hit.on('pointerdown', () => { c.setScale((c.baseScale ?? 1) * 0.95); });
        hit.on('pointerup', () => {
            restoreScale();
            if (window.playButtonSfx) window.playButtonSfx();
            callback();
        });
        hit.on('pointerout', () => { restoreScale(); });
        c.add([bg, txt, hit]);
        return c;
    }

/**
 * Construye elementos visuales y botones del lobby.
 * No requiere parámetros.
 */
export function buildLobby() {
        this.lobbyTitle = this.add.text(0, 0, "FRUTILLITA\nMILLONARIA", {
            fontFamily: 'Luckiest Guy, Arial', fontSize: '45px', color: '#FFFFFF', 
            align: 'center', stroke: '#000000', strokeThickness: 8, shadow: { offsetX: 4, offsetY: 4, color: '#000', blur: 6, fill: true }
        }).setOrigin(0.5);

        this.btnLobbyComprar = this.createMenuButton("JUGAR TICKETS", 0x1e3a8a, 480, 120, () => {
            if (hasAnyPendingPlay()) {
                if (window.showReactAlert) {
                    window.showReactAlert(
                        'Jugada pendiente',
                        'Tienes jugadas pendientes de visualización. Continúa desde JUGAR antes de comprar otro paquete.'
                    );
                }
                return;
            }
            this.showShop();
        });
        this.btnLobbyJugar = this.createMenuButton("JUGAR", 0x2563eb, 480, 120, () => {
            this.isManualMode = false;

            const pendingPayload = getPendingResumePayload();
            if (pendingPayload) {
                this.showGame(); 
                setTimeout(() => {
                    if (window.showPendingSpinModal) window.showPendingSpinModal(pendingPayload);
                }, 100);
            } else {
                this.resetMainBetToDefault();
                this.showGame();
            }
        });
        
        this.layerLobby.add([this.lobbyTitle, this.btnLobbyComprar, this.btnLobbyJugar]);
    }

/**
 * Construye la matriz visual de símbolos del tablero.
 * No requiere parámetros.
 */
export function buildGameGrid() {
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

/**
 * Construye HUD, botones y contenedores de interacción del juego.
 * No requiere parámetros.
 */
export function buildUI() {
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
        this.uiElements.spinBtnLabel = txtSpin;
        const hit = this.add.zone(0, 0, 150, 150).setInteractive({cursor:'pointer'}).setOrigin(0.5);
        hit.on('pointerdown', () => {
            if(window.reactUI && window.reactUI.isActive) return;
            if (window.playButtonSfx) window.playButtonSfx();
            this.spin();
        });
        this.uiElements.spinBtn.add([circle, txtSpin, hit]);

        this.uiElements.replayBackBtn = this.add.container(0, 0);
        const replayBackCircle = this.add.graphics();
        replayBackCircle.fillStyle(0x3A3A3A); replayBackCircle.lineStyle(4, 0xFFFFFF);
        replayBackCircle.fillCircle(0,0,70); replayBackCircle.strokeCircle(0,0,70);
        const replayBackLabel = this.add.text(0, 0, "←", {fontSize:'64px', color:'#FFF'}).setOrigin(0.5);
        this.uiElements.replayBackBtnLabel = replayBackLabel;
        const replayBackHit = this.add.zone(0, 0, 150, 150).setInteractive({cursor:'pointer'}).setOrigin(0.5);
        replayBackHit.on('pointerdown', () => {
            if(window.reactUI && window.reactUI.isActive) return;
            if (window.playButtonSfx) window.playButtonSfx();
            this.exitReplay();
        });
        this.uiElements.replayBackBtn.add([replayBackCircle, replayBackLabel, replayBackHit]);
        this.uiElements.replayBackBtn.setVisible(false);

        this.uiElements.btnMinus = this.createBtn("-", -120, 0, () => this.changeBet(-1));
        this.uiElements.btnPlus = this.createBtn("+", 120, 0, () => this.changeBet(1));

        this.uiElements.betBox = this.createStatBox("APUESTA", "$"+this.formatPoints(BET_VALUES[this.currentBetIndex]), fontTitle, fontVal);
        this.uiElements.betBox.container.setPosition(0, 145); 

        this.uiElements.controlsGroup.add([
            this.uiElements.btnMinus,
            this.uiElements.spinBtn,
            this.uiElements.replayBackBtn,
            this.uiElements.btnPlus,
            this.uiElements.betBox.container
        ]);
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
            if (window.playButtonSfx) window.playButtonSfx();
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
        const txtRep = this.add.text(0, 0, "VER DE NUEVO", {fontFamily:'Luckiest Guy, Arial', fontSize:'22px', color:'#FFF'}).setOrigin(0.5);
        const hitRep = this.add.zone(0,0, 220, 70).setInteractive({cursor:'pointer'}).setOrigin(0.5);
        this.uiElements.btnReproducir = this.add.container(-130, 0, [btnRepBg, txtRep, hitRep]);
        
        hitRep.on('pointerdown', () => this.uiElements.btnReproducir.setScale(0.95));
        hitRep.on('pointerout', () => this.uiElements.btnReproducir.setScale(1));
        hitRep.on('pointerup', () => {
            this.uiElements.btnReproducir.setScale(1);
            if (window.playButtonSfx) window.playButtonSfx();
            this.executeReplay();
        });

        const btnSigBg = this.add.graphics();
        btnSigBg.fillStyle(0x444444, 1); btnSigBg.lineStyle(2, 0xffffff, 0.8);
        btnSigBg.fillRoundedRect(-110, -35, 220, 70, 15); btnSigBg.strokeRoundedRect(-110, -35, 220, 70, 15);
        const txtSig = this.add.text(0, 0, "VOLVER", {fontFamily:'Luckiest Guy, Arial', fontSize:'24px', color:'#FFF'}).setOrigin(0.5);
        const hitSig = this.add.zone(0,0, 220, 70).setInteractive({cursor:'pointer'}).setOrigin(0.5);
        this.uiElements.btnSiguiente = this.add.container(130, 0, [btnSigBg, txtSig, hitSig]);

        hitSig.on('pointerdown', () => this.uiElements.btnSiguiente.setScale(0.95));
        hitSig.on('pointerout', () => this.uiElements.btnSiguiente.setScale(1));
        hitSig.on('pointerup', () => {
            this.uiElements.btnSiguiente.setScale(1);
            if (window.playButtonSfx) window.playButtonSfx();
            this.exitReplay();
        });

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
