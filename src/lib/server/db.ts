import { createClient, type Client } from '@libsql/client';
import { Kysely, type Generated } from 'kysely';
import { LibsqlDialect } from '@libsql/kysely-libsql';

// Deliberately plain process.env, not $env/dynamic/private: this module is also imported by
// migrate.ts, which runs standalone via `tsx` (npm run migrate) outside of SvelteKit/Vite,
// where the $env virtual module doesn't resolve. process.env works both there and under
// `vite dev`. Revisit if/when this deploys to a runtime where process.env isn't populated.
const env = typeof process !== 'undefined' ? process.env : ({} as Record<string, string | undefined>);

export interface UsersTable {
	id: Generated<number>;
	email_hash: string;
	nickname: string | null;
	created_at: Generated<string>;
}

export interface MagicLinkTokensTable {
	token: string;
	user_id: number;
	expires_at: string;
	used_at: string | null;
	created_at: Generated<string>;
}

export interface SessionsTable {
	id: string;
	user_id: number;
	expires_at: string;
}

export interface LoginAttemptsTable {
	id: Generated<number>;
	key_type: 'email' | 'ip';
	key_hash: string;
	attempted_at: Generated<string>;
}

export interface MigrationsTable {
	id: Generated<number>;
	name: string;
	applied_at: Generated<string>;
}

export interface AppDatabase {
	users: UsersTable;
	magic_link_tokens: MagicLinkTokensTable;
	sessions: SessionsTable;
	login_attempts: LoginAttemptsTable;
	migrations: MigrationsTable;
}

// Local dev talks to a plain SQLite file on disk (no Turso account needed to develop).
// Production points TURSO_DATABASE_URL at a real libsql://... database plus TURSO_AUTH_TOKEN.
export const client: Client = createClient({
	url: env.TURSO_DATABASE_URL || 'file:./data/app.db',
	authToken: env.TURSO_AUTH_TOKEN || undefined
});

export const db = new Kysely<AppDatabase>({
	dialect: new LibsqlDialect({ client })
});
