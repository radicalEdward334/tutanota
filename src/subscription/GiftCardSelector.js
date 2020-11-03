// @flow

import m from "mithril"
import {BuyOptionBox, getActiveSubscriptionActionButtonReplacement} from "./BuyOptionBox"
import {CreateGiftCardData} from "./PurchaseGiftCardForm"
import type {BuyOptionBoxAttr} from "./BuyOptionBox"
import {getFormattedUpgradePrice, SubscriptionType, UpgradePriceType} from "./SubscriptionUtils"
import {lang} from "../misc/LanguageViewModel"

export class GiftCardSelector implements MComponent<CreateGiftCardData> {
	_containerDOM: HTMLElement

	view(vnode: Vnode<CreateGiftCardData>): Children {
		return [
			m(".flex.center-horizontally.wrap", {
					oncreate: (vnode) => {
						this._containerDOM = vnode.dom;
						m.redraw();
					},
				},
				[
					m(BuyOptionBox, createPremiumGiftCardBoxAttr(vnode.attrs)),
					m(BuyOptionBox, createTeamsGiftCardBoxAttr(vnode.attrs))
				])
		]
	}
}

function createPremiumGiftCardBoxAttr(attrs: CreateGiftCardData): BuyOptionBoxAttr {
	return {
		heading: 'Premium',
		actionButton: attrs.premiumActionButton,
		price: getFormattedUpgradePrice(selectorAttrs, SubscriptionType.Premium, UpgradePriceType.PlanActualPrice),
		originalPrice: getFormattedUpgradePrice(selectorAttrs, SubscriptionType.Premium, UpgradePriceType.PlanReferencePrice),
		helpLabel: selectorAttrs.options.businessUse() ? "pricing.basePriceExcludesTaxes_msg" : "pricing.basePriceIncludesTaxes_msg",
		features: () => [
			lang.get("pricing.comparisonAddUser_msg", {"{1}": getFormattedUpgradePrice(selectorAttrs, SubscriptionType.Premium, UpgradePriceType.AdditionalUserPrice)}),
			lang.get("pricing.comparisonStorage_msg", {"{amount}": selectorAttrs.premiumPrices.includedStorage}),
			lang.get("pricing.comparisonDomainPremium_msg"),
			lang.get("pricing.comparisonSearchPremium_msg"),
			lang.get("pricing.comparisonMultipleCalendars_msg"),
			lang.get("pricing.mailAddressAliasesShort_label", {"{amount}": selectorAttrs.premiumPrices.includedAliases}),
			lang.get("pricing.comparisonInboxRulesPremium_msg"),
			lang.get("pricing.comparisonSupportPremium_msg"),
		],
		width: selectorAttrs.boxWidth,
		height: selectorAttrs.boxHeight,
		paymentInterval: selectorAttrs.isInitialUpgrade ? selectorAttrs.options.paymentInterval : null,
		highlighted: !selectorAttrs.options.businessUse() && selectorAttrs.highlightPremium,
		showReferenceDiscount: selectorAttrs.isInitialUpgrade
	}
}

function createTeamsGiftCardBoxAttr(attrs: CreateGiftCardData): BuyOptionBoxAttr {

}