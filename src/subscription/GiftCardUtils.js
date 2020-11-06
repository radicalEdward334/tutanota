// @flow


import {reverse} from "../api/common/TutanotaConstants"
import type {User} from "../api/entities/sys/User"
import {neverNull} from "../api/common/utils/Utils"

export const GiftCardPackage =
	Object.freeze
	      ({
		      Silver: "0",
		      Gold: "1",
		      Platinum: "2"
	      })

export function createGiftCard(id: Id): GiftCard {
	return {
		_id: id,
		package: "0",
		message: "You go a gift card",
		linkId: id,
		purchased: new Date(new Date().getDate() - 1000 * 60 * 60 * 24 * 31),
		redeemed: null
	}
}

export type GiftCard = {
	_id: Id,

	package: NumberString,
	message: string,
	linkId: string,
	purchased: Date,
	redeemed: ?Date
}

export type GiftCardPackageEnum = $Values<typeof GiftCardPackage>

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

export function getGiftCardPrice(giftCardPackage: GiftCardPackageEnum): number {
	return neverNull(GiftCardPackagePrices.get(giftCardPackage))
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
		message: "You got a gift card",
		linkId: id,
		purchased: new Date(),
		redeemed: null
	})
}

export function redeemGiftCard(giftCard: GiftCard, user: User) {
	// TODO call giftcardredeemservice
}