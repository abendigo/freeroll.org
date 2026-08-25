<script lang="ts">
	interface Props {
		magicLinkUrl: string;
		expiryMinutes: number;
	}
	let { magicLinkUrl, expiryMinutes }: Props = $props();
</script>

<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Your Freeroll sign-in link</title>
	</head>
	<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #18181b;">
		<h1 style="font-size: 22px; font-weight: 800; margin-bottom: 8px;">freeroll</h1>
		<p>Tap below to sign in. This link works once and expires in {expiryMinutes} minutes.</p>
		<p style="margin: 32px 0;">
			<a
				href={magicLinkUrl}
				style="background: #0c0c0d; color: #fff; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; display: inline-block;"
			>
				Sign in to Freeroll
			</a>
		</p>
		<p style="color: #6b7079; font-size: 13px;">
			If the button doesn't work, copy this link into your browser:<br />
			<span style="word-break: break-all;">{magicLinkUrl}</span>
		</p>
		<p style="color: #6b7079; font-size: 13px;">Didn't request this? You can safely ignore this email — no account will be created.</p>
		<hr style="border: none; border-top: 1px solid #e4e4e7; margin: 32px 0;" />
		<p style="color: #a1a1aa; font-size: 12px;">freeroll.org &middot; a poker-themed daily luck game</p>
	</body>
</html>
