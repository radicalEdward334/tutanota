//@flow

import m from "mithril"
import stream from "mithril/stream/stream.js"
import type {GiftCard} from "./GiftCardUtils"
import {giftCardDurationsInYears, ValueToGiftCardDuration} from "./GiftCardUtils"
import {neverNull, noOp} from "../api/common/utils/Utils"
import type {WizardPageAttrs, WizardPageN} from "../gui/base/WizardDialogN"
import {createWizardDialog, emitWizardEvent, WizardEventType} from "../gui/base/WizardDialogN"
import {logins} from "../api/main/LoginController"
import type {NewAccountData} from "./UpgradeSubscriptionWizard"
import {loadUpgradePrices} from "./UpgradeSubscriptionWizard"
import {Dialog} from "../gui/base/Dialog"
import {LoginForm} from "../login/LoginForm"
import type {CredentialsSelectorAttrs} from "../login/CredentialsSelector"
import {CredentialsSelector} from "../login/CredentialsSelector"
import {deviceConfig} from "../misc/DeviceConfig"
import {showProgressDialog} from "../gui/base/ProgressDialog"
import {worker} from "../api/main/WorkerClient"
import {client} from "../misc/ClientDetector"
import {ButtonN, ButtonType} from "../gui/base/ButtonN"
import type {SignupFormAttrs} from "../api/main/SignupForm"
import {SignupForm} from "../api/main/SignupForm"

type GetCredentialsMethod = "login" | "signup"

type GiftCardRedeemData = {
	mailAddress: Stream<string>,
	password: Stream<string>,
	credentialsMethod: GetCredentialsMethod,
	newAccountData: Stream<?NewAccountData>,
}

class GiftCardWelcomePage implements WizardPageN<GiftCardRedeemData> {
	view(vnode: Vnode<WizardPageAttrs<GiftCardRedeemData>>): Children {
		const a = vnode.attrs

		const nextPage = (method: GetCredentialsMethod) => {
			a.data.credentialsMethod = method
			emitWizardEvent(vnode.dom, WizardEventType.SHOWNEXTPAGE)
		}

		return m(".flex-v-center", [
			m(ButtonN, {
				label: () => "Use existing account",
				click: () => nextPage("login"),
				type: ButtonType.Login
			}),
			m(".flex-space-between.mt-l", [m(".hr"), "or", m(".hr")]),
			m(ButtonN, {
				label: () => "Create account",
				click: () => nextPage("signup"),
				type: ButtonType.Login
			})
		])
	}
}

class GiftCardCredentialsPage implements WizardPageN<GiftCardRedeemData> {
	view(vnode: Vnode<WizardPageAttrs<GiftCardRedeemData>>): Children {

		const data = vnode.attrs.data

		switch (data.credentialsMethod) {
			case "login":
				return this.renderLoginPage(data, vnode.dom)
			case "signup":
				return this.renderSignupPage(data, vnode.dom)
		}
	}

	renderLoginPage(data: GiftCardRedeemData, dom: HTMLElement): Children {
		const loginFormAttrs = {
			onSubmit: (mailAddress, password) => {
				const loginPromise =
					logins.createSession(mailAddress, password, client.getIdentifier(), false, false)
					      .then(_ => {
						      console.log(logins.getUserController())
						      emitWizardEvent(dom, WizardEventType.SHOWNEXTPAGE)
					      })
					      .catch(e => {
						      // TODO Error handling
						      Dialog.error(() => "Error logging in")
					      })
				// If they try to login with a mail address that is stored, we want to swap out the old session with a new one
				showProgressDialog("pleaseWait_msg", loginPromise)
			},
			mailAddress: data.mailAddress,
			password: data.password,
		}

		const credentials = deviceConfig.getAllInternal()
		const onCredentialsSelected = credentials => {
			showProgressDialog("pleaseWait_msg", worker.initialized.then(() => {
				logins.resumeSession(credentials).then(() => {
					console.log(logins.getUserController())
				}).catch(e => {
					// TODO handle errors better?
					Dialog.error("loginFailed_msg")
				})
			}))
		}

		const credentialsSelectorAttrs: CredentialsSelectorAttrs = {
			credentials: () => credentials,
			isDeleteCredentials: stream(false),
			onCredentialsSelected,
			onCredentialsDelete: noOp
		}

		return [
			m(LoginForm, loginFormAttrs),
			credentials.length > 0
				? [
					m(".flex-space-between.mt-l", [m(".hr"), "or", m(".hr")]), // TODO styling
					m(CredentialsSelector, credentialsSelectorAttrs)
				]
				: null
		]
	}

	renderSignupPage(data: GiftCardRedeemData, dom: HTMLElement): Children {
		const signupFormAttrs: SignupFormAttrs = {
			submitHandler: newAccountData => {
				console.log("new account data: ", newAccountData)
				if (newAccountData) {
					// TODO WHY DOES NOT THIS WORKING?
					emitWizardEvent(dom, WizardEventType.SHOWNEXTPAGE)
				}
			},
			readonly: false,
			isBusinessUse: () => false,
			isPaidSubscription: () => false,
			campaign: () => null
		}

		return m(SignupForm, signupFormAttrs)
	}
}

class RedeemGiftCardPage implements WizardPageN<GiftCardRedeemData> {
	view(vnode: Vnode<WizardPageAttrs<GiftCardRedeemData>>): Children {
		return "Implement Me"
	}
}


export function loadUseGiftCardWizard(giftCard: GiftCard): Promise<Dialog> {
	const years = neverNull(giftCardDurationsInYears.get(ValueToGiftCardDuration[giftCard.duration]))
	return loadUpgradePrices().then(prices => {

		const giftCardRedeemData: GiftCardRedeemData = {
			newAccountData: stream(null),
			mailAddress: stream(""),
			password: stream(""),
			credentialsMethod: "signup"
		}


		const wizardPages = [
			{
				attrs: {
					data: giftCardRedeemData,
					headerTitle: () => "You got a Gift Card :-)",
					nextAction: (_) => Promise.resolve(true),
					isSkipAvailable: () => false,
					isEnabled: () => true
				},
				componentClass: GiftCardWelcomePage
			},
			{
				attrs: {
					data: giftCardRedeemData,
					headerTitle: () => giftCardRedeemData.credentialsMethod === "signup" ? "Create account" : "Select account",
					nextAction: (showErrorDialog: boolean) => Promise.resolve(true),
					isSkipAvailable: () => false,
					isEnabled: () => true
				},
				componentClass: GiftCardCredentialsPage
			},
			{
				attrs: {
					data: giftCardRedeemData,
					headerTitle: () => "Confirm",
					nextAction: (_) => Promise.resolve(true),
					isSkipAvailable: () => false,
					isEnabled: () => true
				},
				componentClass: RedeemGiftCardPage
			}
		]

		const wizardBuilder = createWizardDialog(giftCardRedeemData, wizardPages, () => {
			return Promise.resolve().tap(() => { m.route.set("/login") })
		})
		const wizard = wizardBuilder.dialog
		const wizardAttrs = wizardBuilder.attrs
		//we only return the dialog so that it can be shown
		return wizard
	})
}
