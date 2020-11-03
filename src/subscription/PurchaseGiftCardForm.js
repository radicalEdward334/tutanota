// @flow

import m from "mithril"
import type {WizardPageAttrs, WizardPageN} from "../gui/base/WizardDialogN"
import {createWizardDialog, emitWizardEvent, WizardEventType} from "../gui/base/WizardDialogN"
import {SubscriptionSelector} from "./SubscriptionSelector"
import {getUpgradePrice, SubscriptionType, UpgradePriceType, UpgradeType} from "./SubscriptionUtils"
import {ButtonN, ButtonType} from "../gui/base/ButtonN"

export class CreateGiftCardData {

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
		const a = vnode.attrs
		return m("#upgrade-account-dialog.pt", [
				m(SubscriptionSelector, {
					options: a.data.options,
					campaignInfoTextId: a.data.campaignInfoTextId,
					boxWidth: 230,
					boxHeight: 250,
					highlightPremium: true,
					premiumPrices: a.data.premiumPrices,
					teamsPrices: a.data.teamsPrices,
					proPrices: a.data.proPrices,
					isInitialUpgrade: a.data.upgradeType !== UpgradeType.Switch,
					currentlyActive: a.data.currentSubscription,
					currentlySharingOrdered: false,
					currentlyWhitelabelOrdered: false,
					freeActionButton: {
						view: () => {
							return m(ButtonN, {
								label: "pricing.select_action",
								click: () => {
									confirmFreeSubscription().then(confirmed => {
										if (confirmed) {
											a.data.type = SubscriptionType.Free
											a.data.price = "0"
											a.data.priceNextYear = "0"
											emitWizardEvent(vnode.dom, WizardEventType.SHOWNEXTPAGE)
										}
									})
								},
								type: ButtonType.Login,
							})
						}
					},
					premiumActionButton: {
						view: () => {
							return m(ButtonN, {
								label: "pricing.select_action",
								click: () => {
									a.data.type = SubscriptionType.Premium
									a.data.price = String(getUpgradePrice(a.data, SubscriptionType.Premium, UpgradePriceType.PlanActualPrice))
									let nextYear = String(getUpgradePrice(a.data, SubscriptionType.Premium, UpgradePriceType.PlanNextYearsPrice))
									a.data.priceNextYear = (a.data.price !== nextYear) ? nextYear : null
									emitWizardEvent(vnode.dom, WizardEventType.SHOWNEXTPAGE)
								},
								type: ButtonType.Login,
							})
						}
					},
					teamsActionButton: {
						view: () => {
							return m(ButtonN, {
								label: "pricing.select_action",
								click: () => {
									a.data.type = SubscriptionType.Teams
									a.data.price = String(getUpgradePrice(a.data, SubscriptionType.Teams, UpgradePriceType.PlanActualPrice))
									let nextYear = String(getUpgradePrice(a.data, SubscriptionType.Teams, UpgradePriceType.PlanNextYearsPrice))
									a.data.priceNextYear = (a.data.price !== nextYear) ? nextYear : null
									emitWizardEvent(vnode.dom, WizardEventType.SHOWNEXTPAGE)
								},
								type: ButtonType.Login,
							})
						}
					},
					proActionButton: {
						view: () => {
							return m(ButtonN, {
								label: "pricing.select_action",
								click: () => {
									a.data.type = SubscriptionType.Pro
									a.data.price = String(getUpgradePrice(a.data, SubscriptionType.Pro, UpgradePriceType.PlanActualPrice))
									let nextYear = String(getUpgradePrice(a.data, SubscriptionType.Pro, UpgradePriceType.PlanNextYearsPrice))
									a.data.priceNextYear = (a.data.price !== nextYear) ? nextYear : null
									emitWizardEvent(vnode.dom, WizardEventType.SHOWNEXTPAGE)
								},
								type: ButtonType.Login,
							})
						}
					}
				})
			]
		)
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