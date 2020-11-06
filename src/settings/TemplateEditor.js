// @flow

import {HtmlEditor} from "../gui/base/HtmlEditor"
import stream from "mithril/stream/stream.js"
import {neverNull} from "../api/common/utils/Utils"
import type {TextFieldAttrs} from "../gui/base/TextFieldN"
import m from "mithril"
import {TextFieldN} from "../gui/base/TextFieldN"
import type {DialogHeaderBarAttrs} from "../gui/base/DialogHeaderBar"
import {ButtonN, ButtonType} from "../gui/base/ButtonN"
import {Dialog} from "../gui/base/Dialog"
import {createTemplate} from "./TemplateListView"
import type {Template} from "./TemplateListView"
import type {EntityEventsListener} from "../api/main/EventController"
import {elementIdPart, listIdPart} from "../api/common/EntityFunctions"
import {OperationType} from "../api/common/TutanotaConstants"
import {Icons} from "../gui/base/icons/Icons"
import type {ButtonAttrs} from "../gui/base/ButtonN"
import {createDropdown} from "../gui/base/DropdownN"
import {DropDownSelector} from "../gui/base/DropDownSelector"
import {lang} from "../misc/LanguageViewModel"
import {returnLanguages} from "../mail/ReturnLanguages"

export class TemplateEditor {
	_templateContentEditor: HtmlEditor
	_templateId: Stream<string>
	_templateTitle: Stream<string>
	_templateContents: Stream<string>
	_selectedLanguage: Stream<string>
	_dialog: Dialog
	newTemplate: Template
	_selectedValue: Stream<string> = stream("Test")
	_allLanguages: string[]
	view: Function
	_languageContent: {string: string}
	_addedLanguages: string[]

	oncreate: ((Vnode<*>)  => void) = () => {
		this._selectedLanguage("English")
	}

	constructor(keyList: Array<Template>, template: ?Template, entityUpdate: EntityEventsListener) {
		this._templateTitle = stream("")
		this._templateId = stream("")
		this._templateContents = stream("")
		this._selectedLanguage = stream("")
		this._allLanguages = returnLanguages()
		this._languageContent = {}
		this._addedLanguages = []

		this._templateContentEditor = new HtmlEditor(() => "Content")
			.showBorders()
			.setMinHeight(200)

		if (template) {
			this._templateTitle(neverNull(template).title)
			this._templateId(neverNull(template).id || "")
			this._templateContents(neverNull(template).content[this._selectedLanguage()])
			Object.keys(template.content).map(language => {
				this._addedLanguages.push(language)
			})
			for (const [key, value] of Object.entries(template.content)) {
				this._languageContent[key] = value
			}
			this._templateContentEditor.setValue(template.content[this._addedLanguages[0]])
		} else {
			this._addedLanguages.push("English")
			this._templateContentEditor.setValue("")
		}

		const titleAttrs: TextFieldAttrs = {
			label: () => "Title",
			value: this._templateTitle
		}

		const idAttrs: TextFieldAttrs = {
			label: () => "id",
			value: this._templateId
		}

		const languageAttrs: TextFieldAttrs = {
			label: () => "Language",
			value: this._selectedLanguage,
			injectionsRight: () => m(ButtonN, languageButtonAttrs),
			disabled: true
		}

		const languageButtonAttrs: ButtonAttrs = {
			label: () => "More",
			type: ButtonType.Action,
			icon: () => Icons.More,
			click: createDropdown(() => {
				template ? template.content[this._selectedLanguage()] = this._templateContentEditor.getValue() : this._languageContent[this._selectedLanguage()] = this._templateContentEditor.getValue()
				let toSortLanguages = this._allLanguages.map((language) => {
					return {name: language, value: language}
				})
				let j
				for (j = 0; j < this._addedLanguages.length; j++) {
					let k
					for (k = 0; k < toSortLanguages.length; k++) {
						if (toSortLanguages[k].value === this._addedLanguages[j]) {
							toSortLanguages.splice(k, 1)
						}
					}
				}
				let buttons = []
				let i
				for (i = 0; i < this._addedLanguages.length; i++) {
					let temp = this._addedLanguages[i]
					buttons.push({
						label: () => temp,
						click: () => {
							template ?  this._templateContentEditor.setValue(template.content[temp]) : this._templateContentEditor.setValue(this._languageContent[temp])
							this._languageContent[this._selectedLanguage()] = this._templateContentEditor.getValue()
							this._selectedLanguage(temp)
							console.log("temp: ", temp, "LanguageContent: ", this._languageContent)
						},
						type: ButtonType.Dropdown
					})
				}
				buttons.push({
					label: () => "Add Language",
					click: () => {
						let newLanguageCode: Stream<string> = stream(toSortLanguages[0].value)
						let tagName = new DropDownSelector("addLanguage_action", null, toSortLanguages, newLanguageCode, 250)
						let addLanguageOkAction = (dialog) => {
							this._languageContent[this._selectedLanguage()] = this._templateContentEditor.getValue()
							this._selectedLanguage(newLanguageCode())
							this._addedLanguages.push(newLanguageCode())
							this._templateContentEditor.setValue("")
							dialog.close()
						}

						Dialog.showActionDialog({
							title: lang.get("addLanguage_action"),
							child: {view: () => m(tagName)},
							allowOkWithReturn: true,
							okAction: addLanguageOkAction
						})
					},
					type: ButtonType.Dropdown
				})
				return buttons
			})
		}

		this.view = () => {
			return m("", [
				m(TextFieldN, titleAttrs),
				m(TextFieldN, idAttrs),
				m(TextFieldN, languageAttrs),
				m(this._templateContentEditor)
			])
		}

		let dialogOkAction = () => {
			this._templateContents(this._templateContentEditor.getValue())
			if (!this._templateTitle() || !this._templateContents()) {
				Dialog.error(() => "Title or Content is empty!")
				return
			}

			if (!template) {
				this._languageContent[this._selectedLanguage()] = this._templateContentEditor.getValue()
				this.newTemplate = createTemplate(this._templateTitle(), this._templateId(), this._languageContent, keyList.length)
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
				template.content[this._selectedLanguage()] = this._templateContentEditor.getValue()
				this._languageContent[this._selectedLanguage()] = this._templateContentEditor.getValue()
				console.log("selected Language", this._selectedLanguage(), "content:", this._templateContentEditor.getValue())
				keyList[(template.index)].title = this._templateTitle()
				keyList[(template.index)].id = this._templateId()
				keyList[(template.index)].content = this._languageContent
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
			template ? template.content = keyList[template.index].content : null
			this._dialog.close()
		}

		let headerBarAttrs: DialogHeaderBarAttrs = {
			left: [{label: 'cancel_action', click: dialogCloseAction, type: ButtonType.Secondary}],
			right: [{label: 'save_action', click: dialogOkAction, type: ButtonType.Primary}],
			middle: template ? () => "Edit Template" : () => "Create Template"
		}
		this._dialog = Dialog.largeDialog(headerBarAttrs, this)
		this._dialog.show()
	}
}