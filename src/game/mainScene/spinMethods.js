import Phaser from 'phaser';
import { BET_VALUES, CELL_H, CELL_W } from './constants';

/**
 * Genera datos de tirada simulada para juego actual.
 * Parámetros:
 * - `bet` (number): Monto apostado para generar/ejecutar la tirada.
 */
export function generateMockSpin(bet) {
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

/**
 * Genera una tirada simulada ajustada a un premio objetivo histórico.
 * Parámetros:
 * - `bet` (number): Monto apostado para generar/ejecutar la tirada.
 * - `targetWin` (number): Premio objetivo a simular en historial.
 */
export function generateHistoryMockSpin(bet, targetWin) {
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

/**
 * Ejecuta una tirada del juego principal, gestiona animación y persistencia pendiente.
 * No requiere parámetros.
 */
export async function spin() {
        if (this.isReplayMode) {
            this.executeReplay();
            return;
        }

        this.clearWinAnimations();
        if(this.isSpinning) return;
        const betVal = BET_VALUES[this.currentBetIndex];

        if(!this.isManualMode) {
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

/**
 * Restablece símbolos, alfa y tweens del tablero antes de una nueva tirada.
 * No requiere parámetros.
 */
export function resetBoardState() {
        if(this.winTimer) this.winTimer.remove();
        this.tweens.killTweensOf([this.lblWinFloat, this.lblLoseFloat, this.lblTotalWinFloat]);
        this.lblWinFloat.setVisible(false); this.lblLoseFloat.setVisible(false); this.lblTotalWinFloat.setVisible(false); 
        if (this.isManualMode) {
            const manualTotal = Math.max(0, Number(this.manualAccumulatedWin) || 0);
            this.uiElements.contWin.val.setText("$" + this.formatPoints(manualTotal));
            this.uiElements.contWin.val.setFontSize('40px');
            this.uiElements.contWin.val.setColor(manualTotal > 0 ? '#FFFF00' : '#FFF');
        } else {
            this.uiElements.contWin.val.setText("$0");
            this.uiElements.contWin.val.setFontSize('40px');
            this.uiElements.contWin.val.setColor('#FFF');
        }

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

/**
 * Cierra una tirada aplicando premios, historial y transiciones de estado.
 * Parámetros:
 * - `totalWin` (number): Monto total ganado en la tirada.
 * - `winGroups` (Array<object>): Grupos ganadores detectados en la grilla.
 */
export function endSpin(totalWin, winGroups) {
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
                this.uiElements.spinBtn.setVisible(true); 
                this.uiElements.btnMinus.setVisible(false);
                this.uiElements.btnPlus.setVisible(false);
            } else {
                this.uiElements.spinBtn.setVisible(true); 
                this.uiElements.btnMinus.setVisible(true);
                this.uiElements.btnPlus.setVisible(true);
            }

            if(window.setReactSpinning) window.setReactSpinning(false);
            this.lblWinFloat.setVisible(false); this.lblTotalWinFloat.setVisible(false);

            if (this.isManualMode) {
                const manualTotal = Math.max(0, Number(this.manualAccumulatedWin) || 0);
                this.uiElements.contWin.val.setFontSize('40px');
                this.uiElements.contWin.val.setText("$" + this.formatPoints(manualTotal));
                this.uiElements.contWin.val.setColor(manualTotal > 0 ? '#FFFF00' : '#FFFFFF');
                this.lblLoseFloat.setVisible(false);
                for(let c=0; c<5; c++) {
                    for(let r=0; r<5; r++) { this.tweens.add({ targets: this.symbolsMatrix[c][r], alpha: 0.5, duration: 300, ease: 'Sine.easeOut' }); }
                }
            } else {
                if (!this.isReplayMode && window.playLoseSfx) {
                    window.playLoseSfx();
                }
                this.uiElements.contWin.val.setFontSize('22px'); this.uiElements.contWin.val.setText("TICKET SIN PREMIO"); this.uiElements.contWin.val.setColor('#FFFFFF');
                this.lblLoseFloat.setVisible(true); this.lblLoseFloat.setScale(0); 
                for(let c=0; c<5; c++) {
                    for(let r=0; r<5; r++) { this.tweens.add({ targets: this.symbolsMatrix[c][r], alpha: 0.5, duration: 300, ease: 'Sine.easeOut' }); }
                }
                this.tweens.add({ targets: this.lblLoseFloat, scaleX: 1, scaleY: 1, duration: 500, ease: 'Back.out' });
            }
        }
    }

/**
 * Reproduce secuencialmente los grupos ganadores con animación.
 * Parámetros:
 * - `winGroups` (Array<object>): Grupos ganadores detectados en la grilla.
 */
export function playSequentialWins(winGroups) {
        if(winGroups.length === 0) return;
        let currentIndex = 0;
        let countDuration = 1000; let nextWinDelay = 1500; let lblAnimDuration = 400; 

        if (this.currentSpeedLevel === 2) { countDuration = 600; nextWinDelay = 1000; lblAnimDuration = 300; } 

        /**
         * Recorre y anima el siguiente grupo ganador hasta cerrar la secuencia.
         * No requiere parámetros.
         */
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
                if (!this.isManualMode && window.playCoinsSfx) window.playCoinsSfx();

                this.isSpinning = false; 

                if (this.isManualMode) {
                    this.finishManualSpin(this.accumulatedWin);
                } else if(this.isReplayMode) {
                    this.uiElements.spinBtn.setVisible(true); 
                    this.uiElements.btnMinus.setVisible(false);
                    this.uiElements.btnPlus.setVisible(false);
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
            if (!this.isManualMode && !this.isReplayMode && window.playWinSfx) {
                window.playWinSfx();
            }

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
