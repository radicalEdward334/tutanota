// @flow


import m from "mithril"
import type {User} from "../api/entities/sys/User"
import {downcast, neverNull} from "../api/common/utils/Utils"
import {Dialog, DialogType} from "../gui/base/Dialog"
import {reverse} from "../api/common/TutanotaConstants"
import {Icons} from "../gui/base/icons/Icons"
import type {TableLineAttrs} from "../gui/base/TableN"
import {TypeRef} from "../api/common/EntityFunctions"
import {formatDate} from "../misc/Formatter"
import {showProgressDialog} from "../gui/base/ProgressDialog"
import {worker} from "../api/main/WorkerClient"

export const GiftCardTypeRef: TypeRef<GiftCard> = downcast({}) // TODO delete

export const GiftCardPackage =
	Object.freeze
	      ({
		      Silver: "0",
		      Gold: "1",
		      Platinum: "2"
	      })
export type GiftCardPackageEnum = $Values<typeof GiftCardPackage>

export const GiftCardStatus =
	Object.freeze({
		PaymentPending: "0",
		Purchased: "1",
		Redeemed: "2"
	})
export type GiftCardStatusEnum = $Values<typeof GiftCardStatus>
export const ValueToGiftCardStatus: {} = reverse(GiftCardStatus)

export function createGiftCard(id: Id): GiftCard {
	return {
		_id: id,
		package: "0",
		status: "1",
		message: "You go a gift card",
		linkId: id,
		ordered: new Date(new Date().getDate() - 1000 * 60 * 60 * 24 * 31),
		redeemed: null
	}
}

export type GiftCard = {
	_id: Id,

	package: NumberString,
	status: NumberString,
	message: string,
	linkId: string,
	ordered: Date,
	redeemed: ?Date
}


export const giftCardSelectorLabels: $ReadOnlyMap<GiftCardPackageEnum, string> = new Map([
	[GiftCardPackage.Silver, "Silver"],
	[GiftCardPackage.Gold, "Gold"],
	[GiftCardPackage.Platinum, "Platinum"],
])

// TODO load from the server
export const GiftCardPackagePrices: $ReadOnlyMap<GiftCardPackageEnum, number> = new Map([
	[GiftCardPackage.Silver, 12],
	[GiftCardPackage.Gold, 24],
	[GiftCardPackage.Platinum, 48],
])

export const GiftCardStatusMessages: $ReadOnlyMap<GiftCardStatusEnum, string> = new Map([
	[GiftCardStatus.PaymentPending, "Payment Pending"],
	[GiftCardStatus.Purchased, "Paid"],
	[GiftCardStatus.Redeemed, "Redeemed"]
])

export function getGiftCardPrice(giftCardPackage: GiftCardPackageEnum): number {
	return neverNull(GiftCardPackagePrices.get(giftCardPackage))
}

export function getGiftCardStatusMessage(status: GiftCardStatusEnum): string {
	return neverNull(GiftCardStatusMessages.get(status))
}

export function loadGiftCardFromHash(hash: string): Promise<?GiftCard> {

	const id = hash.startsWith("#") ? hash.substr(1) : null;

	// TODO make worker call, get gift card from server

	if (!id || id === "invalid") {
		return Promise.resolve(null)
	}

	// TODO return locator.entityClient.load(GiftCardTypeRef, id)
	return Promise.resolve({
		_id: id,
		package: "0",
		status: "1",
		message: "You got a gift card",
		linkId: id,
		ordered: new Date(),
		redeemed: null
	})
}

export function redeemGiftCard(giftCard: GiftCard, user: User): Promise<boolean> {
	return showProgressDialog("loading_msg",
		worker.redeemGiftCard(user._id, giftCard._id)
	)
}


// TODO
class GiftCardPresentation implements MComponent<GiftCard> {
	view(vnode: Vnode<GiftCard>): Children {
		const giftCard = vnode.attrs
		return m(".present-giftcard-page.pt", [
			m("span", {
				style: {
					// fontSize: "0.5rem"
				}
			}, JSON.stringify(giftCard, null, 4))
		])
	}
}

export function showGiftCardPresentationDialog(giftCard: GiftCard): void {
	Dialog.info(() => "ur giftcard", () => m(GiftCardPresentation, giftCard), "ok_action", DialogType.EditLarger)
}

export function loadGiftCards(): Promise<GiftCard[]> {
	return Promise.resolve([
		{
			_id: "420",
			package: "0",
			status: "1",
			message: "You got a gift card",
			linkId: "420",
			ordered: new Date(),
			redeemed: null
		}
	])
}

export function createGiftCardTableLine(giftCard: GiftCard): TableLineAttrs {
	return {
		cells: [formatDate(giftCard.ordered), "TODO"],
		actionButtonAttrs: {
			label: () => "view",
			click: () => showGiftCardPresentationDialog(giftCard),
			icon: () => Icons.Eye
		}
	}
}