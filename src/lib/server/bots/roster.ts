import { ROSTER_SIZE } from './constants';

// Casual, generic handles — deliberately no underscores (matches NICKNAME_RE in
// auth/nickname.ts, and reads more like a real signup than name_name would) and no digits in
// the pool itself, so every generated nickname is <name><two-digit number>, e.g. "benny27".
const NAME_POOL = [
	'bobby', 'trish', 'deano', 'marsy', 'kiki', 'benny', 'waffle', 'rocco', 'dizzy', 'fergie',
	'pauly', 'nan', 'tubbs', 'chels', 'ozzy', 'minny', 'skeet', 'lola', 'buddy', 'ginge',
	'moose', 'pinky', 'sully', 'tazzy', 'wynn', 'dutch', 'coop', 'bex', 'ramona', 'otto'
];

// Fixed seed, not Math.random(): the roster has to come out as the *same* nicknames on every
// call, or re-running ensureBotAccountsExist would mint a second batch alongside the first
// instead of recognizing them as already-seeded.
const SEED = 1337;

function mulberry32(seed: number): () => number {
	return function () {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** The fixed list of bot nicknames — always <name><two-digit number>, drawn from NAME_POOL
 *  with a seeded RNG so this list is identical across every call, deploy, and re-seed. */
export function botRoster(): string[] {
	const rand = mulberry32(SEED);
	const used = new Set<string>();
	const nicknames: string[] = [];

	while (nicknames.length < ROSTER_SIZE) {
		const name = NAME_POOL[Math.floor(rand() * NAME_POOL.length)];
		const number = 10 + Math.floor(rand() * 90); // always two digits: 10-99
		const nickname = `${name}${number}`;
		if (used.has(nickname)) continue;
		used.add(nickname);
		nicknames.push(nickname);
	}

	return nicknames;
}
