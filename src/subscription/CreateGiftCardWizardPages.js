// @flow

import type {WizardPageAttrs, WizardPageN} from "../gui/base/WizardDialogN"
import m from "mithril"
import {CreateGiftCardSelector} from "./CreateGiftCardSelector"
import type {CreateGiftCardData} from "./CreateGiftCardWizard"
import {CreateGiftCardOverview} from "./CreateGiftCardOverview"


export class SelectGiftCardTypePage implements WizardPageN<CreateGiftCardData> {
	view(vnode: Vnode<WizardPageAttrs<CreateGiftCardData>>): Children {
		const a = vnode.attrs
		return m("#upgrade-account-dialog.pt", [
				m(CreateGiftCardSelector, {
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
				m(CreateGiftCardOverview, {
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