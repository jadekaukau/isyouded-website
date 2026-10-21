# Articles

Each article is one file in `content/`. To add a new one:

1. Copy `content/what-happens-when-someone-dies-nz.html` and rename it. The file name becomes the web address, e.g. `content/probate-nz.html` → `isyouded.com/articles/probate-nz`. Use lowercase and dashes.
2. Change the details at the top (title, description, standfirst, kicker, date, updated_label, readtime).
3. Write the article in between, using `<h2>`, `<p>`, `<ul>`/`<li>` and `<div class="callout">` for highlighted boxes.
4. List sources at the bottom under `<!-- sources -->`, one per line: `Name | https://link`.
5. Run `python3 articles/_build.py` from the website folder. It builds the article page and updates the Articles list.

Every article automatically gets the menu, a "Join the waitlist" box, the sources list, a "general information, not advice" note, and tracking.

Or just ask Claude to write and add the next one.
