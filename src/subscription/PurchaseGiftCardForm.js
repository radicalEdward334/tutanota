// @flow

import m from "mithril"
import type {WizardPageAttrs, WizardPageN} from "../gui/base/WizardDialogN"
import {createWizardDialog} from "../gui/base/WizardDialogN"

class CreateGiftCardData {

}

export class SelectGiftCardTypePageAttrs implements WizardPageAttrs<CreateGiftCardData> {
	data: CreateGiftCardData

	constructor(data: CreateGiftCardData) {
		this.data = data
	}

	headerTitle(): string {
		return "Select type"
	}

	nextAction(showErrorDialog: boolean): Promise<boolean> {
		// next action not available for this page
		return Promise.resolve(true)
	}

	isSkipAvailable(): boolean {
		return false
	}

	isEnabled(): boolean {
		return true
	}

}

class SelectGiftCardTypePage implements WizardPageN<CreateGiftCardData> {
	view(vnode: Vnode<WizardPageAttrs<CreateGiftCardData>>): Children {
		return m("")
	}
}

export function showPurchaseGiftCardWizard() {

	const data: CreateGiftCardData = new CreateGiftCardData();
	const wizardPages = [
		{
			attrs: new SelectGiftCardTypePageAttrs(data),
			componentClass: SelectGiftCardTypePage
		},
	]

	createWizardDialog(data, wizardPages, () => {
		return Promise.resolve()
	}).dialog.show()
}