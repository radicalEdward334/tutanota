// @flow

import m from "mithril"
import {BuyOptionBox, getActiveSubscriptionActionButtonReplacement} from "./BuyOptionBox"
import type {BuyOptionBoxAttr} from "./BuyOptionBox"
import {lang} from "../misc/LanguageViewModel"
import {ButtonN, ButtonType} from "../gui/base/ButtonN"
import {formatPrice, getFormattedUpgradePrice, SubscriptionType, UpgradePriceType} from "./SubscriptionUtils"
import type {SubscriptionOptions} from "./SubscriptionUtils"
import {emitWizardEvent, WizardEventType} from "../gui/base/WizardDialogN"
import type {PlanPrices} from "../api/entities/sys/PlanPrices"
import type {CreateGiftCardData} from "./GiftCardWizard"

export const GiftCardDuration =
	Object.freeze
	      ({
		      OneYear: "0",
		      ThreeYears: "1",
		      FiveYears: "2"
	      })

export type GiftCardDurationEnum = $Values<typeof GiftCardDuration>

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
		heading: getGiftCardSelectorLabel(duration),
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

function getGiftCardPrice(planPrices: PlanPrices, duration: GiftCardDurationEnum): number {
	const yearlyPrice = Number(planPrices.monthlyPrice) * 10
	switch (duration) {
		case GiftCardDuration.OneYear:
			return yearlyPrice
		case GiftCardDuration.ThreeYears:
			return yearlyPrice * 3
		case GiftCardDuration.FiveYears:
			return yearlyPrice * 5
		default:
			return yearlyPrice
	}
}

function getGiftCardSelectorLabel(duration: GiftCardDurationEnum): string {
	switch (duration) {
		case GiftCardDuration.OneYear:
			return "One Year"
		case GiftCardDuration.ThreeYears:
			return "Three Years"
		case GiftCardDuration.FiveYears:
			return "Five Years"
		default:
			return ""
	}
}