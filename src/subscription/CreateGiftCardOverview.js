// @flow

import m from "mithril"
import type {CreateGiftCardData} from "./CreateGiftCardWizard"
import {ButtonN, ButtonType} from "../gui/base/ButtonN"
import {emitWizardEvent, WizardEventType} from "../gui/base/WizardDialogN"
import {HtmlEditor, Mode} from "../gui/base/HtmlEditor"
import {formatNameAndAddress} from "../misc/Formatter"

export type GiftCardOverviewAttrs = {
	data: CreateGiftCardData,
	wizardDom: Stream<HTMLElement>,

}

export class CreateGiftCardOverview implements MComponent<GiftCardOverviewAttrs> {
	_infoField: HtmlEditor

	constructor(vnode: Vnode<GiftCardOverviewAttrs>) {
		this._infoField = new HtmlEditor(() => "Billing Address") // TRANSLATE
			.setMinHeight(140)
			.setMode(Mode.HTML)
			.setEnabled(false)
	}

	view(vnode: Vnode<GiftCardOverviewAttrs>): Children {
		const a = vnode.attrs

		this._infoField.setValue(formatNameAndAddress(a.data.invoiceName, a.data.invoiceAddress, a.data.invoiceCountry))
		const confirmButtonAttr = {
			label: () => "Buy gift card", // Translate
			click: () => {
				emitWizardEvent(vnode.attrs.wizardDom(), WizardEventType.SHOWNEXTPAGE)
			},
			type: ButtonType.Login
		}

		return m(".flex-v-center", [
			m(this._infoField),//payment details
			m(ButtonN, confirmButtonAttr),
		])
	}

}

