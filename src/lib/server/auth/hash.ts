import { createHmac } from 'node:crypto';

// A plain hash of an email or IP is trivially reversible — the input space is small/guessable,
// so an attacker just precomputes a table of hashes for common addresses. HMAC with a secret
// key is what actually makes this one-way: without HASH_SECRET, a database-only leak can't be
// reversed back to the plaintext. (It doesn't protect against a full compromise where the
// attacker also has the app's secrets — worth being honest about that, not overselling it.)
const secret = typeof process !== 'undefined' ? process.env.HASH_SECRET : undefined;

if (!secret) {
	if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
		console.warn('HASH_SECRET is not set — using an insecure local-dev-only fallback. Never use this in production.');
	}
}

const effectiveSecret = secret || 'insecure-local-dev-only-hash-secret-do-not-use-in-production';

export function hmacHex(value: string): string {
	return createHmac('sha256', effectiveSecret).update(value).digest('hex');
}
