//@flow

import m from "mithril"
import stream from "mithril/stream/stream.js"
import {HtmlEditor} from "../gui/base/HtmlEditor"
import {neverNull} from "../api/common/utils/Utils"
import type {TextFieldAttrs} from "../gui/base/TextFieldN"
import {TextFieldN} from "../gui/base/TextFieldN"
import type {EntityEventsListener, EntityUpdateData} from "../api/main/EventController"
import type {Template} from "./TemplateViewList"
import {ButtonN, ButtonType} from "../gui/base/ButtonN"
import type {ButtonAttrs} from "../gui/base/ButtonN"
import {Icons} from "../gui/base/icons/Icons"
import {TemplateEditor} from "./TemplateEditor"
import {Dialog} from "../gui/base/Dialog"
import {elementIdPart, listIdPart} from "../api/common/EntityFunctions"
import {OperationType} from "../api/common/TutanotaConstants"

export class TemplateDetailsViewer {
	view: Function
	_templateContentEditor: HtmlEditor

	constructor(template: Template, keyList: Array<Template>, entityUpdate: EntityEventsListener) {
		this._templateContentEditor = new HtmlEditor(() => "Content")
			.showBorders()
			.setMinHeight(200)
			.setEnabled(false)
		this._templateContentEditor.setValue(template.content)


		const titleAttrs: TextFieldAttrs = {
			label: () => "Title",
			value: stream(template.title),
			disabled: true
		}

		const idAttrs: TextFieldAttrs = {
			label: () => "id",
			value: stream(neverNull(template.id)),
			disabled: true
		}

		const EditButtonAttrs: ButtonAttrs = {
			label: () => "Edit",
			icon: () => Icons.Edit,
			type: ButtonType.Action,
			click: () => {
				new TemplateEditor(keyList, template, entityUpdate)
			}
		}

		const RemoveButtonAttrs: ButtonAttrs = {
			label: () => "Remove",
			icon: () => Icons.Trash,
			type: ButtonType.Action,
			click: () => {
				Dialog.confirm(() => "Are you sure you want to delete the Template?").then((confirmed) => {
					if (confirmed) {
						keyList.splice(template.index, 1)
						localStorage.setItem("Templates", JSON.stringify(keyList))
						entityUpdate([
								{
									application: "tutanota",
									type: "template",
									instanceListId: listIdPart(template._id),
									instanceId: elementIdPart(template._id),
									operation: OperationType.DELETE
								}
							], "fake-owner-id"
						)
					}
				})
			}
		}

		this.view = () => {
			return m("#user-viewer.fill-absolute.scroll.plr-l.pb-floating", [
				m(".h4.mt-l", [
					m("", "Template Settings"),
					m(ButtonN, EditButtonAttrs),
					m(ButtonN, RemoveButtonAttrs),
				]),
				m("", [
					m(TextFieldN, titleAttrs),
					m(TextFieldN, idAttrs),
					m(this._templateContentEditor)
				])
			])
		}
	}

	entityEventsReceived(updates: $ReadOnlyArray<EntityUpdateData>): Promise<void> {
		return Promise.each(updates, update => {
			let p = Promise.resolve()
			return p.then(() => {
			})
		}).then(() => m.redraw())
	}
}