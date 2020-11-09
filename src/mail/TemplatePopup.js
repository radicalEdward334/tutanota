//@flow
import m from "mithril"
import type {ModalComponent} from "../gui/base/Modal"
import {modal} from "../gui/base/Modal"
import {px} from "../gui/size"
import type {Shortcut} from "../misc/KeyManager"
import type {PosRect} from "../gui/base/Dropdown"
import {TextFieldN} from "../gui/base/TextFieldN"
import type {TextFieldAttrs} from "../gui/base/TextFieldN"
import stream from "mithril/stream/stream.js"
import {Keys} from "../api/common/TutanotaConstants"
import {TemplateDisplayer} from "./TemplateDisplayer"
import {searchForID, searchInContent} from "./TemplateSearchFilter.js"
import type {Template} from "../settings/TemplateListView"
import {loadTemplates} from "../settings/TemplateListView"
import {Icons} from "../gui/base/icons/Icons"
import {Icon} from "../gui/base/Icon"
import {debounce} from "../api/common/utils/Utils"
import {DropDownSelectorN} from "../gui/base/DropDownSelectorN"


export class TemplatePopup implements ModalComponent {
	_rect: PosRect
	_filterTextAttrs: TextFieldAttrs
	_shortcuts: Shortcut[]
	_scrollDom: HTMLElement

	_allTemplates: Array<Template>
	_searchResults: Array<Template>

	_onSubmit: (string) => void

	_selected: boolean
	_foundResults: boolean
	_cursorHover: boolean
	_expanded: boolean
	_height: string
	_currentIndex: number = 0

	_selectedLanguage: Stream<string>
	_availableLanguages: Array<Object>

	constructor(rect: PosRect, onSubmit: (string) => void) {
		this._height = "270px"
		this._foundResults = true
		this._allTemplates = loadTemplates()
		this._searchResults = this._allTemplates
		this._setProperties()
		this._rect = rect
		this._onSubmit = onSubmit
		this._loadLanguages()
		this._selectedLanguage = stream(this._availableLanguages[0].value)
		this._filterTextAttrs = {
			label: () => "Filter... (# to search for id's)",
			value: stream(""),
			focusOnCreate: true,
			oninput: (input) => { /* Filter function */
				if (input === "") {
					this._searchResults = this._allTemplates
					this._setProperties()
				} else if (input.charAt(0) === "#") { // search ID
					this._searchResults = searchForID(input, this._allTemplates)
					this._setProperties()
				} else { // search title / content
					this._searchResults = searchInContent(input, this._allTemplates)
					this._setProperties()
				}

			}
		}
		this._shortcuts = [
			{
				key: Keys.ESC,
				enabled: () => true,
				exec: () => {
					this._onSubmit("")
					this._close()
					m.redraw()
				},
				help: "closeSession_action"
			},
			{
				key: Keys.RETURN,
				enabled: () => true,
				exec: () => {
					console.log(this._searchResults[this._currentIndex].content)
					var text = this._searchResults[this._currentIndex].content[this._selectedLanguage()]
					console.log(text)
					this._onSubmit(text)
					this._close()
					m.redraw()
				},
				help: "closeSession_action"
			},
		]
	}

	oncreate: ((Vnode<*>)  => void) = () => {
		this._expanded = true
	}

	view: () => Children = () => {

		this._loadLanguages()
		//Sort
		this._availableLanguages.sort(function (a, b) {
			var textA = a.name.toUpperCase();
			var textB = b.name.toUpperCase();
			return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
		})

		return m(".flex.abs.elevated-bg.plr.border-radius.dropdown-shadow", { // Main Wrapper
				style: {
					width: this._expanded ? "750px" : "375px",
					margin: "1px",
					top: px(this._rect.top),
					left: px(this._rect.left),
					flexDirection: "row",
					height: this._height + "px",
					cursor: this._cursorHover ? "pointer" : "default",
				},
				onclick: (e) => {
					e.stopPropagation() /* stops click from going through component*/
				},
			}, [
				m(".flex.flex-column", {style: {height: "340px", width: "375px"}}, [
					m(".flex", { // Header Wrapper
						style: {
							flexDirection: "row",
							height: "70px",
							marginBottom: "-18px",
							width: "375px"
						},
						onkeydown: (e) => { /* simulate scroll with arrow keys */
							if (e.keyCode === 27) { // ESC
								this._close
							} else if (e.keyCode === 40) { // DOWN
								this._changeSelection("next")
								this._scrollDom.scroll({
									top: (47.7167 * this._currentIndex),
									left: 0,
									behavior: 'smooth'
								})
							} else if (e.keyCode === 38) { // UP
								e.preventDefault()
								this._changeSelection("previous")
								this._scrollDom.scroll({
									top: (47.7167 * this._currentIndex),
									left: 0,
									behavior: 'smooth'
								})
							}
						},
					}, [
						m("", {
								style: {
									marginTop: "-12px",
									flex: "1 0 auto",
								},
							}, m(TextFieldN, this._filterTextAttrs)
						), // Filter Text
					]), // Header Wrapper END
					m(".flex.flex-column.scroll", { // Template Text
							style: {
								height: this._height,
								overflowY: "show",
								marginBottom: "3px",
								width: "375px"
							},
							oncreate: (vnode) => {
								this._scrollDom = vnode.dom
							},
						}, this._foundResults ?
						this._searchResults.map((template, index) => {
							this._selected = index === this._currentIndex
							return m(".flex", {
									onclick: (e) => {
										this._onSubmit(this._searchResults[index].content[this._selectedLanguage()])
										this._close()
										e.stopPropagation()
									},
									onmouseover: () => this._cursorHover = true,
									onmouseleave: () => this._cursorHover = false,
									class: this._selected ? "row-selected" : "", /* show row as selected when using arrow keys */
									style: {
										borderLeft: this._selected ? "4px solid" : "4px solid transparent",
									}
								}, [
									m(TemplateDisplayer, {template}),
									this._selected ? m(Icon, {icon: Icons.ArrowForward, style: {marginTop: "auto", marginBottom: "auto"}}) : null
								]
							)
						})
						: m(".row-selected", {style: {marginTop: "10px", textAlign: "center"}}, "Nothing found")
					), // Template Text END
				]),
				m(".flex.flex-column", {style: {marginLeft: "7px"}}, [
					this._foundResults ? m("", {style: {marginTop: "-12px"}}, [
						m(DropDownSelectorN, {
							label: () => "Choose Language",
							items: this._availableLanguages,
							selectedValue: this._selectedLanguage,
							dropdownWidth: 250,
						})
					]) : null,
					m("", {style: {overflow: "scroll", maxHeight: "302.2833px", width: "355px", overflowWrap: "break-word"}},
						this._foundResults ? [m.trust(this._searchResults[this._currentIndex].content[this._selectedLanguage()])] : console.log("content empty"))
				])
			]
		)
	}

	_setProperties() { /* improvement to dynamically calculate height with certain amount of templates and reset selection to first template */
		if (this._searchResults.length < 7 && this._searchResults.length !== 0) {
			this._foundResults = true
			this._height = (this._searchResults.length * 47.7167) + 10 + "px"
		} else if (this._searchResults.length === 0) {
			this._foundResults = false
			this._height = "40px"
		} else {
			this._foundResults = true
			this._height = "285px"
		}
		this._currentIndex = 0
	}

	_expanderOpenClose: ("open" | "close") => void = debounce(550, (state) => {
		console.log("opened")
		if (state === "open") {
			this._expanded = true
			m.redraw()
		} else if (state === "close") {
			this._expanded = false
			m.redraw()
		}
	})

	_changeSelection(action: string) { /* count up or down in templates */
		if (action === "next" && this._currentIndex <= this._searchResults.length - 2) {
			this._expanderOpenClose("open")
			this._currentIndex++
		} else if (action === "previous" && this._currentIndex > 0) {
			this._expanderOpenClose("open")
			this._currentIndex--
		}
	}

	_loadLanguages() {
		let temp = []
		if (this._foundResults) {
			temp = Object.keys(this._searchResults[this._currentIndex].content)
			this._availableLanguages = temp.map(language => {
				return {
					name: language,
					value: language
				}
			})
		}
	}

	show() {
		modal.display(this, false)
	}

	_close(): void {
		modal.remove(this)
	}

	backgroundClick(e: MouseEvent): void {
		this._close()
		// console.log(e.target)
	}

	hideAnimation(): Promise<void> {
		return Promise.resolve()
	}

	onClose(): void {
	}

	shortcuts(): Shortcut[] {
		return this._shortcuts
	}

	popState(e: Event): boolean {
		return true
	}
}