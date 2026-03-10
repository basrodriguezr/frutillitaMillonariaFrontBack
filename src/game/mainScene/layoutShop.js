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
            leftScaleLandscapeMin: 0.82,
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
            rightPanelBaseNarrow: 0.28,
            rightPanelBaseDefault: 0.24,
            topLeftXRatio: -0.25,
            topRightXExtraOffset: 100,
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
            shopLandscapeTitleScaleMultiplier: 0.56,
            shopLandscapeTitleScaleMin: 0.52,
            shopLandscapeTitleScaleMax: 0.86,
            shopLandscapeTitleYOffset: 34,
            shopLandscapeTitleHalfHeightBase: 26,
            shopLandscapeResultGapBelowTitle: 12,
            shopLandscapeResultGapToCards: 8
        };
        const shopCfg = { ...shopBase, ...shopOverrides };
        const shopCenterX = isPortrait ? (w / 2) : ((contentLeft + contentRight) / 2);
        const shopLayoutWidth = isPortrait ? w : contentWidth;
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
        const isShortLandscapeShop = !isPortrait && h <= thresholds.shortLandscapeShopMaxH;
        const spacing = Math.round(
            (isPortrait
                ? shopCfg.spacingPortrait
                : (isShortLandscapeShop ? shopCfg.spacingLandscapeShort : shopCfg.spacingLandscape))
            * Phaser.Math.Clamp(shopScaleFactor, shopCfg.spacingScaleMin, shopCfg.spacingScaleMax)
        );
        const actualCols = scene.getShopGridCols(scene.shopQty, isPortrait);
        if (scene.currentShopCols !== actualCols) {
            scene.drawShopCards(scene.shopQty);
        }
        const rows = Math.ceil(scene.shopQty / actualCols);
        const { cardW: shopCardW, cardH: shopCardH, pad: shopCardPad } = scene.getShopCardMetrics(scene.shopQty, isPortrait);
        const gridW = (actualCols * shopCardW) + ((actualCols - 1) * shopCardPad);
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
            : (isShortLandscapeShop
                ? Phaser.Math.Clamp(
                    Math.min(shopLayoutWidth * shopCfg.leftScaleLandscapeShortWidthFactor, h * shopCfg.leftScaleLandscapeShortHeightFactor) / shopCfg.leftScaleLandscapeShortDivisor,
                    shopCfg.leftScaleLandscapeShortMin,
                    shopCfg.leftScaleLandscapeShortMax
                )
                : Phaser.Math.Clamp(
                    Math.min(shopLayoutWidth * shopCfg.leftScaleLandscapeWidthFactor, h * shopCfg.leftScaleLandscapeHeightFactor) / shopCfg.leftScaleLandscapeDivisor,
                    shopCfg.leftScaleLandscapeMin,
                    shopCfg.leftScaleLandscapeMax
                ));
        const leftScale = Phaser.Math.Clamp(
            leftScaleBase * shopScaleFactor,
            isPortrait ? shopCfg.leftScaleFinalMinPortrait : shopCfg.leftScaleFinalMinLandscape,
            shopCfg.leftScaleFinalMax
        );
        const useCompactInfoScale = isNarrowLandscapeShop || splitPortraitShopInfo;
        const rightScale = leftScale * (
            isShortLandscapeShop
                ? shopCfg.rightScaleShortMultiplier
                : (useCompactInfoScale ? shopCfg.rightScaleCompactMultiplier : 1)
        );

        if (scene.shopTitlePaquetes) {
            const baseTitlePx = isPortrait
                ? (isMobilePortrait ? shopCfg.titlePxPortraitMobile : shopCfg.titlePxPortraitDefault)
                : (isShortLandscapeShop ? shopCfg.titlePxLandscapeShort : ((!isPortrait && isNarrowLandscapeShop) ? shopCfg.titlePxLandscapeNarrow : shopCfg.titlePxLandscapeDefault));
            const titleSize = `${Math.round(baseTitlePx * shopTitleScaleFactor)}px`;
            if (scene.shopTitlePaquetes.style.fontSize !== titleSize) {
                scene.shopTitlePaquetes.setFontSize(titleSize);
            }
        }

        const topLeftTop = isShortLandscapeShop ? shopCfg.topLeftTopShort : shopCfg.topLeftTopDefault;
        const topLeftBottom = isShortLandscapeShop ? shopCfg.topLeftBottomShort : shopCfg.topLeftBottomDefault;
        const topRightTop = isShortLandscapeShop ? shopCfg.topRightTopShort : shopCfg.topRightTopDefault;
        const topRightBottom = isShortLandscapeShop ? shopCfg.topRightBottomShort : shopCfg.topRightBottomDefault;
        let flowY = safeTop + spacing;
        let controlsBottomYWorld = flowY;
        let shopResultYWorld = null;
        const shopResultX = isPortrait
            ? (splitPortraitShopInfo ? shopLayoutWidth * shopCfg.shopResultXPortraitSplitRatio : 0)
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

        const shopJackpot = placeJackpot(
            isPortrait ? (w / 2) : shopCenterX,
            safeTop,
            isPortrait
                ? Math.min(contentWidth * shopCfg.jackpotWidthPortraitRatio, shopCfg.jackpotWidthPortraitMax)
                : Math.min(shopLayoutWidth * (isShortLandscapeShop ? shopCfg.jackpotWidthLandscapeShortRatio : shopCfg.jackpotWidthLandscapeRatio), shopCfg.jackpotWidthLandscapeMax),
            isPortrait
                ? shopCfg.jackpotHeightRatioPortrait
                : (isShortLandscapeShop ? shopCfg.jackpotHeightRatioLandscapeShort : shopCfg.jackpotHeightRatioLandscape)
        );
        if (shopJackpot) {
            flowY = shopJackpot.bottom + spacing;
        }

        if (isPortrait) {
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
            const topLeftYWorld = flowY + (topLeftTop * leftScale);
            const topRightYOffset = isShortLandscapeShop ? 0 : (isNarrowLandscapeShop ? shopCfg.topRightYOffsetNarrow : 0);
            const topRightYWorld = flowY + ((topRightTop + topRightYOffset) * rightScale);
            const rightPanelBase = isNarrowLandscapeShop ? shopCfg.rightPanelBaseNarrow : shopCfg.rightPanelBaseDefault;
            const rightPanelX = shopLayoutWidth * rightPanelBase;
            const rightPanelVisualLift = shopCfg.rightPanelVisualLiftLandscape * rightScale;
            scene.shopTopLeft.setPosition((shopCfg.topLeftXRatio * shopLayoutWidth) + landscapeShopShiftX, topLeftYWorld - centerY);
            scene.shopTopRight.setPosition(
                rightPanelX + landscapeShopShiftX + shopCfg.topRightXExtraOffset,
                topRightYWorld - centerY - rightPanelVisualLift
            );
            scene.shopTopLeft.setScale(leftScale);
            scene.shopTopRight.setScale(rightScale);
            controlsBottomYWorld = Math.max(
                topLeftYWorld + (topLeftBottom * leftScale),
                topRightYWorld + (topRightBottom * rightScale)
            );
            flowY = controlsBottomYWorld + spacing;
        }

        const maxW = shopLayoutWidth * (isPortrait ? shopCfg.maxWidthPortraitRatio : shopCfg.maxWidthLandscapeRatio);
        const cardsTopPadding = isShortLandscapeShop ? shopCfg.cardsTopPaddingShort : 0;
        const cardsStartY = flowY + cardsTopPadding;
        const cardScaleCap = isShortLandscapeShop ? shopCfg.cardScaleCapShort : shopCfg.cardScaleCapDefault;
        const maxH = Math.max(h - cardsStartY - shopBottomReserve, shopCfg.cardScaleMinHeight);
        let cardScale = Math.min(maxW / gridW, cardScaleCap);
        cardScale = Math.min(cardScale * shopCardsScaleFactor, cardScaleCap);
        if (!isPortrait) {
            const cardScaleRaw = Math.min(cardScale, maxH / gridH);
            cardScale = isShortLandscapeShop ? (cardScaleRaw * shopCfg.cardScaleShortMultiplier) : cardScaleRaw;
        }
        let cardsYWorld;
        if (isPortrait) {
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
            cardsYWorld = cardsStartY + ((gridH * cardScale) / 2);
        }
        const cardsBlockHeight = gridH * cardScale;
        const cardsBlockWidth = gridW * cardScale;
        const cardsTop = cardsYWorld - (cardsBlockHeight / 2);
        let cardsShiftX = 0;
        if (!isPortrait && isShortLandscapeShop) {
            const desiredCardsShiftX = shopCfg.shortLandscapeDesiredCardsShift * cardScale;
            const maxCardsShiftRight = Math.max(0, (contentRight - shopCfg.cardsShiftRightSafeInset) - (shopCenterX + (cardsBlockWidth / 2)));
            cardsShiftX = Math.min(desiredCardsShiftX, maxCardsShiftRight);
        }
        scene.shopCardsContainer.setPosition(cardsShiftX, cardsYWorld - centerY);
        scene.shopCardsContainer.setScale(cardScale);

        let totalWinYWorld;
        if (isPortrait) {
            totalWinYWorld = (shopResultYWorld !== null)
                ? shopResultYWorld
                : (cardsTop - shopCfg.totalWinPortraitFallbackOffset);
        } else {
            const cardsTopLocal = scene.shopCardsContainer.y - (cardsBlockHeight / 2);
            const ticketRowYLocal = scene.shopTopLeft.y + (shopCfg.ticketRowYLocalBase * leftScale);
            const maxCenterYLocal = cardsTopLocal - resultHalfHeight - shopCfg.maxCenterYLocalGap;
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
            const maxResultCenterY = cardsTop - resultHalfHeight - shopCfg.shopLandscapeResultGapToCards;
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
