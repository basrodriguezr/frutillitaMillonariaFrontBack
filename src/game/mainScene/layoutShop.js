import Phaser from 'phaser';

/**
 * Aplica layout responsivo específico de la vista de tienda.
 * Parámetros:
 * - `scene` (object): Instancia de la escena principal.
 * - `w` (number): Ancho disponible de la escena.
 * - `h` (number): Alto disponible de la escena.
 * - `isPortrait` (boolean): Indica si el layout está en orientación vertical.
 * - `isMobilePortrait` (boolean): Indica si el dispositivo está en portrait móvil.
 * - `isTabletPortrait` (boolean): Indica si el dispositivo está en portrait tablet.
 * - `isMobileLandscape` (boolean): Indica si el dispositivo está en landscape móvil.
 * - `isTabletLandscape` (boolean): Indica si el dispositivo está en landscape tablet.
 * - `thresholds` (object): Umbrales de corte para layout responsivo.
 * - `viewportOverrides` (object): Overrides de layout según viewport.
 * - `contentLeft` (number): Límite izquierdo del área de contenido.
 * - `contentRight` (number): Límite derecho del área de contenido.
 * - `contentWidth` (number): Ancho efectivo del área de contenido.
 * - `shopScaleFactor` (number): Factor de escala global para tienda.
 * - `shopCardsScaleFactor` (number): Factor de escala para tarjetas de tienda.
 * - `shopResultScaleFactor` (number): Factor de escala para panel de resultado en tienda.
 * - `gameControlsScaleFactor` (number): Factor de escala para controles de juego.
 * - `shopTitleScaleFactor` (number): Factor de escala para título de tienda.
 * - `placeJackpot` (Function): Helper que calcula y posiciona el jackpot en pantalla.
 */
export function applyShopLayout({
    scene,
    w,
    h,
    isPortrait,
    isMobilePortrait,
    isTabletPortrait,
    isMobileLandscape,
    isTabletLandscape,
    thresholds,
    viewportOverrides,
    contentLeft,
    contentRight,
    contentWidth,
    shopScaleFactor,
    shopCardsScaleFactor,
    shopResultScaleFactor,
    gameControlsScaleFactor,
    shopTitleScaleFactor,
    placeJackpot
}) {
    if (scene.layerShop && scene.layerShop.visible) {
        const portraitMobileLayout = isPortrait && (isMobilePortrait || isTabletPortrait);
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
            leftScaleLandscapeMin: 0.54,
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
            // Ratios proporcionales al alto del viewport (referencia: h=900 desktop)
            topLeftTopRatio: 95 / 900,
            topLeftBottomRatio: 62 / 900,
            topRightTopRatio: 112 / 900,
            topRightBottomRatio: 110 / 900,
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
            jackpotWidthRatioPortraitMobileMatch: 0.92,
            jackpotWidthMaxPortraitMobileMatch: 760,
            jackpotHeightRatioPortraitMobileMatch: 0.29,
            jackpotWidthRatioPortraitTabletMatch: 0.86,
            jackpotWidthMaxPortraitTabletMatch: 740,
            jackpotHeightRatioPortraitTabletMatch: 0.26,
            mobileShopTopLiftBase: 18,
            mobileTopLeftTop: 84,
            mobileTopLeftBottom: 68,
            portraitRightScaleMobileMin: 0.56,
            portraitRightScaleMobileMax: 0.78,
            portraitRightScaleDefaultMin: 0.66,
            portraitRightScaleDefaultMax: 1.04,
            mobileTopRightTop: 122,
            mobileTopRightXShift: -42,
            mobileBuyX: -116,
            mobileBuyY: -74,
            mobileBetMinusX: 104,
            mobileBetPlusX: 284,
            mobileBetRowY: -94,
            mobileBetInfoX: 194,
            mobileBetInfoY: -94,
            mobileBetInfoFontPx: 18,
            mobileBetControlsScale: 0.86,
            mobileTotalX: 194,
            mobileTotalY: -36,
            mobileTotalFontPx: 20,
            resultGapTopMobileBase: 10,
            resultGapTopSplitBase: 8,
            resultGapTopDefaultBase: 14,
            reservedResultHalfMobile: 62,
            topRightYOffsetNarrow: 8,
            rightPanelBaseNarrow: 0.24,
            rightPanelBaseDefault: 0.24,
            topLeftXRatio: -0.25,
            topRightXExtraOffset: 100,
            // Ratio proporcional al shopLayoutWidth (referencia: shopLayoutWidth≈1264 desktop)
            topRightXExtraOffsetRatio: 100 / 1264,
            rightPanelVisualLiftLandscape: 22,
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
            landscapeCardsTopVisualGap: 8,
            landscapeCardsTopLabelOverflowFallback: 22,
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
            landscapeResultOwnRowMaxWidth: 1100,
            landscapeResultRowGapBase: 10,
            landscapeResultOwnRowToCardsGap: 30,
            shopLandscapeTitleScaleMultiplier: 0.56,
            shopLandscapeTitleScaleMin: 0.52,
            shopLandscapeTitleScaleMax: 0.86,
            shopLandscapeTitleYOffset: 34,
            shopLandscapeTitleHalfHeightBase: 26,
            shopLandscapeResultGapBelowTitle: 12,
            shopLandscapeResultGapToCards: 8,
            mobileTopLeftScaleBoostPhone: 1.18,
            mobileTopLeftScaleBoostTablet: 1.12,
            mobileJackpotWidthBoost: 1.12,
            mobileJackpotHeightBoost: 1.06,
            mobileJackpotBoostPhone: 1.24,
            mobileJackpotBoostTablet: 1.14,
            portraitMobileCardScaleCap: 1.46
        };
        const shopCfg = { ...shopBase, ...shopOverrides };
        const shopCenterX = isPortrait ? (w / 2) : ((contentLeft + contentRight) / 2);
        const shopLayoutWidth = isPortrait ? (portraitMobileLayout ? contentWidth : w) : contentWidth;
        scene.layerShop.setPosition(shopCenterX, h / 2);
        
        const centerY = h / 2;
        const safeTop = isPortrait ? shopCfg.safeTopPortrait : shopCfg.safeTopLandscape;
        const shopBottomInset = isPortrait ? scene.getBottomSystemInset() : 0;
        const shopBottomReserveBase = isMobilePortrait
            ? shopCfg.bottomReservePortraitMobile
            : (isTabletPortrait ? shopCfg.bottomReservePortraitTablet : shopCfg.bottomReserveLandscape);
        const shopBottomReserve = isPortrait
            ? Phaser.Math.Clamp(shopBottomReserveBase + Math.max(0, shopBottomInset), shopBottomReserveBase, shopCfg.bottomReservePortraitMax)
            : shopCfg.bottomReserveLandscape;

        const spacing = Math.round(
            (isPortrait ? shopCfg.spacingPortrait : shopCfg.spacingLandscape)
            * Phaser.Math.Clamp(shopScaleFactor, shopCfg.spacingScaleMin, shopCfg.spacingScaleMax)
        );
        const displayQty = portraitMobileLayout ? 20 : scene.shopQty;
        const actualCols = scene.getShopGridCols(displayQty, isPortrait);
        if (scene.currentShopCols !== actualCols || scene.currentShopDisplayQty !== displayQty) {
            scene.drawShopCards(scene.shopQty, { preserveState: true });
        }
        const rows = Math.ceil(displayQty / actualCols);
        const visualCols = !isPortrait && displayQty === 5 ? 10 : actualCols;
        const { cardW: shopCardW, cardH: shopCardH, pad: shopCardPad } = scene.getShopCardMetrics(displayQty, isPortrait);
        const gridW = (visualCols * shopCardW) + ((visualCols - 1) * shopCardPad);
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
            : Phaser.Math.Clamp(
                Math.min(shopLayoutWidth * shopCfg.leftScaleLandscapeWidthFactor, h * shopCfg.leftScaleLandscapeHeightFactor) / shopCfg.leftScaleLandscapeDivisor,
                shopCfg.leftScaleLandscapeMin,
                shopCfg.leftScaleLandscapeMax
            );
        const leftScale = Phaser.Math.Clamp(
            leftScaleBase * shopScaleFactor,
            isPortrait ? shopCfg.leftScaleFinalMinPortrait : shopCfg.leftScaleFinalMinLandscape,
            shopCfg.leftScaleFinalMax
        );
        const useCompactInfoScale = isNarrowLandscapeShop || splitPortraitShopInfo;
        const rightScale = leftScale * (useCompactInfoScale ? shopCfg.rightScaleCompactMultiplier : 1);

        if (scene.shopTitlePaquetes) {
            const baseTitlePx = isPortrait
                ? (isMobilePortrait ? shopCfg.titlePxPortraitMobile : shopCfg.titlePxPortraitDefault)
                : (isNarrowLandscapeShop ? shopCfg.titlePxLandscapeNarrow : shopCfg.titlePxLandscapeDefault);
            const titleSize = `${Math.round(baseTitlePx * shopTitleScaleFactor)}px`;
            if (scene.shopTitlePaquetes.style.fontSize !== titleSize) {
                scene.shopTitlePaquetes.setFontSize(titleSize);
            }
        }

        const topLeftTop = shopCfg.topLeftTopRatio != null ? shopCfg.topLeftTopRatio * h : shopCfg.topLeftTopDefault;
        const topLeftBottom = shopCfg.topLeftBottomRatio != null ? shopCfg.topLeftBottomRatio * h : shopCfg.topLeftBottomDefault;
        const topRightTop = shopCfg.topRightTopRatio != null ? shopCfg.topRightTopRatio * h : shopCfg.topRightTopDefault;
        const topRightBottom = shopCfg.topRightBottomRatio != null ? shopCfg.topRightBottomRatio * h : shopCfg.topRightBottomDefault;
        let flowY = safeTop + spacing;
        let controlsBottomYWorld = flowY;
        let shopResultYWorld = null;
        let landscapeResultOwnRow = false;
        const shopResultX = isPortrait
            ? (portraitMobileLayout ? 0 : (splitPortraitShopInfo ? shopLayoutWidth * shopCfg.shopResultXPortraitSplitRatio : 0))
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

        if (scene.shopTotalWinBox && scene.shopTotalWinBox.container) {
            scene.shopTotalWinBox.container.setScale(shopResultScale);
        }

        const shopJackpot = portraitMobileLayout
            ? null
            : placeJackpot(
                isPortrait ? (w / 2) : shopCenterX,
                safeTop,
                isPortrait
                    ? Math.min(contentWidth * shopCfg.jackpotWidthPortraitRatio, shopCfg.jackpotWidthPortraitMax)
                    : Math.min(shopLayoutWidth * shopCfg.jackpotWidthLandscapeRatio, shopCfg.jackpotWidthLandscapeMax),
                isPortrait ? shopCfg.jackpotHeightRatioPortrait : shopCfg.jackpotHeightRatioLandscape
            );
        if (shopJackpot) {
            flowY = shopJackpot.bottom + spacing;
        }

        if (portraitMobileLayout) {
            if (scene.shopTitlePaquetes) {
                scene.shopTitlePaquetes.setVisible(false);
            }
            const portraitFlowScale = Phaser.Math.Clamp(Math.min(contentWidth / 420, h / 900), 0.84, 1.08);
            const topLeftScaleBoost = isMobilePortrait
                ? shopCfg.mobileTopLeftScaleBoostPhone
                : shopCfg.mobileTopLeftScaleBoostTablet;
            const mobileJackpotWidthRatio = isMobilePortrait
                ? shopCfg.jackpotWidthRatioPortraitMobileMatch
                : shopCfg.jackpotWidthRatioPortraitTabletMatch;
            const mobileJackpotWidthMax = isMobilePortrait
                ? shopCfg.jackpotWidthMaxPortraitMobileMatch
                : shopCfg.jackpotWidthMaxPortraitTabletMatch;
            const mobileJackpotHeightRatio = isMobilePortrait
                ? shopCfg.jackpotHeightRatioPortraitMobileMatch
                : shopCfg.jackpotHeightRatioPortraitTabletMatch;

            // Estructura mobile solicitada:
            // 1) Opciones tickets, 2) Pozo, 3) Resultado, 4) Tarjetas, 5) Controles de apuesta abajo.
            const topLeftPortraitScale = leftScale * portraitFlowScale * topLeftScaleBoost;
            scene.shopTopLeft.setScale(topLeftPortraitScale);
            scene.shopTopLeft.setPosition(0, (safeTop + (42 * topLeftPortraitScale)) - centerY);
            const topLeftBounds = scene.shopTopLeft.getBounds();

            const mobileJackpotTop = topLeftBounds.bottom + Math.max(6, Math.round(spacing * 0.75));
            const mobileShopJackpot = placeJackpot(
                shopCenterX,
                mobileJackpotTop,
                Math.min(w * mobileJackpotWidthRatio, mobileJackpotWidthMax),
                mobileJackpotHeightRatio
            );

            const mobileShopResultScale = Phaser.Math.Clamp(
                topLeftPortraitScale * shopCfg.shopResultScalePortraitMultiplier * shopResultScaleFactor,
                shopCfg.shopResultScalePortraitMin,
                shopCfg.shopResultScalePortraitMax
            );
            const mobileResultHalfHeight = shopCfg.resultHalfHeightBase * mobileShopResultScale;
            if (scene.shopTotalWinBox?.container) {
                scene.shopTotalWinBox.container.setScale(mobileShopResultScale);
            }

            const jackpotBottom = mobileShopJackpot ? mobileShopJackpot.bottom : (topLeftBounds.bottom + spacing);
            const resultGap = Math.max(6, Math.round(spacing * 0.72));
            shopResultYWorld = jackpotBottom + resultGap + mobileResultHalfHeight;
            flowY = shopResultYWorld + mobileResultHalfHeight + resultGap;

            scene.btnBuyShopContainer.setPosition(0, -86);
            scene.btnShopMinus.setPosition(-104, -2);
            scene.btnShopMinus.setScale(1);
            scene.lblShopBetInfo.setPosition(0, -2);
            scene.lblShopBetInfo.setFontSize('20px');
            scene.btnShopPlus.setPosition(104, -2);
            scene.btnShopPlus.setScale(1);
            scene.lblShopTotal.setPosition(0, 58);
            scene.lblShopTotal.setFontSize('24px');

            const controlsScale = Phaser.Math.Clamp(leftScale * 0.96 * portraitFlowScale, 0.72, 1.0);
            scene.shopTopRight.setScale(controlsScale);
            scene.shopTopRight.setPosition(0, 0);
            const controlsBoundsTemp = scene.shopTopRight.getBounds();
            const controlsBottomPaddingBase = isMobilePortrait ? 84 : 74;
            const controlsBottomPadding = Math.round(controlsBottomPaddingBase * portraitFlowScale);
            const targetBottom = h - Math.max(58, shopBottomInset + controlsBottomPadding);
            const controlsShiftY = targetBottom - controlsBoundsTemp.bottom;
            scene.shopTopRight.setPosition(0, controlsShiftY);
            controlsBottomYWorld = scene.shopTopRight.getBounds().bottom;
        } else if (isPortrait) {
            if (scene.shopTitlePaquetes) {
                scene.shopTitlePaquetes.setVisible(true);
            }
            const mobileShopTopLift = isMobilePortrait ? (shopCfg.mobileShopTopLiftBase * leftScale) : 0;
            const topLeftYWorld = flowY + ((isMobilePortrait ? shopCfg.mobileTopLeftTop : topLeftTop) * leftScale) - mobileShopTopLift;
            scene.shopTopLeft.setPosition(0, topLeftYWorld - centerY);
            scene.shopTopLeft.setScale(leftScale);
            flowY = topLeftYWorld + ((isMobilePortrait ? shopCfg.mobileTopLeftBottom : topLeftBottom) * leftScale) + spacing;

            const portraitRightScale = isMobilePortrait
                ? Phaser.Math.Clamp(rightScale * gameControlsScaleFactor, shopCfg.portraitRightScaleMobileMin, shopCfg.portraitRightScaleMobileMax)
                : Phaser.Math.Clamp(rightScale * gameControlsScaleFactor, shopCfg.portraitRightScaleDefaultMin, shopCfg.portraitRightScaleDefaultMax);
            const topRightYWorld = flowY + ((isMobilePortrait ? shopCfg.mobileTopRightTop : topRightTop) * portraitRightScale);
            if (isMobilePortrait) {
                scene.btnBuyShopContainer.setPosition(shopCfg.mobileBuyX, shopCfg.mobileBuyY);
                scene.btnShopMinus.setPosition(shopCfg.mobileBetMinusX, shopCfg.mobileBetRowY);
                scene.btnShopMinus.setScale(shopCfg.mobileBetControlsScale);
                scene.lblShopBetInfo.setPosition(shopCfg.mobileBetInfoX, shopCfg.mobileBetInfoY);
                scene.lblShopBetInfo.setFontSize(`${shopCfg.mobileBetInfoFontPx}px`);
                scene.btnShopPlus.setPosition(shopCfg.mobileBetPlusX, shopCfg.mobileBetRowY);
                scene.btnShopPlus.setScale(shopCfg.mobileBetControlsScale);
                scene.lblShopTotal.setPosition(shopCfg.mobileTotalX, shopCfg.mobileTotalY);
                scene.lblShopTotal.setFontSize(`${shopCfg.mobileTotalFontPx}px`);
            } else {
                scene.btnBuyShopContainer.setPosition(0, -74);
                scene.btnShopMinus.setPosition(-110, 26);
                scene.btnShopMinus.setScale(1);
                scene.lblShopBetInfo.setPosition(0, 26);
                scene.lblShopBetInfo.setFontSize('20px');
                scene.btnShopPlus.setPosition(110, 26);
                scene.btnShopPlus.setScale(1);
                scene.lblShopTotal.setPosition(0, 86);
                scene.lblShopTotal.setFontSize('24px');
            }
            const portraitBetX = isMobilePortrait ? shopCfg.mobileTopRightXShift : 0;
            scene.shopTopRight.setPosition(portraitBetX, topRightYWorld - centerY);
            scene.shopTopRight.setScale(portraitRightScale);
            controlsBottomYWorld = scene.shopTopRight.getBounds().bottom;
            const resultGapTop = isMobilePortrait
                ? (shopCfg.resultGapTopMobileBase * portraitRightScale)
                : (splitPortraitShopInfo ? (shopCfg.resultGapTopSplitBase * rightScale) : (shopCfg.resultGapTopDefaultBase * rightScale));
            const reservedResultHalf = (isMobilePortrait ? shopCfg.reservedResultHalfMobile : resultHalfHeight);
            shopResultYWorld = controlsBottomYWorld + resultGapTop + reservedResultHalf;
            flowY = shopResultYWorld + reservedResultHalf + spacing;
        } else {
            if (scene.shopTitlePaquetes) {
                scene.shopTitlePaquetes.setVisible(true);
            }
            // En landscape se deben forzar posiciones locales para no heredar valores de portrait.
            scene.btnBuyShopContainer.setPosition(0, -74);
            scene.btnShopMinus.setPosition(-110, 26);
            scene.btnShopMinus.setScale(1);
            scene.lblShopBetInfo.setPosition(0, 26);
            scene.lblShopBetInfo.setFontSize('20px');
            scene.btnShopPlus.setPosition(110, 26);
            scene.btnShopPlus.setScale(1);
            scene.lblShopTotal.setPosition(0, 86);
            scene.lblShopTotal.setFontSize('24px');

            const topLeftYWorld = flowY + (topLeftTop * leftScale);
            const topRightYOffset = isNarrowLandscapeShop ? shopCfg.topRightYOffsetNarrow : 0;
            const topRightYWorld = flowY + ((topRightTop + topRightYOffset) * rightScale);
            const rightPanelBase = isNarrowLandscapeShop ? shopCfg.rightPanelBaseNarrow : shopCfg.rightPanelBaseDefault;
            const rightPanelX = shopLayoutWidth * rightPanelBase;
            const rightPanelVisualLift = shopCfg.rightPanelVisualLiftLandscape * rightScale;
            const topRightXExtraOffset = shopCfg.topRightXExtraOffsetRatio != null
                ? shopCfg.topRightXExtraOffsetRatio * shopLayoutWidth
                : shopCfg.topRightXExtraOffset;
            scene.shopTopLeft.setPosition((shopCfg.topLeftXRatio * shopLayoutWidth) + landscapeShopShiftX, topLeftYWorld - centerY);
            scene.shopTopRight.setPosition(
                rightPanelX + topRightXExtraOffset,
                topRightYWorld - centerY - rightPanelVisualLift
            );
            scene.shopTopLeft.setScale(leftScale);
            scene.shopTopRight.setScale(rightScale);
            const topLeftBounds = scene.shopTopLeft.getBounds();
            const topRightBounds = scene.shopTopRight.getBounds();
            controlsBottomYWorld = Math.max(topLeftBounds.bottom, topRightBounds.bottom);

            const rightScaleNow = scene.shopTopRight.scaleX || rightScale;
            const resultHalfWidth = shopCfg.resultHalfWidthBase * shopResultScale;
            const ticket20LocalX = scene.qtyButtons?.[3]?.x ?? shopCfg.ticket20LocalFallbackX;
            const ticket20CenterX = scene.shopTopLeft.x + (ticket20LocalX * leftScale);
            const ticket20RightEdge = ticket20CenterX + (shopCfg.ticket20RightEdgeHalfWidth * leftScale);
            const minusCenterX = scene.shopTopRight.x + ((scene.btnShopMinus?.x ?? shopCfg.minusCenterFallbackX) * rightScaleNow);
            const minusLeftEdge = minusCenterX - (shopCfg.minusHalfWidth * rightScaleNow);
            const centerEdgeGap = shopCfg.totalWinCenterEdgeGap * rightScaleNow;
            const horizontalRoom = minusLeftEdge - ticket20RightEdge;
            const requiredRoom = (resultHalfWidth * 2) + (centerEdgeGap * 2);
            landscapeResultOwnRow = (w < shopCfg.landscapeResultOwnRowMaxWidth) || (horizontalRoom < requiredRoom);

            if (landscapeResultOwnRow) {
                const rowGap = Math.max(spacing, shopCfg.landscapeResultRowGapBase * rightScaleNow);
                shopResultYWorld = controlsBottomYWorld + rowGap + resultHalfHeight;
                flowY = shopResultYWorld + resultHalfHeight + spacing + shopCfg.landscapeResultOwnRowToCardsGap;
            } else {
                flowY = controlsBottomYWorld + spacing;
            }
        }

        const maxW = shopLayoutWidth * (isPortrait ? shopCfg.maxWidthPortraitRatio : shopCfg.maxWidthLandscapeRatio);
        const firstRowCard = !isPortrait && Array.isArray(scene.shopCards)
            ? scene.shopCards.find((card) => card?.gridRow === 0 && card?.ticketTag)
            : null;
        let measuredTopLabelOverflowLocal = 0;
        if (firstRowCard?.ticketTag) {
            const tag = firstRowCard.ticketTag;
            const tagOriginY = Number.isFinite(tag.originY) ? tag.originY : 0.5;
            const tagTopLocal = tag.y - (tag.height * tagOriginY);
            const cardTopLocal = -(firstRowCard.cardH / 2);
            measuredTopLabelOverflowLocal = Math.max(0, cardTopLocal - tagTopLocal);
        }
        const cardsTopLabelOverflowLocal = !isPortrait
            ? Math.max(shopCfg.landscapeCardsTopLabelOverflowFallback, measuredTopLabelOverflowLocal)
            : 0;
        const cardsStartY = flowY + (!isPortrait ? shopCfg.landscapeCardsTopVisualGap : 0);
        const cardScaleCap = portraitMobileLayout ? shopCfg.portraitMobileCardScaleCap : shopCfg.cardScaleCapDefault;
        const maxH = Math.max(h - cardsStartY - shopBottomReserve, shopCfg.cardScaleMinHeight);
        let cardScale = Math.min(maxW / gridW, cardScaleCap);
        cardScale = Math.min(cardScale * shopCardsScaleFactor, cardScaleCap);
        if (!isPortrait) {
            cardScale = Math.min(cardScale, maxH / (gridH + cardsTopLabelOverflowLocal));
        }
        let cardsYWorld;
        if (portraitMobileLayout) {
            const minTopWorld = flowY + shopCfg.portraitMinTopWorldGap;
            const controlsTopWorld = scene.shopTopRight.getBounds().top;
            const cardsTopWorld = minTopWorld;
            const cardsBottomLimit = Math.max(cardsTopWorld + shopCfg.cardScaleMinHeight, controlsTopWorld - spacing);
            const fitScale = (cardsBottomLimit - cardsTopWorld) / gridH;
            cardScale = Phaser.Math.Clamp(Math.min(cardScale, fitScale), shopCfg.portraitCardScaleMin, cardScaleCap);
            cardsYWorld = cardsTopWorld + ((gridH * cardScale) / 2);
        } else if (isPortrait) {
            const cardsBottomLimit = h - shopBottomReserve;
            const minTopWorld = flowY + shopCfg.portraitMinTopWorldGap;
            let cardsTopWorld = cardsStartY + (isMobilePortrait ? shopCfg.portraitCardsTopMobileAdjust : 0) + shopCfg.portraitCardsTopOffset;
            // En portrait, las tarjetas nunca deben invadir la zona de controles/resultado.
            cardsTopWorld = Math.max(cardsTopWorld, minTopWorld);
            let projectedBottom = cardsTopWorld + (gridH * cardScale);
            if (projectedBottom > cardsBottomLimit) {
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
            cardsYWorld = cardsStartY + (cardsTopLabelOverflowLocal * cardScale) + ((gridH * cardScale) / 2);
        }
        const cardsBlockHeight = gridH * cardScale;
        const cardsBlockWidth = gridW * cardScale;
        const cardsTop = cardsYWorld - (cardsBlockHeight / 2);
        const cardsTopVisual = !isPortrait ? (cardsTop - (cardsTopLabelOverflowLocal * cardScale)) : cardsTop;
        const cardsBottom = cardsTop + cardsBlockHeight;
        if (portraitMobileLayout) {
            // En mobile portrait el bloque de apuesta debe quedar inmediatamente bajo el tablero
            // y siempre dentro del viewport.
            const controlsGapFromCards = Math.max(10, Math.round(spacing * 0.9));
            const controlsBounds = scene.shopTopRight.getBounds();
            const controlsHeight = Math.max(1, controlsBounds.height);
            const controlsTopOffset = controlsBounds.top - (centerY + scene.shopTopRight.y);
            const controlsBottomSafe = h - Math.max(18, shopBottomInset + 18);
            const maxControlsTop = controlsBottomSafe - controlsHeight;
            const desiredControlsTop = cardsBottom + controlsGapFromCards;
            const targetControlsTop = Phaser.Math.Clamp(desiredControlsTop, safeTop, Math.max(safeTop, maxControlsTop));
            const targetControlsLocalY = targetControlsTop - centerY - controlsTopOffset;
            scene.shopTopRight.setPosition(scene.shopTopRight.x, targetControlsLocalY);
            controlsBottomYWorld = scene.shopTopRight.getBounds().bottom;
        }
        let cardsShiftX = 0;
        if (!isPortrait) {
            const topLeftScaleNow = scene.shopTopLeft?.scaleX || leftScale;
            const firstQtyBtnX = scene.qtyButtons?.[0]?.x;
            const firstQtyBtnHalfW = 45;
            const fallbackLeftEdge = shopCenterX - (cardsBlockWidth / 2);
            const targetLeftEdge = Number.isFinite(firstQtyBtnX)
                ? (shopCenterX + (scene.shopTopLeft?.x || 0) + ((firstQtyBtnX - firstQtyBtnHalfW) * topLeftScaleNow))
                : fallbackLeftEdge;
            const desiredCardsShiftX = (targetLeftEdge + (cardsBlockWidth / 2)) - shopCenterX;
            const minCardsShiftX = (contentLeft + shopCfg.cardsShiftRightSafeInset + (cardsBlockWidth / 2)) - shopCenterX;
            const maxCardsShiftX = (contentRight - shopCfg.cardsShiftRightSafeInset - (cardsBlockWidth / 2)) - shopCenterX;
            cardsShiftX = Phaser.Math.Clamp(desiredCardsShiftX, minCardsShiftX, Math.max(minCardsShiftX, maxCardsShiftX));
        }
        scene.shopCardsContainer.setPosition(cardsShiftX, cardsYWorld - centerY);
        scene.shopCardsContainer.setScale(cardScale);
        const showTicketTags = !isMobilePortrait && !isTabletPortrait;
        if (Array.isArray(scene.shopCards)) {
            scene.shopCards.forEach((card) => {
                if (!card?.ticketTag) return;
                const hasRevealedData = Boolean(card.replayData);
                card.ticketTag.setVisible(showTicketTags && hasRevealedData);
            });
        }

        let totalWinYWorld;
        if (shopResultYWorld !== null) {
            totalWinYWorld = shopResultYWorld;
        } else if (isPortrait) {
            totalWinYWorld = cardsTop - shopCfg.totalWinPortraitFallbackOffset;
        } else {
            const cardsTopLocal = scene.shopCardsContainer.y - (cardsBlockHeight / 2);
            const cardsTopVisualLocal = cardsTopLocal - (cardsTopLabelOverflowLocal * cardScale);
            const ticketRowYLocal = scene.shopTopLeft.y + (shopCfg.ticketRowYLocalBase * leftScale);
            const maxCenterYLocal = cardsTopVisualLocal - resultHalfHeight - shopCfg.maxCenterYLocalGap;
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
            const rightScaleNow = scene.shopTopRight.scaleX || rightScale;
            const resultHalfWidth = shopCfg.resultHalfWidthBase * shopResultScale;
            if (landscapeResultOwnRow) {
                const rowCenterTarget = (scene.shopTopLeft.x + scene.shopTopRight.x) / 2;
                const minCenter = (contentLeft - shopCenterX) + resultHalfWidth + shopCfg.cardsShiftRightSafeInset;
                const maxCenter = (contentRight - shopCenterX) - resultHalfWidth - shopCfg.cardsShiftRightSafeInset;
                totalWinX = Phaser.Math.Clamp(
                    rowCenterTarget,
                    minCenter,
                    Math.max(minCenter, maxCenter)
                );
            } else {
                const minusCenterX = scene.shopTopRight.x + ((scene.btnShopMinus?.x ?? shopCfg.minusCenterFallbackX) * rightScaleNow);
                const ticket20LocalX = scene.qtyButtons?.[3]?.x ?? shopCfg.ticket20LocalFallbackX;
                const ticket20CenterX = scene.shopTopLeft.x + (ticket20LocalX * leftScale);
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
        }
        if (!isPortrait && scene.uiElements.landscapeGameTitle && shopJackpot) {
            const shopResultWorldX = shopCenterX + totalWinX;
            const titleScale = Phaser.Math.Clamp(
                rightScale * shopCfg.shopLandscapeTitleScaleMultiplier,
                shopCfg.shopLandscapeTitleScaleMin,
                shopCfg.shopLandscapeTitleScaleMax
            );
            const titleY = shopJackpot.bottom + (shopCfg.shopLandscapeTitleYOffset * titleScale);
            const titleHalfHeight = shopCfg.shopLandscapeTitleHalfHeightBase * titleScale;
            const minResultCenterY = titleY + titleHalfHeight + resultHalfHeight + shopCfg.shopLandscapeResultGapBelowTitle;
            const maxResultCenterY = cardsTopVisual - resultHalfHeight - shopCfg.shopLandscapeResultGapToCards;
            totalWinYWorld = Phaser.Math.Clamp(
                totalWinYWorld,
                minResultCenterY,
                Math.max(minResultCenterY, maxResultCenterY)
            );
            scene.uiElements.landscapeGameTitle.setVisible(true);
            scene.uiElements.landscapeGameTitle.setPosition(shopResultWorldX, titleY);
            scene.uiElements.landscapeGameTitle.setScale(titleScale);
        }
        scene.shopTotalWinBox.container.setPosition(totalWinX, totalWinYWorld - centerY);
    }
}
