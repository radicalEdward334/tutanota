// @flow

import {HtmlEditor} from "../gui/base/HtmlEditor"
import stream from "mithril/stream/stream.js"
import {neverNull} from "../api/common/utils/Utils"
import type {TextFieldAttrs} from "../gui/base/TextFieldN"
import m from "mithril"
import {TextFieldN} from "../gui/base/TextFieldN"
import type {DialogHeaderBarAttrs} from "../gui/base/DialogHeaderBar"
import {ButtonType} from "../gui/base/ButtonN"
import {Dialog} from "../gui/base/Dialog"
import {createTemplate} from "./TemplateListView"
import type {Template} from "./TemplateListView"
import type {EntityEventsListener, EntityUpdateData} from "../api/main/EventController"
import {elementIdPart, getLetId, listIdPart} from "../api/common/EntityFunctions"
import {OperationType} from "../api/common/TutanotaConstants"

export class TemplateEditor {
	_templateContentEditor: HtmlEditor
	_templateId: Stream<string>
	_templateTitle: Stream<string>
	_templateContents: Stream<string>
	_dialog: Dialog
	newTemplate: Template

	view: Function

	constructor(keyList: Array<Template>, template: ?Template, entityUpdate: EntityEventsListener) {

		this._templateTitle = stream("")
		this._templateId = stream("")
		this._templateContents = stream("")

		if (template) {
			this._templateTitle(neverNull(template).title)
			this._templateId(neverNull(template).id || "")
			this._templateContents(neverNull(template).content)
		}

		this._templateContentEditor = new HtmlEditor(() => "Content")
			.showBorders()
			.setMinHeight(200)
		this._templateContentEditor.setValue(this._templateContents())

		const titleAttrs: TextFieldAttrs = {
			label: () => "Title",
			value: this._templateTitle
		}

		const idAttrs: TextFieldAttrs = {
			label: () => "id",
			value: this._templateId
		}

		this.view = () => {
			return m("", [
				m(TextFieldN, titleAttrs),
				m(TextFieldN, idAttrs),
				m(this._templateContentEditor)
			])
		}

		let dialogOkAction = () => {
			this._templateContents(this._templateContentEditor.getValue())
			if (!this._templateTitle() || !this._templateContents()) {
				Dialog.error(() => "dont do that")
				return
			}

			if (!template) {
				this.newTemplate = createTemplate(this._templateTitle(), this._templateId(), this._templateContents(), keyList.length)
				keyList.push(this.newTemplate)
				localStorage.setItem("Templates", JSON.stringify(keyList))
				entityUpdate([
					{
						application: "tutanota",
						type: "template",
						instanceListId: listIdPart(this.newTemplate._id),
						instanceId: elementIdPart(this.newTemplate._id),
						operation: OperationType.CREATE
					}
				], "fake-owner-id")

			} else {
				keyList[(template.index)].title = this._templateTitle()
				keyList[(template.index)].id = this._templateId()
				keyList[(template.index)].content = this._templateContents()
				localStorage.setItem("Templates", JSON.stringify(keyList))
				entityUpdate([
						{
							application: "tutanota",
							type: "template",
							instanceListId: listIdPart(template._id),
							instanceId: elementIdPart(template._id),
							operation: OperationType.UPDATE
						}
					], "fake-owner-id"
				)
			}

			this._dialog.close()
		}

		let dialogCloseAction = () => {
			this._dialog.close()
		}

		let headerBarAttrs: DialogHeaderBarAttrs = {
			left: [{label: 'cancel_action', click: dialogCloseAction, type: ButtonType.Secondary}],
			right: [{label: 'save_action', click: dialogOkAction, type: ButtonType.Primary}],
			middle: template ? () => "Create Template" : () => "Edit Template"
		}
		this._dialog = Dialog.largeDialog(headerBarAttrs, this)
		this._dialog.show()
	}
}