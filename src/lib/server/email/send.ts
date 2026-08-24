import { Resend } from 'resend';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';

export interface SendEmailOptions {
	to: string;
	subject: string;
	html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
	if (!env.RESEND_API_KEY) {
		if (!dev) throw new Error('RESEND_API_KEY is not set');
		// No key configured yet in local dev — print the email instead of failing outright,
		// so the magic-link flow is testable end-to-end before Resend is wired up for real.
		console.log(`\n--- email (dev, not actually sent) ---\nTo: ${to}\nSubject: ${subject}\n${html}\n---\n`);
		return;
	}

	const resend = new Resend(env.RESEND_API_KEY);
	await resend.emails.send({ from: env.FROM_ADDRESS || 'Freeroll <hello@freeroll.org>', to, subject, html });
}
