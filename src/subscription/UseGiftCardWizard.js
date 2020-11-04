//@flow

import m from "mithril"
import stream from "mithril/stream/stream.js"
import type {GiftCard} from "./GiftCardUtils"
import {giftCardDurationsInYears, ValueToGiftCardDuration} from "./GiftCardUtils"
import {neverNull} from "../api/common/utils/Utils"
import type {WizardPageAttrs, WizardPageN} from "../gui/base/WizardDialogN"
import {createWizardDialog} from "../gui/base/WizardDialogN"
import {logins} from "../api/main/LoginController"
import type {NewAccountData} from "./UpgradeSubscriptionWizard"
import {loadUpgradePrices} from "./UpgradeSubscriptionWizard"
import {Dialog} from "../gui/base/Dialog"
import {LoginForm} from "../login/LoginForm"

type GiftCardRedeemData = {
	newAccountData: ?NewAccountData,
	mailAddress: Stream<string>,
	password: Stream<string>,
}

class GiftCardWelcomePage implements WizardPageN<GiftCardRedeemData> {
	view(): Children {
		return []
	}
}

class GiftCardCredentialsPage implements WizardPageN<GiftCardRedeemData> {
	view(vnode: Vnode<WizardPageAttrs<GiftCardRedeemData>>): Children {
		const data = vnode.attrs.data
		const loginFormAttrs = {
			onSubmit: (username, password) => {},
			mailAddress: data.mailAddress,
			password: data.password,
		}
		return m(LoginForm, loginFormAttrs)
	}
}


export function loadUseGiftCardWizard(giftCard: GiftCard): Promise<Dialog> {
	const years = neverNull(giftCardDurationsInYears.get(ValueToGiftCardDuration[giftCard.duration]))
	return loadUpgradePrices().then(prices => {
		// const signupData: UpgradeSubscriptionData = {
		// 	options: {
		// 		businessUse: stream(false),
		// 		paymentInterval: stream(years),
		// 	},
		// 	invoiceData: {
		// 		invoiceAddress: "",
		// 		country: null,
		// 		vatNumber: "" // only for EU countries otherwise empty
		// 	},
		// 	paymentData: {
		// 		paymentMethod: null,
		// 		creditCardData: null,
		// 	},
		// 	price: "",
		// 	priceNextYear: null,
		// 	type: SubscriptionType.Premium,
		// 	accountingInfo: null,
		// 	newAccountData: null,
		// 	campaign: null,
		// 	campaignInfoTextId: null,
		// 	upgradeType: UpgradeType.Signup,
		// 	premiumPrices: prices.premiumPrices,
		// 	teamsPrices: prices.teamsPrices,
		// 	proPrices: prices.proPrices,
		// 	currentSubscription: null
		// }

		const giftCardRedeemData: GiftCardRedeemData = {
			newAccountData: null,
			mailAddress: stream(""),
			password: stream(""),
		}
		const wizardPages = [
			{
				attrs: {
					data: giftCardRedeemData,
					headerTitle(): string {
						return "You got a Gift Card"
					},
					nextAction(showErrorDialog: boolean): Promise<boolean> {
						// next action not available for this page
						return Promise.resolve(true)
					},
					isSkipAvailable(): boolean {
						return true
					},
					isEnabled(): boolean {
						return true
					}
				},
				componentClass: GiftCardWelcomePage
			},
			{
				attrs: {
					data: giftCardRedeemData,
					headerTitle(): string {
						return "You got a Gift Card"
					},
					nextAction(showErrorDialog: boolean): Promise<boolean> {
						// next action not available for this page
						return Promise.resolve(true)
					},
					isSkipAvailable(): boolean {
						return false
					},
					isEnabled(): boolean {
						return true
					}
				},
				componentClass: GiftCardCredentialsPage
			},
		]

		const wizardBuilder = createWizardDialog(giftCardRedeemData, wizardPages, () => {
			let promise
			if (logins.isUserLoggedIn()) {
				promise = logins.logout(false)
			} else {
				promise = Promise.resolve()
			}
			return promise.then(() => {
				if (giftCardRedeemData.newAccountData) {
					// TODO Update user account to Premium, add credit
					m.route.set(`/login?loginWith=${giftCardRedeemData.newAccountData.mailAddress}`)
				} else {
					m.route.set(`/giftcard/#${giftCard._id}`)
				}
			})
		})
		const wizard = wizardBuilder.dialog
		const wizardAttrs = wizardBuilder.attrs
		//we only return the dialog so that it can be shown
		return wizard
	})
}
