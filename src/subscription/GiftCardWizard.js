// @flow

import m from "mithril"
import stream from "mithril/stream/stream.js"
import type {Dialog} from "../gui/base/Dialog"
import type {WizardPageAttrs, WizardPageN} from "../gui/base/WizardDialogN"
import {createWizardDialog, emitWizardEvent, WizardEventType} from "../gui/base/WizardDialogN"
import {SubscriptionSelector} from "./SubscriptionSelector"
import {getUpgradePrice, SubscriptionType, UpgradePriceType, UpgradeType} from "./SubscriptionUtils"
import {ButtonN, ButtonType} from "../gui/base/ButtonN"
import type {PlanPrices} from "../api/entities/sys/PlanPrices"
import type {SubscriptionOptions, SubscriptionTypeEnum} from "./SubscriptionUtils"
import {createPlanPrices} from "../api/entities/sys/PlanPrices"
import {loadUpgradePrices} from "./UpgradeSubscriptionWizard"
import {GiftCardConfirmationPage, GiftCardPresentationPage, SelectGiftCardTypePage} from "./GiftCardWizardPages"
import {load} from "../api/main/Entity"
import {CustomerTypeRef} from "../api/entities/sys/Customer"
import {neverNull} from "../api/common/utils/Utils"
import {logins} from "../api/main/LoginController"
import {CustomerInfoTypeRef} from "../api/entities/sys/CustomerInfo"
import {AccountingInfoTypeRef} from "../api/entities/sys/AccountingInfo"
import type {AccountingInfo} from "../api/entities/sys/AccountingInfo"
import type {UpgradePriceServiceReturn} from "../api/entities/sys/UpgradePriceServiceReturn"
import type {GiftCardDurationEnum} from "./GiftCardUtils"
import {GiftCardDuration} from "./GiftCardUtils"

export type CreateGiftCardData = {|
	options: SubscriptionOptions,
	premiumPrices: PlanPrices;
	giftCardLength: GiftCardDurationEnum;

	invoiceAddress: string;
	invoiceCountry: string;
	invoiceName: string;
	paymentMethod: ?NumberString;
|}


function loadAccountingInfo(): Promise<AccountingInfo> {
	const info = load(CustomerTypeRef, neverNull(logins.getUserController().user.customer))
		.then(customer => load(CustomerInfoTypeRef, customer.customerInfo))
		.then(customerInfo => load(AccountingInfoTypeRef, customerInfo.accountingInfo))

	return info
}

export function showPurchaseGiftCardWizard(): Promise<Dialog> {
	return loadUpgradePrices().then(prices => {
		return loadAccountingInfo().then((accountingInfo: AccountingInfo) => {
			const data: CreateGiftCardData = {
				options: {
					businessUse: stream(false),
					paymentInterval: stream(1)
				},
				premiumPrices: prices.premiumPrices,
				giftCardLength: GiftCardDuration.OneYear,

				invoiceAddress: accountingInfo.invoiceAddress,
				invoiceCountry: accountingInfo.invoiceCountry || "",
				invoiceName: accountingInfo.invoiceName,
				paymentMethod: accountingInfo.paymentMethod
			};

			const wizardPages = [
				{
					attrs: {
						data: data,
						headerTitle(): string {
							return "Select Type"
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
					componentClass: SelectGiftCardTypePage
				},
				{
					attrs: {
						data: data,
						headerTitle(): string {
							return "Confirm Gift Card"
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
					componentClass: GiftCardConfirmationPage
				},
				{
					attrs: {
						data: data,
						headerTitle(): string {
							return "Your Gift Card"
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
					componentClass: GiftCardPresentationPage
				}
			]

			return createWizardDialog(data, wizardPages, () => {
				return Promise.resolve()
			}).dialog.show()
		})
	})
}