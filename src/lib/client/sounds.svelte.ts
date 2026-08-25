// Client-only sound effects for the deal reveal. Samples are CC0 (Kenney's Casino Audio pack —
// see static/sounds/LICENSE.txt), not synthesized: a convincing card snap/slide is hard to fake
// with oscillators, and CC0 means nothing to license or attribute.
//
// Web Audio API, not <audio> elements: several short sounds can overlap or re-trigger rapidly
// (three flop cards landing in quick succession) without HTMLAudioElement's latency and
// can't-restart-mid-playback quirks.

const SOUND_FILES = {
	deal1: '/sounds/deal-1.ogg',
	deal2: '/sounds/deal-2.ogg',
	slide1: '/sounds/slide-1.ogg',
	slide2: '/sounds/slide-2.ogg',
	flip: '/sounds/flip.ogg',
	score: '/sounds/score.ogg'
} as const;

type SoundName = keyof typeof SOUND_FILES;

let ctx: AudioContext | null = null;
const buffers = new Map<SoundName, AudioBuffer>();
let loadStarted = false;

let mutedState = $state(false);
try {
	mutedState = localStorage.getItem('freeroll-muted') === 'true';
} catch {
	// ignore (private browsing, storage disabled, etc.)
}

/** Shared mute switch — a getter/setter object (not a bare variable) so components can read
 *  `.muted` reactively without importing a store API. */
export const soundState = {
	get muted() {
		return mutedState;
	},
	toggle(): void {
		mutedState = !mutedState;
		try {
			localStorage.setItem('freeroll-muted', String(mutedState));
		} catch {
			// ignore
		}
	}
};

function getContext(): AudioContext {
	if (!ctx) ctx = new AudioContext();
	// Browsers start contexts suspended until a user gesture resumes them — calling this from
	// inside the Deal click handler (see preloadSounds) is what satisfies that.
	if (ctx.state === 'suspended') void ctx.resume();
	return ctx;
}

/** Loads and decodes every sound file. Call once, from inside the Deal click handler, so the
 *  AudioContext gets created/resumed within the user gesture browsers require for audio. */
export async function preloadSounds(): Promise<void> {
	if (loadStarted) return;
	loadStarted = true;
	const context = getContext();
	await Promise.all(
		(Object.entries(SOUND_FILES) as [SoundName, string][]).map(async ([name, url]) => {
			const res = await fetch(url);
			const arrayBuffer = await res.arrayBuffer();
			buffers.set(name, await context.decodeAudioData(arrayBuffer));
		})
	);
}

export function playSound(name: SoundName, { gain = 1, rate = 1 }: { gain?: number; rate?: number } = {}): void {
	if (mutedState) return;
	const buffer = buffers.get(name);
	if (!buffer) return; // not loaded (or still loading, or failed) — never block the visuals for audio
	const context = getContext();
	const source = context.createBufferSource();
	source.buffer = buffer;
	source.playbackRate.value = rate;
	const gainNode = context.createGain();
	gainNode.gain.value = gain;
	source.connect(gainNode).connect(context.destination);
	source.start();
}
