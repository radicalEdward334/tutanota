// @flow

import type {WizardPageAttrs, WizardPageN} from "../gui/base/WizardDialogN"
import m from "mithril"
import {GiftCardSelector} from "./GiftCardSelector"
import type {CreateGiftCardData} from "./GiftCardWizard"
import {GiftCardOverview} from "./GiftCardOverview"


export class SelectGiftCardTypePage implements WizardPageN<CreateGiftCardData> {
	view(vnode: Vnode<WizardPageAttrs<CreateGiftCardData>>): Children {
		const a = vnode.attrs
		return m("#upgrade-account-dialog.pt", [
				m(GiftCardSelector, {
					data: a.data,
					boxWidth: 230,
					boxHeight: 250,
					wizardDom: () => vnode.dom
				})
			]
		)
	}
}

/**
 * Ask for user confirmation of gift card
 */
export class GiftCardConfirmationPage implements WizardPageN<CreateGiftCardData> {
	view(vnode: Vnode<WizardPageAttrs<CreateGiftCardData>>): Children {
		const a = vnode.attrs
		return m("#upgrade-account-dialog.pt", [
				m(GiftCardOverview, {
					data: a.data,
					boxWidth: 230,
					boxHeight: 250,
					wizardDom: () => vnode.dom
				})
			]
		)
	}
}

/**
 * Show Gift Card after successful server side generation
 */
export class GiftCardPresentationPage implements WizardPageN<CreateGiftCardData> {
	view(vnode: Vnode<WizardPageAttrs<CreateGiftCardData>>): Children {
		const a = vnode.attrs
		return m("#upgrade-account-dialog.pt",
		)

					// data: a.data,
					// boxWidth: 230,
					// boxHeight: 250,
					// wizardDom: () => vnode.dom


	}
}