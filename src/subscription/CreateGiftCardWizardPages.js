// @flow

import type {WizardPageAttrs, WizardPageN} from "../gui/base/WizardDialogN"
import {emitWizardEvent, WizardEventType} from "../gui/base/WizardDialogN"
import m from "mithril"
import stream from "mithril/stream/stream.js"
import {CreateGiftCardSelector} from "./CreateGiftCardSelector"
import type {CreateGiftCardData} from "./CreateGiftCardWizard"
import {CreateGiftCardOverview} from "./CreateGiftCardOverview"
import {HtmlEditor, Mode} from "../gui/base/HtmlEditor"
import {ButtonN, ButtonType} from "../gui/base/ButtonN"
import type {GiftCardPackageEnum} from "./GiftCardUtils"

type CreateGiftCardAttrs = WizardPageAttrs<CreateGiftCardData>

export class GiftCardCreationPage implements WizardPageN<CreateGiftCardData> {

	_messageEditor: HtmlEditor
	_selectedPackage: Stream<GiftCardPackageEnum>

	constructor(vnode: Vnode<CreateGiftCardAttrs>) {
		const data = vnode.attrs.data

		this._messageEditor = new HtmlEditor(() => "Type your message",) // TRANSLATE
			.setMinHeight(300)
			.setMode(Mode.WYSIWYG)
			.showBorders()
			.setValue(data.message)
			.setEnabled(true)

		this._selectedPackage = stream(data.package)
	}

	view(vnode: Vnode<CreateGiftCardAttrs>): Children {
		const a = vnode.attrs
		return m("div", [
			m(CreateGiftCardSelector, {
				data: a.data,
				selectedPackage: this._selectedPackage,
				boxWidth: 230,
				boxHeight: 250,
			}),
			m(this._messageEditor),
			m(ButtonN, {
				label: "next_action",
				click: () => {
					a.data.message = this._messageEditor.getValue()
					a.data.package = this._selectedPackage()
					emitWizardEvent(vnode.dom, WizardEventType.SHOWNEXTPAGE)
				},
				type: ButtonType.Login,
			})
		])
	}
}

/**
 * Ask for user confirmation of gift card
 */
export class GiftCardConfirmationPage implements WizardPageN<CreateGiftCardData> {
	view(vnode: Vnode<CreateGiftCardAttrs>): Children {
		const a = vnode.attrs
		return m(".confirm-giftcard-page.pt", [
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

