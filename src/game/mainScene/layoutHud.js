import Phaser from 'phaser';
import { CONFIG_GAME, JACKPOT_SIZE_BOOST } from './constants';

/**
 * Posiciona HUD y aplica fallback de jackpot cuando no fue resuelto por otras vistas.
 * Parámetros:
 * - `scene` (object): Instancia de la escena principal.
 * - `w` (number): Ancho disponible de la escena.
 * - `h` (number): Alto disponible de la escena.
 * - `isPortrait` (boolean): Indica si el layout está en orientación vertical.
 * - `isMobilePortrait` (boolean): Indica si el dispositivo está en portrait móvil.
 * - `isTabletPortrait` (boolean): Indica si el dispositivo está en portrait tablet.
 * - `viewportProfile` (object|null): Perfil de viewport precalculado.
 * - `viewportOverrides` (object): Overrides de layout según viewport.
 * - `contentRight` (number): Límite derecho del área de contenido.
 * - `contentWidth` (number): Ancho efectivo del área de contenido.
 * - `hasJackpot` (boolean): Indica si hay jackpot disponible para renderizar.
 * - `jackpotHandled` (boolean): Indica si el jackpot ya fue posicionado por otro layout.
 * - `jackpotAspect` (number): Relación de aspecto del recurso visual del jackpot.
 * - `fitJackpotWidth` (Function): Helper para ajustar ancho de jackpot según restricciones.
 */
export function applyHudAndFallbackLayout({
    scene,
    w,
    h,
    isPortrait,
    isMobilePortrait,
    isTabletPortrait,
    viewportProfile,
    viewportOverrides,
    contentRight,
    contentWidth,
    hasJackpot,
    jackpotHandled,
    jackpotAspect,
    fitJackpotWidth
}) {
    if (scene.maskShape) { scene.maskShape.setPosition(scene.layerGame.x, scene.layerGame.y); scene.maskShape.setScale(scene.layerGame.scaleX, scene.layerGame.scaleY); }
    if (scene.layerTopText) { scene.layerTopText.setPosition(scene.layerGame.x, scene.layerGame.y); scene.layerTopText.setScale(scene.layerGame.scaleX, scene.layerGame.scaleY); }
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
    if (scene.lblTicket) {
        const ticketX = isPortrait
            ? (w - hudCfg.ticketXPortraitOffset)
            : (w - hudCfg.ticketXLandscapeRightOffset);
        scene.lblTicket.setPosition(ticketX, h - hudCfg.ticketBottomOffset);
    }

    if (window.setHudDockTop) {
        let hudDockTop = null;
        if (isMobilePortrait || isTabletPortrait) {
            const hudBtnSize = hudCfg.dockButtonSize;
            const hudGap = hudCfg.dockGap;
            const hudCount = hudCfg.dockCount;
            const hudStackHeight = (hudBtnSize * hudCount) + (hudGap * (hudCount - 1));
            const maxTop = h - hudStackHeight - hudCfg.dockBottomMargin;

            if (scene.layerGame && scene.layerGame.visible) {
                const boardBottom = scene.layerGame.y + ((CONFIG_GAME.reelTotalHeight * scene.layerGame.scaleY) / 2);
                hudDockTop = Math.round(Phaser.Math.Clamp(boardBottom + hudCfg.dockBoardOffset, hudCfg.dockMinTop, maxTop));
            } else if (scene.layerShop && scene.layerShop.visible) {
                // En tienda se ancla arriba para no tapar la grilla de tickets.
                hudDockTop = Math.round(Phaser.Math.Clamp(hudCfg.dockShopTop, hudCfg.dockMinTop, maxTop));
            } else if (scene.layerLobby && scene.layerLobby.visible && scene.btnLobbyJugar) {
                const playBottom = scene.btnLobbyJugar.getBounds().bottom;
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
        if ((scene.layerGame && scene.layerGame.visible) || (scene.layerShop && scene.layerShop.visible)) {
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
            const lobbyTitleWorldY = scene.lobbyTitle
                ? (scene.layerLobby.y + scene.lobbyTitle.y)
                : (isPortrait ? h * fallbackCfg.lobbyTitleFallbackPortraitRatio : h * fallbackCfg.lobbyTitleFallbackLandscapeRatio);
            const maxLobbyHeight = Math.max(fallbackCfg.lobbyMaxHeightMin, lobbyTitleWorldY - safeTop - fallbackCfg.lobbyMaxHeightBottomGap);
            jackpotX = w / 2;
            jackpotCenterY = safeTop + (maxLobbyHeight / 2);
            targetWidth = Math.min(
                Math.min(w * fallbackCfg.lobbyWidthRatio, fallbackCfg.lobbyWidthMax) * JACKPOT_SIZE_BOOST,
                maxLobbyHeight * jackpotAspect
            );
        }
        scene.jackpotUI.layoutByCenterY(jackpotX, jackpotCenterY, targetWidth);
    }
    
}
