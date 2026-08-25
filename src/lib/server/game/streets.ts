import type { Card } from './cards';

export type Street = 'preflop' | 'flop' | 'turn' | 'river';

export const STREETS: Street[] = ['preflop', 'flop', 'turn', 'river'];

/** Which cards are visible at a given street — hole cards are always visible, `board` grows. */
export function cardsAtStreet(hole: Card[], board: Card[], street: Street): Card[] {
	switch (street) {
		case 'preflop':
			return hole;
		case 'flop':
			return [...hole, ...board.slice(0, 3)];
		case 'turn':
			return [...hole, ...board.slice(0, 4)];
		case 'river':
			return [...hole, ...board.slice(0, 5)];
	}
}
