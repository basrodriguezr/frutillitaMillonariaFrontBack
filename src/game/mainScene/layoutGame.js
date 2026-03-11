import Phaser from 'phaser';
import { CONFIG_GAME } from './constants';

/**
 * Aplica layout responsivo específico de la vista de juego.
 * Parámetros:
 * - `scene` (object): Instancia de la escena principal.
 * - `w` (number): Ancho disponible de la escena.
 * - `h` (number): Alto disponible de la escena.
 * - `isPortrait` (boolean): Indica si el layout está en orientación vertical.
 * - `thresholds` (object): Umbrales de corte para layout responsivo.
 * - `viewportOverrides` (object): Overrides de layout según viewport.
 * - `contentLeft` (number): Límite izquierdo del área de contenido.
 * - `contentRight` (number): Límite derecho del área de contenido.
 * - `contentWidth` (number): Ancho efectivo del área de contenido.
 * - `gameBoardScaleFactor` (number): Factor de escala para tablero de juego.
 * - `gameInfoScaleFactor` (number): Factor de escala para paneles informativos del juego.
 * - `gameControlsScaleFactor` (number): Factor de escala para controles de juego.
 * - `placeJackpot` (Function): Helper que calcula y posiciona el jackpot en pantalla.
 */
export function applyGameLayout({
    scene,
    w,
    h,
    isPortrait,
    thresholds,
    viewportOverrides,
    contentLeft,
    contentRight,
    contentWidth,
    gameBoardScaleFactor,
    gameInfoScaleFactor,
    gameControlsScaleFactor,
    placeJackpot
}) {
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
        const gameJackpot = (scene.layerGame && scene.layerGame.visible)
            ? placeJackpot(
                w / 2,
                gamePortraitCfg.jackpotTop,
                Math.min(w * gamePortraitCfg.jackpotWidthRatio, gamePortraitCfg.jackpotWidthMax),
                gamePortraitCfg.jackpotHeightRatio
            )
            : null;

        const isCompactPortraitHud = w <= thresholds.compactPortraitMaxW || h <= thresholds.compactPortraitMaxH;
        // Solo tratar como "muy compacto" cuando BOTH ancho y alto son reducidos.
        // Con OR, iPhones normales entraban en este modo y el tablero se achicaba de más.
        const isVeryCompactPortraitHud = w <= thresholds.veryCompactPortraitMaxW && h <= thresholds.veryCompactPortraitMaxH;
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
        const bottomSystemInset = scene.getBottomSystemInset();
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

        scene.layerGame.setPosition(w / 2, gameCenterY);
        scene.layerGame.setScale(scaleGame);

        scene.replayTitleBox.setPosition(0, -CONFIG_GAME.reelTotalHeight / 2 - gamePortraitCfg.replayTitleYOffset);

        const contWinGlobalYOffset = Number(gamePortraitCfg.contWinGlobalYOffset) || 0;
        const contWinRenderY = contWinY + contWinGlobalYOffset;
        scene.uiElements.contWin.container.setPosition(w / 2, contWinRenderY); 
        scene.uiElements.contWin.container.setScale(infoScale);
        
        const controlsGlobalYOffset = Number(gamePortraitCfg.controlsGlobalYOffset) || 0;
        const controlsRenderY = controlsY + controlsGlobalYOffset;
        scene.uiElements.controlsGroup.setPosition(w / 2, controlsRenderY);
        scene.uiElements.controlsGroup.setScale(controlsScale);

        scene.uiElements.replayControlsGroup.setPosition(w / 2, controlsRenderY);
        scene.uiElements.replayControlsGroup.setScale(controlsScale);
        if (scene.uiElements.btnReproducir && scene.uiElements.btnSiguiente) {
            scene.uiElements.btnReproducir.setX(gamePortraitCfg.replayBtnLeftX);
            scene.uiElements.btnSiguiente.setX(gamePortraitCfg.replayBtnRightX);
        }

        scene.uiElements.manualControlsGroup.setPosition(w / 2, controlsRenderY);
        scene.uiElements.manualControlsGroup.setScale(controlsScale);
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
        const isReplayLandscape = false;
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
        const gameJackpot = (scene.layerGame && scene.layerGame.visible)
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

        scene.layerGame.setPosition(gameX, gameY); 
        scene.layerGame.setScale(scaleGame);

        scene.replayTitleBox.setPosition(0, -CONFIG_GAME.reelTotalHeight / 2 - gameLandscapeCfg.replayTitleYOffset);

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
        if (scene.uiElements.landscapeGameTitle && gameJackpot) {
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
        scene.uiElements.contWin.container.setPosition(panelX, contWinY); 
        scene.uiElements.contWin.container.setScale(contWinScale);
        
        scene.uiElements.controlsGroup.setPosition(panelX, controlsY);
        scene.uiElements.controlsGroup.setScale(panelScale);

        scene.uiElements.replayControlsGroup.setPosition(panelX, controlsY);
        scene.uiElements.replayControlsGroup.setScale(panelScale);
        if (scene.uiElements.btnReproducir && scene.uiElements.btnSiguiente) {
            const replayBtnShiftRight = isShortLandscapeGame
                ? gameLandscapeCfg.replayBtnShiftShort
                : (isMidLandscapeGame ? gameLandscapeCfg.replayBtnShiftMid : gameLandscapeCfg.replayBtnShiftDefault);
            scene.uiElements.btnReproducir.setX(gameLandscapeCfg.replayBtnLeftBase + replayBtnShiftRight);
            scene.uiElements.btnSiguiente.setX(gameLandscapeCfg.replayBtnRightBase);
        }

        scene.uiElements.manualControlsGroup.setPosition(panelX, controlsY);
        scene.uiElements.manualControlsGroup.setScale(panelScale);

        if (scene.uiElements.landscapeGameTitle && gameJackpot && landscapeTitleY !== null && landscapeTitleScale !== null) {
            const titleHalfWidth = gameLandscapeCfg.titleHalfWidthBase * landscapeTitleScale;
            const minTitleX = contentLeft + titleHalfWidth + gameLandscapeCfg.titleSafePadding;
            const maxTitleX = contentRight - titleHalfWidth - gameLandscapeCfg.titleSafePadding;
            let titleX = Phaser.Math.Clamp(panelX, minTitleX, Math.max(minTitleX, maxTitleX));
            if (isReplayLandscape) {
                titleX = Phaser.Math.Clamp(panelX, minTitleX, Math.max(minTitleX, maxTitleX));
            }
            scene.uiElements.landscapeGameTitle.setVisible(true);
            scene.uiElements.landscapeGameTitle.setPosition(titleX, landscapeTitleY);
            scene.uiElements.landscapeGameTitle.setScale(landscapeTitleScale);
            const titleBounds = scene.uiElements.landscapeGameTitle.getBounds();
            if (!isReplayLandscape) {
                const minLeft = boardRightEdge + gameLandscapeCfg.titleMinLeftGapFromBoard;
                if (titleBounds.left < minLeft) {
                    titleX += (minLeft - titleBounds.left);
                }
            }
            if (titleBounds.right > (contentRight - gameLandscapeCfg.titleSafePadding)) {
                titleX -= (titleBounds.right - (contentRight - gameLandscapeCfg.titleSafePadding));
            }
            scene.uiElements.landscapeGameTitle.setPosition(titleX, landscapeTitleY);
        }
    }

}
