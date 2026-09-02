// Universal (client+server-safe) badge catalog — same split as cards.ts: pure catalog and
// classification logic lives here so both the server (award logic, in
// $lib/server/game/badges.ts) and the client (the profile page's badge grid) can import it
// without pulling in $lib/server/db.ts, which a .svelte file can't import at all (and which
// would eagerly construct a real libsql client at module load even if it could).

export type HoleCardBadgeCategory = 'pair' | 'suited' | 'offsuit';

export interface HoleCardBadge {
	id: string;
	name: string;
	notation: string;
	category: HoleCardBadgeCategory;
}

// High to low. A standalone literal (not derived from server/game/cards.ts's numeric rank map)
// since this module can't depend on anything under $lib/server/ — but these are plain card
// ranks, about as unlikely to drift as constants get.
const RANK_ORDER = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

// Well-established poker slang for a handful of the 169 starting hands — deliberately a short,
// conservative list (only names confident enough not to need a citation) rather than an attempt
// to name all 169. Every hand without an entry here just displays its own notation as its name
// (see buildHoleCardBadges). Kept as an id->name overlay, not a parallel structure, so a hand
// with a meme name occupies exactly one badge slot, not two.
const MEME_NAMES: Record<string, string> = {
	AA: 'Pocket Rockets',
	KK: 'Cowboys',
	QQ: 'Ladies',
	JJ: 'Fish Hooks',
	AKs: 'Anna Kournikova', // looks great, rarely wins — the tennis pun, not Big Slick's twin
	AKo: 'Big Slick',
	'72o': 'The Hammer',
	T2o: 'Doyle Brunson' // won back-to-back WSOP Main Events (1976/77) holding this
};

/** All 169 starting-hand badges: 13 pairs + 78 suited + 78 offsuit combos, keyed by standard
 *  notation ("AA", "AKs", "72o", ...). Built once from RANK_ORDER rather than hand-listed, so
 *  there's exactly one place that can get a hand wrong. */
function buildHoleCardBadges(): Record<string, HoleCardBadge> {
	const badges: Record<string, HoleCardBadge> = {};

	for (const r of RANK_ORDER) {
		const id = `${r}${r}`;
		badges[id] = { id, name: MEME_NAMES[id] ?? id, notation: id, category: 'pair' };
	}

	for (let i = 0; i < RANK_ORDER.length; i++) {
		for (let j = i + 1; j < RANK_ORDER.length; j++) {
			const hi = RANK_ORDER[i];
			const lo = RANK_ORDER[j];
			for (const [suffix, category] of [
				['s', 'suited'],
				['o', 'offsuit']
			] as const) {
				const id = `${hi}${lo}${suffix}`;
				badges[id] = { id, name: MEME_NAMES[id] ?? id, notation: id, category };
			}
		}
	}

	return badges;
}

// Don't rely on Object.keys/values(HOLE_CARD_BADGES) coming back in RANK_ORDER/insertion order:
// JS hoists any key that looks like a plain non-negative integer ("22", "33", ..., "99" — the
// digit-rank pairs) to the front, sorted numerically, ahead of every other key. Direct lookups
// (HOLE_CARD_BADGES['AA']) and set membership (holeCardBadgesByCategory + .has()) are unaffected
// either way — this only matters if something later wants a specifically-ordered listing.
export const HOLE_CARD_BADGES: Record<string, HoleCardBadge> = buildHoleCardBadges();

export function holeCardBadgesByCategory(category: HoleCardBadgeCategory): HoleCardBadge[] {
	return Object.values(HOLE_CARD_BADGES).filter((b) => b.category === category);
}

/** 13x13 grid of badge ids in the standard preflop-chart layout: diagonal = pairs, upper-right
 *  triangle = suited, lower-left = offsuit. Both axes run RANK_ORDER (A..2), matching every
 *  hold'em starting-hand chart a poker player has already seen. */
export function preflopGridRows(): string[][] {
	return RANK_ORDER.map((rowRank, i) =>
		RANK_ORDER.map((colRank, j) => {
			if (i === j) return `${rowRank}${rowRank}`;
			if (i < j) return `${rowRank}${colRank}s`;
			return `${colRank}${rowRank}o`;
		})
	);
}

export type MetaBadgeId = 'pair-collector' | 'suited-collector' | 'offsuit-collector';

export interface MetaBadge {
	id: MetaBadgeId;
	name: string;
	description: string;
	category: HoleCardBadgeCategory;
}

// Placeholder names — real naming pass deferred, per discussion.
export const META_BADGES: Record<MetaBadgeId, MetaBadge> = {
	'pair-collector': {
		id: 'pair-collector',
		name: 'Pair Collector',
		description: 'Get dealt all 13 pocket pairs.',
		category: 'pair'
	},
	'suited-collector': {
		id: 'suited-collector',
		name: 'Suited Collector',
		description: 'Get dealt all 78 suited starting hands.',
		category: 'suited'
	},
	'offsuit-collector': {
		id: 'offsuit-collector',
		name: 'Offsuit Collector',
		description: 'Get dealt all 78 offsuit starting hands.',
		category: 'offsuit'
	}
};

/** Classifies a dealt hole-card pair (e.g. ["Ac", "Kd"]) down to its badge id ("AKo"). Ranks are
 *  read straight off the card codes rather than parsed into a Card — the two-char codes already
 *  carry everything this needs. */
export function holeCardBadgeId(holeCards: [string, string]): string {
	const [a, b] = holeCards.map((code) => ({ rank: code.slice(0, -1), suit: code.slice(-1) }));

	if (a.rank === b.rank) return `${a.rank}${a.rank}`;

	const [hi, lo] = RANK_ORDER.indexOf(a.rank) < RANK_ORDER.indexOf(b.rank) ? [a, b] : [b, a];
	return `${hi.rank}${lo.rank}${a.suit === b.suit ? 's' : 'o'}`;
}
