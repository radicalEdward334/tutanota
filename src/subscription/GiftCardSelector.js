// @flow

import m from "mithril"
import type {BuyOptionBoxAttr} from "./BuyOptionBox"
import {BuyOptionBox} from "./BuyOptionBox"
import {ButtonN, ButtonType} from "../gui/base/ButtonN"
import {formatPrice} from "./SubscriptionUtils"
import {emitWizardEvent, WizardEventType} from "../gui/base/WizardDialogN"
import type {CreateGiftCardData} from "./CreateGiftCardWizard"
import type {GiftCardDurationEnum} from "./GiftCardUtils"
import {getGiftCardPrice, GiftCardDuration, giftCardSelectorLabels} from "./GiftCardUtils"
import {neverNull} from "../api/common/utils/Utils"

export type GiftCardSelectorAttrs = {
	data: CreateGiftCardData,
	boxWidth: number,
	boxHeight: number,
	wizardDom: lazy<HTMLElement>;
}

export class GiftCardSelector implements MComponent<GiftCardSelectorAttrs> {
	_containerDOM: HTMLElement

	view(vnode: Vnode<GiftCardSelectorAttrs>): Children {
		return [
			m(".flex.center-horizontally.wrap", {
					oncreate: (vnode) => {
						this._containerDOM = vnode.dom;
						m.redraw();
					},
				},
				[
					m(BuyOptionBox, createPremiumGiftCardBoxAttr(vnode.attrs, GiftCardDuration.OneYear)),
					m(BuyOptionBox, createPremiumGiftCardBoxAttr(vnode.attrs, GiftCardDuration.ThreeYears)),
					m(BuyOptionBox, createPremiumGiftCardBoxAttr(vnode.attrs, GiftCardDuration.FiveYears))
				])
		]
	}
}

function createPremiumGiftCardBoxAttr(attrs: GiftCardSelectorAttrs, duration: GiftCardDurationEnum): BuyOptionBoxAttr {

	const price = formatPrice(getGiftCardPrice(attrs.data.premiumPrices, duration), true)
	return {
		heading: neverNull(giftCardSelectorLabels.get(duration)),
		actionButton: {
			view: () => m(ButtonN, {
				label: "pricing.select_action",
				click: () => {
					attrs.data.giftCardLength = duration
					emitWizardEvent(attrs.wizardDom(), WizardEventType.SHOWNEXTPAGE)
				},
				type: ButtonType.Login,
			})
		},
		price: price,
		originalPrice: price,
		helpLabel: "pricing.basePriceIncludesTaxes_msg",
		features: () => [],
		width: attrs.boxWidth,
		height: attrs.boxHeight,
		paymentInterval: null,
		highlighted: duration === GiftCardDuration.ThreeYears, //!attrs.options.businessUse() && selectorAttrs.highlightPremium,
		showReferenceDiscount: false, // selectorAttrs.isInitialUpgrade
	}
}

