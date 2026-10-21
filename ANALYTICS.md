# Website tracking (Google Analytics 4)

Property: **G-5WCCEEQ6JL**. The Google tag is on every page; the events below are sent from `script.js`.

| Event | When it fires | Details sent |
|---|---|---|
| `sign_up` | Someone **submits** the waitlist or newsletter form | `method`: `waitlist` or `dedline` |
| `signup_click` | Someone clicks a "Join the waitlist" or "Subscribe to newsletter" button | `list`, `location` (menu, about, cta, answer…), `page` |
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
2. **Admin → Custom definitions → Create custom dimension** (event-scoped) for each of these, so they show up in reports: `list`, `location`, `page`, `platform`, `question`, `topic`, `method`.
3. Check it's working: **Reports → Realtime**, or **Admin → DebugView** with the GA Debugger browser extension on.

The custom dimensions only collect from the day they're created, so set them up straight away.
