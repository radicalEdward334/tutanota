// @flow

import m from "mithril"
import type {BuyOptionBoxAttr} from "./BuyOptionBox"
import {BuyOptionBox} from "./BuyOptionBox"
import {ButtonN, ButtonType} from "../gui/base/ButtonN"
import {formatPrice} from "./SubscriptionUtils"
import {emitWizardEvent, WizardEventType} from "../gui/base/WizardDialogN"
import type {CreateGiftCardData} from "./CreateGiftCardWizard"
import type {GiftCardPackageEnum} from "./GiftCardUtils"
import {getGiftCardPrice, GiftCardPackage, giftCardSelectorLabels} from "./GiftCardUtils"
import {neverNull} from "../api/common/utils/Utils"

export type GiftCardSelectorAttrs = {
	data: CreateGiftCardData,
	boxWidth: number,
	boxHeight: number,
	wizardDom: lazy<HTMLElement>;
}

export class CreateGiftCardSelector implements MComponent<GiftCardSelectorAttrs> {
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
					m(BuyOptionBox, createPremiumGiftCardBoxAttr(vnode.attrs, GiftCardPackage.Silver)),
					m(BuyOptionBox, createPremiumGiftCardBoxAttr(vnode.attrs, GiftCardPackage.Gold)),
					m(BuyOptionBox, createPremiumGiftCardBoxAttr(vnode.attrs, GiftCardPackage.Platinum)),
				])
		]
	}
}

function createPremiumGiftCardBoxAttr(attrs: GiftCardSelectorAttrs, gitfCardPackage: GiftCardPackageEnum): BuyOptionBoxAttr {

	const price = formatPrice(getGiftCardPrice(gitfCardPackage), true)
	return {
		heading: neverNull(giftCardSelectorLabels.get(gitfCardPackage)),
		actionButton: {
			view: () => m(ButtonN, {
				label: "pricing.select_action",
				click: () => {
					attrs.data.package = gitfCardPackage
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
		highlighted: gitfCardPackage === GiftCardPackage.Gold,
		showReferenceDiscount: false,
	}
}

