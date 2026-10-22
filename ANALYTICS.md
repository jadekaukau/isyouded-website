# Website tracking (Google Analytics 4)

Property: **G-5WCCEEQ6JL**. The Google tag is on every page; the events below are sent from `script.js`.

| Event | When it fires | Details sent |
|---|---|---|
| `sign_up` | Someone **submits** the waitlist or newsletter form | `method`: `waitlist` or `dedline` |
| `signup_click` | Someone clicks a "Join the waitlist" or "Subscribe to newsletter" button | `list`, `location` (menu, about, cta, answer…), `page` |
| `signup_abandon` | Someone opens the waitlist or newsletter form but closes it without signing up | `list` |
| `partner_enquiry` | Click on the partners email link on the Partners page | `location`, `page` |
| `links_click` | A button on isyouded.com/links (the Instagram bio page) is tapped | `link`: website, faq, partners, logo |
| `article_click` | An article is tapped on the Articles page | `article` |
| `article_read` | Someone scrolls to the end of an article | `article`, `page` |
| `social_click` | Click on Instagram or LinkedIn | `platform`, `location`, `page` |
| `email_click` | Click on the hello@ email link | `location`, `page` |
| `cta_click` | Click on a button to the FAQ or Help page ("Have a question?") | `cta` (button text), `location`, `page` |
| `faq_open` | A question is opened on the FAQ or Help page | `question`, `topic`, `page` |
| `search` | Someone searches the FAQ, Help or Partners page (3+ letters, after they stop typing) | `search_term`, `page` |
| `filter_topic` | A topic pill is tapped on FAQ, Help or Partners | `topic`, `page` |
| `menu_open` | The menu is opened | `page` |
| `soundtrack_toggle` | The ♫ button is pressed | `state`: `on` or `off` |

GA also records page views, scrolls and outbound clicks on its own (Enhanced measurement).

## One-off setup in Google Analytics

1. **Admin → Events → mark `sign_up` as a key event.** This is the number that matters most.
2. **Admin → Custom definitions → Create custom dimension** (event-scoped) for each of these, so they show up in reports: `list`, `location`, `page`, `platform`, `question`, `topic`, `link`, `article`.
3. Check it's working: **Reports → Realtime**, or **Admin → DebugView** with the GA Debugger browser extension on.

The custom dimensions only collect from the day they're created, so set them up straight away.

## Tagging links (UTMs)

Add these to links you share, so GA shows where visitors came from:

| Where | Link |
|---|---|
| Instagram bio | `isyouded.com/links` (every visit to that page is from your bio) |
| Instagram story / post | `https://isyouded.com/?utm_source=instagram&utm_medium=social&utm_campaign=<post-name>` |
| LinkedIn | `https://isyouded.com/?utm_source=linkedin&utm_medium=social&utm_campaign=<post-name>` |
| Resend emails | `https://isyouded.com/?utm_source=resend&utm_medium=email&utm_campaign=<email-name>` |

Keep everything lowercase, with underscores instead of spaces.

## Where each sign-up came from (Tally hidden fields)

The site remembers how each visitor first found DED. and sends it to Tally with their sign-up. For it to be saved, both Tally forms (waitlist and DED.line) need these **hidden fields** (in the Tally editor, type `/hidden` and add each name exactly):

`source`, `medium`, `campaign`, `landing_page`, `signup_button`, `signup_page`

`source` is things like `instagram`, `resend`, `google`, `linkedin` or `direct`. Visits to /links count as `instagram` / `bio`.

## Microsoft Clarity

Heatmaps and visit recordings for the website only (never the app). To turn it on, put the Clarity project id in `CLARITY_ID` at the top of `script.js`. In Clarity's settings, set masking to **Strict**.
