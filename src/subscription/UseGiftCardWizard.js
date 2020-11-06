//@flow

import m from "mithril"
import stream from "mithril/stream/stream.js"
import type {GiftCard} from "./GiftCardUtils"
import {redeemGiftCard} from "./GiftCardUtils"
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
	giftCard: GiftCard
}

type GiftCardRedeemAttrs = WizardPageAttrs<GiftCardRedeemData>

class GiftCardWelcomePage implements WizardPageN<GiftCardRedeemData> {

	view(vnode: Vnode<GiftCardRedeemAttrs>): Children {
		const a = vnode.attrs

		const nextPage = (method: GetCredentialsMethod) => {
			a.data.credentialsMethod = method
			emitWizardEvent(vnode.dom, WizardEventType.SHOWNEXTPAGE)
		}

		return m(".flex-v-center", [
			m("", a.data.giftCard.message),
			m(ButtonN, {
				label: () => "Use existing account",
				click: () => nextPage("login"),
				type: ButtonType.Login
			}),
			m(ButtonN, {
				label: () => "Create account",
				click: () => nextPage("signup"),
				type: ButtonType.Login
			})
		])
	}
}

class GiftCardCredentialsPage implements WizardPageN<GiftCardRedeemData> {

	_domElement: HTMLElement

	oncreate(vnode: Vnode<GiftCardRedeemAttrs>) {
		this._domElement = vnode.dom
	}

	view(vnode: Vnode<GiftCardRedeemAttrs>): Children {
		const data = vnode.attrs.data
		switch (data.credentialsMethod) {
			case "login":
				return this._renderLoginPage(data)
			case "signup":
				return this._renderSignupPage(data)
		}
	}

	_renderLoginPage(data: GiftCardRedeemData): Children {
		const loginFormAttrs = {
			onSubmit: (mailAddress, password) => {
				const loginPromise =
					logins.createSession(mailAddress, password, client.getIdentifier(), false, false)
					      .then(credentials => {
						      console.log(logins.getUserController())
						      // TODO if a business account or a nonGlobalAdmin then deny
						      emitWizardEvent(this._domElement, WizardEventType.SHOWNEXTPAGE)
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
					emitWizardEvent(this._domElement, WizardEventType.SHOWNEXTPAGE)

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

	_renderSignupPage(data: GiftCardRedeemData): Children {
		const signupFormAttrs: SignupFormAttrs = {
			submitHandler: newAccountData => {
				console.log("new account data: ", newAccountData)
				if (newAccountData) {
					data.newAccountData(newAccountData)
				}
				if (data.newAccountData()) {
					emitWizardEvent(this._domElement, WizardEventType.SHOWNEXTPAGE)
				}
			},
			readonly: data.newAccountData() != null,
			prefilledMailAddress: data.newAccountData() && neverNull(data.newAccountData()).mailAddress || undefined,
			isBusinessUse: () => false,
			isPaidSubscription: () => false,
			campaign: () => null
		}

		return m(SignupForm, signupFormAttrs)
	}
}

class RedeemGiftCardPage implements WizardPageN<GiftCardRedeemData> {
	view(vnode: Vnode<GiftCardRedeemAttrs>): Children {
		const data = vnode.attrs.data

		const confirmButtonAttrs = {
			label: () => "Redeem gift card", // Translate
			click: () => {
				redeemGiftCard(data.giftCard, logins.getUserController().user)
			}
		}

		return m(ButtonN, confirmButtonAttrs)
	}
}


export function loadUseGiftCardWizard(giftCard: GiftCard): Promise<Dialog> {
	return loadUpgradePrices().then(prices => {

		const giftCardRedeemData: GiftCardRedeemData = {
			newAccountData: stream(null),
			mailAddress: stream(""),
			password: stream(""),
			credentialsMethod: "signup",
			giftCard: giftCard
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
					headerTitle: () => giftCardRedeemData.credentialsMethod === "signup" ? "Create account" : "Select account", // Translate
					nextAction: (showErrorDialog: boolean) => Promise.resolve(true),
					isSkipAvailable: () => false,
					isEnabled: () => true
				},
				componentClass: GiftCardCredentialsPage
			},
			{
				attrs: {
					data: giftCardRedeemData,
					headerTitle: () => "Confirm", // Translate
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
