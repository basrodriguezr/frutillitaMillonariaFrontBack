import Phaser from 'phaser';

/**
 * Aplica layout responsivo específico de la vista de lobby.
 * Parámetros:
 * - `scene` (object): Instancia de la escena principal.
 * - `w` (number): Ancho disponible de la escena.
 * - `h` (number): Alto disponible de la escena.
 * - `isPortrait` (boolean): Indica si el layout está en orientación vertical.
 * - `viewportOverrides` (object): Overrides de layout según viewport.
 * - `contentWidth` (number): Ancho efectivo del área de contenido.
 * - `lobbyScaleFactor` (number): Factor de escala global para lobby.
 * - `placeJackpot` (Function): Helper que calcula y posiciona el jackpot en pantalla.
 */
export function applyLobbyLayout({
    scene,
    w,
    h,
    isPortrait,
    viewportOverrides,
    contentWidth,
    lobbyScaleFactor,
    placeJackpot
}) {
    if (scene.layerLobby && scene.layerLobby.visible) {
        scene.layerLobby.setPosition(w/2, h/2);
        const isShortLandscapeLobby = !isPortrait && h <= 460;
        const lobbyOverrides = viewportOverrides.lobby || {};
        const lobbyBase = isPortrait
            ? {
                jackpotTop: 12,
                jackpotWidth: Math.min(w * 0.86, 860),
                jackpotTopMobile: 20,
                jackpotWidthMobile: Math.min(w * 1.08, 980),
                jackpotMaxHeightRatio: 0.38,
                jackpotMaxHeightRatioMobile: 0.44,
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
                jackpotWidth: Math.min(
                    contentWidth * (isShortLandscapeLobby ? 0.56 : 0.72),
                    isShortLandscapeLobby ? 700 : 1080
                ),
                jackpotMaxHeightRatio: 0.46,
                titleGapFromJackpot: isShortLandscapeLobby ? 10 : 24,
                titleFallbackRatio: 0.20,
                landscapeStackButtonsTopGap: isShortLandscapeLobby ? 16 : 26,
                landscapeStackButtonsGap: isShortLandscapeLobby ? 106 : 140,
                landscapeRowButtonsTopGap: isShortLandscapeLobby ? 14 : 24,
                landscapeButtonBaseWidth: 480,
                landscapeButtonsGap: 24,
                landscapeButtonsMaxPairWidthRatio: 0.95,
                landscapeStackScaleThreshold: 0.45,
                landscapeStackScaleWidthRatio: 0.90,
                landscapeStackScaleMin: 0.52,
                landscapeStackScaleMax: 1.0,
                landscapeRowScaleMin: 0.45,
                landscapeRowScaleMax: 1.08,
                landscapeRowVerticalAnchorDivisor: isShortLandscapeLobby ? 2 : 3,
                buttonHalfHeight: 60,
                bottomSafeMargin: 24
            };
        const lobbyCfg = { ...lobbyBase, ...lobbyOverrides };
        const isMobilePortraitLobby = isPortrait && w <= 520;
        const jackpotTop = isMobilePortraitLobby
            ? (lobbyCfg.jackpotTopMobile ?? lobbyCfg.jackpotTop)
            : lobbyCfg.jackpotTop;
        const jackpotWidth = isMobilePortraitLobby
            ? (lobbyCfg.jackpotWidthMobile ?? lobbyCfg.jackpotWidth)
            : lobbyCfg.jackpotWidth;
        const jackpotMaxHeightRatio = isMobilePortraitLobby
            ? (lobbyCfg.jackpotMaxHeightRatioMobile ?? lobbyCfg.jackpotMaxHeightRatio)
            : lobbyCfg.jackpotMaxHeightRatio;

        const lobbyJackpot = placeJackpot(
            w / 2,
            jackpotTop,
            jackpotWidth,
            jackpotMaxHeightRatio
        );

        if (isPortrait) {
            scene.lobbyTitle.setScale(1);
        } else {
            const titleScaleLandscape = isShortLandscapeLobby
                ? Phaser.Math.Clamp(h / 760, 0.46, 0.72)
                : Phaser.Math.Clamp(h / 620, 0.58, 0.96);
            scene.lobbyTitle.setScale(titleScaleLandscape);
        }
        const titleBoundsForSpacing = scene.lobbyTitle.getBounds();
        const titleHalfHeight = Math.max(1, titleBoundsForSpacing.height / 2);
        let titleWorldY = lobbyJackpot
            ? (lobbyJackpot.bottom + lobbyCfg.titleGapFromJackpot + titleHalfHeight)
            : (h * lobbyCfg.titleFallbackRatio);
        scene.lobbyTitle.setPosition(0, titleWorldY - (h / 2));
        const titleBottomWorld = scene.lobbyTitle.getBounds().bottom;

        if (isPortrait) {
            const portraitScaleBaseRatio = isMobilePortraitLobby
                ? (lobbyCfg.portraitButtonScaleMobileWidthRatio ?? 0.80)
                : lobbyCfg.portraitButtonScaleBaseWidthRatio;
            const portraitScaleMin = isMobilePortraitLobby
                ? (lobbyCfg.portraitButtonScaleMobileMin ?? 0.54)
                : lobbyCfg.portraitButtonScaleMin;
            const portraitScaleMax = isMobilePortraitLobby
                ? (lobbyCfg.portraitButtonScaleMobileMax ?? 0.88)
                : lobbyCfg.portraitButtonScaleMax;
            const portraitButtonsStartGap = isMobilePortraitLobby
                ? (lobbyCfg.portraitButtonsStartGapMobile ?? 164)
                : lobbyCfg.portraitButtonsStartGap;
            const portraitButtonsGap = isMobilePortraitLobby
                ? (lobbyCfg.portraitButtonsGapMobile ?? 118)
                : lobbyCfg.portraitButtonsGap;
            let scaleBtn = Phaser.Math.Clamp(
                ((contentWidth * portraitScaleBaseRatio) / lobbyCfg.portraitButtonScaleBaseWidth) * lobbyScaleFactor,
                portraitScaleMin,
                portraitScaleMax
            );
            let btnComprarY = titleWorldY + portraitButtonsStartGap;
            let btnJugarY = btnComprarY + portraitButtonsGap;
            const buttonBottom = btnJugarY + (lobbyCfg.buttonHalfHeight * scaleBtn);
            const overflow = Math.max(0, buttonBottom - (h - lobbyCfg.bottomSafeMargin));
            if (overflow > 0) {
                titleWorldY -= overflow;
                btnComprarY -= overflow;
                btnJugarY -= overflow;
                scene.lobbyTitle.setPosition(0, titleWorldY - (h / 2));
            }
            scene.lobbyTitle.setPosition(0, titleWorldY - (h / 2));
            if (isMobilePortraitLobby) {
                scene.btnLobbyJugar.setPosition(0, btnComprarY - (h / 2));
                scene.btnLobbyComprar.setPosition(0, btnJugarY - (h / 2));
            } else {
                scene.btnLobbyComprar.setPosition(0, btnComprarY - (h / 2));
                scene.btnLobbyJugar.setPosition(0, btnJugarY - (h / 2));
            }
            scene.btnLobbyComprar.baseScale = scaleBtn;
            scene.btnLobbyJugar.baseScale = scaleBtn;
            scene.btnLobbyComprar.setScale(scaleBtn);
            scene.btnLobbyJugar.setScale(scaleBtn);
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
                let btnComprarY = titleBottomWorld + (lobbyCfg.landscapeStackButtonsTopGap ?? 20) + (lobbyCfg.buttonHalfHeight * scaleBtn);
                // Gap en px reales para que el ajuste por rango sea predecible.
                let btnJugarY = btnComprarY + lobbyCfg.landscapeStackButtonsGap;
                const buttonBottom = btnJugarY + (lobbyCfg.buttonHalfHeight * scaleBtn);
                if (buttonBottom > (h - lobbyCfg.bottomSafeMargin)) {
                    const shiftUp = buttonBottom - (h - lobbyCfg.bottomSafeMargin);
                    btnComprarY -= shiftUp;
                    btnJugarY -= shiftUp;
                    titleWorldY -= shiftUp;
                    scene.lobbyTitle.setPosition(0, titleWorldY - (h / 2));
                }
                scene.btnLobbyComprar.setPosition(0, btnComprarY - (h / 2));
                scene.btnLobbyJugar.setPosition(0, btnJugarY - (h / 2));
                scene.btnLobbyComprar.baseScale = scaleBtn;
                scene.btnLobbyJugar.baseScale = scaleBtn;
                scene.btnLobbyComprar.setScale(scaleBtn);
                scene.btnLobbyJugar.setScale(scaleBtn);
            } else {
                const scaleBtn = Phaser.Math.Clamp(
                    fitScaleHorizontal * lobbyScaleFactor,
                    lobbyCfg.landscapeRowScaleMin,
                    lobbyCfg.landscapeRowScaleMax
                );
                const buttonWidth = buttonBaseWidth * scaleBtn;
                const separation = (buttonWidth / 2) + (buttonGap / 2);
                let buttonY = titleBottomWorld + (lobbyCfg.landscapeRowButtonsTopGap ?? 18) + (lobbyCfg.buttonHalfHeight * scaleBtn);
                const buttonBottom = buttonY + (lobbyCfg.buttonHalfHeight * scaleBtn);
                if (buttonBottom > (h - lobbyCfg.bottomSafeMargin)) {
                    const shiftUp = buttonBottom - (h - lobbyCfg.bottomSafeMargin);
                    buttonY -= shiftUp;
                    titleWorldY -= shiftUp;
                    scene.lobbyTitle.setPosition(0, titleWorldY - (h / 2));
                }
                scene.btnLobbyComprar.setPosition(-separation, buttonY - (h / 2));
                scene.btnLobbyJugar.setPosition(separation, buttonY - (h / 2));
                scene.btnLobbyComprar.baseScale = scaleBtn;
                scene.btnLobbyJugar.baseScale = scaleBtn;
                scene.btnLobbyComprar.setScale(scaleBtn);
                scene.btnLobbyJugar.setScale(scaleBtn);
            }
        }
    }
}
