// Universal (client+server-safe) counterpart to the suit-symbol mapping in Card.svelte — kept
// separate rather than imported from there because Card.svelte also carries flip-animation state
// this doesn't need, and because $lib/server/game/cards.ts (which owns the canonical `Card`/
// `cardCode` types) can't be imported from a plain .svelte file that also renders on the client.
const SUIT_SYMBOL: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };

/** e.g. "As" -> { rank: "A", suit: "♠", red: false } — for rendering a compact card code as a
 *  static (non-animated) mini-card, as on the homepage hero and the /u/[username] history table. */
export function parseCardCode(code: string): { rank: string; suit: string; red: boolean } {
	const suitChar = code.slice(-1);
	return {
		rank: code.slice(0, -1),
		suit: SUIT_SYMBOL[suitChar] ?? suitChar,
		red: suitChar === 'h' || suitChar === 'd'
	};
}
