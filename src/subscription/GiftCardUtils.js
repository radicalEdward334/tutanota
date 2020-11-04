// @flow


import type {PlanPrices} from "../api/entities/sys/PlanPrices"
import {neverNull} from "../api/common/utils/Utils"
import {reverse} from "../api/common/TutanotaConstants"

export const GiftCardDuration =
	Object.freeze
	      ({
		      OneYear: "0",
		      ThreeYears: "1",
		      FiveYears: "2"
	      })


export type GiftCard = {
	_id: Id,
	duration: NumberString
}


export type GiftCardDurationEnum = $Values<typeof GiftCardDuration>
export const ValueToGiftCardDuration: {} = reverse(GiftCardDuration)

export const giftCardSelectorLabels: $ReadOnlyMap<GiftCardDurationEnum, string> = new Map([
	[GiftCardDuration.OneYear, "One Year"],
	[GiftCardDuration.ThreeYears, "Three Years"],
	[GiftCardDuration.FiveYears, "Five Years"],
])

export const giftCardDurationsInYears: $ReadOnlyMap<GiftCardDurationEnum, number> = new Map([
	[GiftCardDuration.OneYear, 1],
	[GiftCardDuration.ThreeYears, 3],
	[GiftCardDuration.FiveYears, 5],
])

export function getGiftCardPrice(planPrices: PlanPrices, duration: GiftCardDurationEnum): number {
	return Number(planPrices.monthlyPrice) * 10 * neverNull(giftCardDurationsInYears.get(duration))
}

export function getGiftCardIdFromHash(hash: string): ?Id {
	return hash.startsWith("#") ? hash.substr(1) : null;
}

export function loadGiftCard(giftCardId: Id): Promise<GiftCard> {
	return Promise.resolve({
		_id: giftCardId,
		duration: "0"
	})
}