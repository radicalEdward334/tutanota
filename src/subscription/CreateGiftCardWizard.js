// @flow

import m from "mithril"
import {Dialog, DialogType} from "../gui/base/Dialog"
import {createWizardDialog} from "../gui/base/WizardDialogN"
import {loadUpgradePrices} from "./UpgradeSubscriptionWizard"
import {GiftCardConfirmationPage, GiftCardCreationPage} from "./CreateGiftCardWizardPages"
import {load} from "../api/main/Entity"
import {CustomerTypeRef} from "../api/entities/sys/Customer"
import {neverNull} from "../api/common/utils/Utils"
import {logins} from "../api/main/LoginController"
import {CustomerInfoTypeRef} from "../api/entities/sys/CustomerInfo"
import type {AccountingInfo} from "../api/entities/sys/AccountingInfo"
import {AccountingInfoTypeRef} from "../api/entities/sys/AccountingInfo"
import type {GiftCard, GiftCardPackageEnum} from "./GiftCardUtils"
import {GiftCardPackage} from "./GiftCardUtils"
import {worker} from "../api/main/WorkerClient"
import {showProgressDialog} from "../gui/base/ProgressDialog"

export type CreateGiftCardData = {
	package: GiftCardPackageEnum;
	message: string;
	giftCard: ?GiftCard,

	invoiceAddress: string;
	invoiceCountry: string;
	invoiceName: string;
	paymentMethod: ?NumberString;
}


// TODO maybe this is already written somewhere else?
function loadAccountingInfo(): Promise<AccountingInfo> {
	const info = load(CustomerTypeRef, neverNull(logins.getUserController().user.customer))
		.then(customer => load(CustomerInfoTypeRef, customer.customerInfo))
		.then(customerInfo => load(AccountingInfoTypeRef, customerInfo.accountingInfo))

	return info
}

export function showPurchaseGiftCardWizard(): Promise<?GiftCard> {
	return loadUpgradePrices().then(prices => {
		return loadAccountingInfo().then((accountingInfo: AccountingInfo) => {
			const data: CreateGiftCardData = {
				package: GiftCardPackage.Gold,
				message: "Hey, I bought you a gift card!<br />LG,<br />{name}", // Translate defaultGiftCardMessage_msg
				giftCard: null,
				invoiceAddress: accountingInfo.invoiceAddress,
				invoiceCountry: accountingInfo.invoiceCountry || "",
				invoiceName: accountingInfo.invoiceName,
				paymentMethod: accountingInfo.paymentMethod
			};

			const wizardPages = [
				{
					attrs: {
						data: data,
						headerTitle: () => "Select type", // Translate
						nextAction: (showErrorDialog: boolean) => Promise.resolve(true),
						isSkipAvailable: () => false,
						isEnabled: () => true,
					},
					componentClass: GiftCardCreationPage
				},
				{
					attrs: {
						data: data,
						headerTitle: () => "Confirm gift card", // Translate
						nextAction: (_) => {
							return showProgressDialog("loading_msg",
								worker.generateGiftCard(data.message, data.package)
								      .then(giftCard => {
									      data.giftCard = giftCard
									      return giftCard
										      ? Promise.resolve(true)
										      : Dialog.error(() => "Error").then(() => false)
								      }))
						},
						isSkipAvailable: () => false,
						isEnabled: () => true
					},
					componentClass: GiftCardConfirmationPage
				},

			]

			const wizardBuilder = createWizardDialog(data, wizardPages, () => {
				return Promise.resolve()
			})

			wizardBuilder.dialog.show()
			return wizardBuilder.promise.then(() => data.giftCard)
		})
	})
}
