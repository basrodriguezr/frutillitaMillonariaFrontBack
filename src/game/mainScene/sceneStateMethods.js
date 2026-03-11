import { BET_VALUES } from './constants';

/**
 * Oculta todas las capas principales para cambiar de vista sin arrastre visual.
 * No requiere parámetros.
 */
export function hideAllLayers() {
    if (this.layerLobby) this.layerLobby.setVisible(false).setAlpha(0);
    if (this.layerShop) this.layerShop.setVisible(false).setAlpha(0);
    if (this.layerGame) this.layerGame.setVisible(false).setAlpha(0);
    if (this.layerUI) this.layerUI.setVisible(false).setAlpha(0);
    if (this.layerJackpot) this.layerJackpot.setVisible(false).setAlpha(0);
    if (this.layerTopText) this.layerTopText.setVisible(false).setAlpha(0);
}

/**
 * Restablece la apuesta principal al valor inicial configurado.
 * No requiere parámetros.
 */
export function resetMainBetToDefault() {
    this.currentBetIndex = 0;
    if (this.uiElements.betBox) {
        this.uiElements.betBox.val.setText('$' + this.formatPoints(BET_VALUES[this.currentBetIndex]));
    }
}

/**
 * Muestra la vista de lobby y aplica su layout.
 * No requiere parámetros.
 */
export function showLobby() {
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

/**
 * Muestra la vista de juego y prepara controles de spin.
 * No requiere parámetros.
 */
export function showGame() {
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
    this.uiElements.spinBtn.setScale(1).setX(0).setVisible(true);
    if (this.uiElements.replayBackBtn) {
        this.uiElements.replayBackBtn.setVisible(false).setScale(1).setX(0);
    }
    this.uiElements.btnMinus.setVisible(true);
    this.uiElements.btnPlus.setVisible(true);
    if (this.uiElements.spinBtnLabel) {
        this.uiElements.spinBtnLabel
            .setText('▶')
            .setFontSize('60px')
            .setX(5)
            .setY(0)
            .setLineSpacing(0);
    }
    this.replayTitleBox.setVisible(false);
    this.applyResponsiveLayout({ width: this.scale.width, height: this.scale.height });

    if (window.setCurrentScreen) window.setCurrentScreen('game');
}

/**
 * Muestra la vista de tienda aplicando opciones de apertura.
 * Parámetros:
 * - `options` (object, opcional): Opciones de comportamiento para la acción solicitada.
 */
export function showShop(options = {}) {
    const { resetState = true } = options;
    this.interruptSpinKeepingPending();
    this.isReplayMode = false;
    this.isManualMode = false;
    this.resetBoardState();
    if (resetState) {
        this.resetShopState();
    }
    this.hideAllLayers();
    this.bg.clearTint();
    this.layerShop.setVisible(true).setAlpha(1);
    this.layerJackpot.setVisible(true).setAlpha(1);

    this.updateShopUI();
    this.applyResponsiveLayout({ width: this.scale.width, height: this.scale.height });
    if (window.setCurrentScreen) window.setCurrentScreen('shop');
}

/**
 * Reinicia estado temporal de tienda y totales acumulados.
 * No requiere parámetros.
 */
export function resetShopState() {
    this.currentBetIndex = 0;
    this.shopQty = 5;
    this.currentShopQty = 5;
    this.currentShopWin = 0;

    if (this.uiElements.betBox) {
        this.uiElements.betBox.val.setText('$' + this.formatPoints(BET_VALUES[this.currentBetIndex]));
    }

    if (this.shopTotalWinBox) {
        this.shopTotalWinBox.val.setText('$0');
        this.shopTotalWinBox.container.setVisible(false);
    }

    this.drawShopCards(this.shopQty);
}
