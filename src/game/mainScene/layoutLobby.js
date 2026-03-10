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
        scene.lobbyTitle.setPosition(0, titleWorldY - (h / 2));

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
                scene.lobbyTitle.setPosition(0, titleWorldY - (h / 2));
            }
            scene.lobbyTitle.setPosition(0, titleWorldY - (h / 2));
            scene.btnLobbyComprar.setPosition(0, btnComprarY - (h / 2));
            scene.btnLobbyJugar.setPosition(0, btnJugarY - (h / 2));
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
                let btnComprarY = titleWorldY + lobbyCfg.landscapeStackButtonsStartGap;
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
                let buttonY = titleWorldY + lobbyCfg.landscapeRowButtonsYGap;
                const buttonBottom = buttonY + (lobbyCfg.buttonHalfHeight * scaleBtn);
                if (buttonBottom > (h - lobbyCfg.bottomSafeMargin)) {
                    const shiftUp = buttonBottom - (h - lobbyCfg.bottomSafeMargin);
                    buttonY -= shiftUp;
                    titleWorldY -= shiftUp;
                    scene.lobbyTitle.setPosition(0, titleWorldY - (h / 2));
                }
                scene.btnLobbyComprar.setPosition(-separation, buttonY - (h / lobbyCfg.landscapeRowVerticalAnchorDivisor));
                scene.btnLobbyJugar.setPosition(separation, buttonY - (h / lobbyCfg.landscapeRowVerticalAnchorDivisor));
                scene.btnLobbyComprar.baseScale = scaleBtn;
                scene.btnLobbyJugar.baseScale = scaleBtn;
                scene.btnLobbyComprar.setScale(scaleBtn);
                scene.btnLobbyJugar.setScale(scaleBtn);
            }
        }
    }
}
