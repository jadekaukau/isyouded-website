# DED. sign-up worker

The website is static (GitHub Pages), so it can't hold the Resend API key safely. The waitlist and DED.line forms post to this small Cloudflare Worker, which opts each person in to the right Resend Topic:

| Form on the site | `list` value | Resend Topic |
| --- | --- | --- |
| Join the waitlist | `waitlist` | **Waitlist** |
| Subscribe | `dedline` | **Subscribe to DED.line** |

If someone is already a contact (for example, on the waitlist and now subscribing), the worker opts them in to the second Topic rather than failing.

## Setup (about 10 minutes)

1. **Resend**
   - Create two Topics, `Waitlist` and `Subscribe to DED.line`, with **Defaults to: Opt-out**. With Opt-in, every contact gets that Topic's emails unless they unsubscribe, so waitlist people would get the newsletter and vice versa. This can't be changed after a Topic is created.
   - Copy each Topic's id.
   - Create an API key with full access (contacts need it). Copy it.
2. **Cloudflare** (free plan is fine)
   - In this `worker` folder, run `npx wrangler login`.
   - Paste the two Topic ids into `wrangler.toml`.
   - Run `npx wrangler secret put RESEND_API_KEY` and paste the key.
   - Run `npx wrangler deploy`. It prints a URL like `https://ded-signup.<you>.workers.dev`.
3. **Website**
   - Put that URL in `SIGNUP_ENDPOINT` at the top of `script.js` and push.

Until `SIGNUP_ENDPOINT` is set, the site falls back to the old behaviour: "Join the waitlist" opens the Google Form and "Subscribe" opens an email to hello@isyouded.com.

## Sending emails

When you send a Broadcast in Resend, pick the matching Topic (Waitlist or Subscribe to DED.line) so it only goes to people opted in to it.

## Testing

```bash
curl -X POST https://ded-signup.<you>.workers.dev \
  -H "Origin: https://isyouded.com" -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","first_name":"Test","list":"dedline"}'
```

`{"ok":true}` means the contact is in Resend. Run it again with `"list":"waitlist"` for the same email to check that an existing contact gets opted in to the second Topic. Failures are logged in the Cloudflare dashboard (Workers → ded-signup → Logs).

## Optional: a custom URL

Add a route such as `signup.isyouded.com` in the Cloudflare dashboard if your domain's DNS is on Cloudflare, and use that as `SIGNUP_ENDPOINT` instead.
