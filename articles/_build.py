"""Builds the Articles pages from the content files in this folder.

Run from the website folder:  python3 articles/_build.py
Each article lives in articles/content/<slug>.html (just the body) with a small
header block at the top. This script wraps it in the site's header, menu and
footer, and rebuilds the Articles list page (articles/index.html).
"""
import html
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent
CONTENT = ROOT / "content"
SITE = "https://isyouded.com"


def head(title, description, canonical, extra=""):
    return f"""<!DOCTYPE html>
<html lang="en-NZ">
<head>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-5WCCEEQ6JL"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){{dataLayer.push(arguments);}}
    gtag('js', new Date());

    gtag('config', 'G-5WCCEEQ6JL');
  </script>

  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>{html.escape(title)}</title>
  <meta name="description" content="{html.escape(description)}" />
  <link rel="canonical" href="{canonical}" />
  <meta property="og:title" content="{html.escape(title)}" />
  <meta property="og:description" content="{html.escape(description)}" />
  <meta property="og:url" content="{canonical}" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="DED." />
  <meta property="og:image" content="{SITE}/assets/og-image.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="theme-color" content="#F96CAE">
{extra}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;700;900&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="../styles.css?v=6" />

  <link rel="apple-touch-icon" sizes="180x180" href="../assets/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="32x32" href="../assets/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="../assets/favicon-16x16.png">
  <link rel="shortcut icon" href="../assets/favicon.ico">
  <link rel="manifest" href="../assets/site.webmanifest">
</head>

<body>
  <header class="page-bar">
    <div class="bar">
      <a class="bar-logo" href="../index.html" aria-label="DED. home">DED.</a>
      <button class="menu-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="site-menu">
      <span></span><span></span><span></span>
    </button>
    </div>
  </header>
  <nav class="site-menu" id="site-menu" aria-label="Main menu">
    <div class="menu-inner">
      <ul class="menu-links">
        <li><a href="../index.html">Home</a></li>
        <li><a href="index.html" aria-current="page">Articles</a></li>
        <li><a href="../faq.html">FAQs</a></li>
        <li><a href="../help.html">Help</a></li>
        <li><a href="../partners.html">Partners</a></li>
      </ul>
      <div>
        <div class="menu-actions">
          <a class="button" href="https://tally.so/r/5XKYGP" target="_blank" rel="noopener" data-signup="waitlist">Join the waitlist</a>
          <a class="button white" href="https://tally.so/r/o96ZVM" target="_blank" rel="noopener" data-signup="dedline">Subscribe to newsletter</a>
        </div>
        <p class="menu-foot">Questions? <a href="../help.html#contact" data-email="hello|isyouded.com" data-query="">hello [at] isyouded [dot] com</a></p>
      </div>
    </div>
  </nav>
"""


FOOT = """
  <footer class="footer">
    <div class="wrap">
      <nav class="footer-nav footer-social" aria-label="Social">
        <a href="https://www.instagram.com/ded_planning/" target="_blank" rel="noopener">Instagram ↗</a>
        <a href="https://www.linkedin.com/company/ded-end-of-life-planning/" target="_blank" rel="noopener">LinkedIn ↗</a>
        <a href="../help.html#contact" data-email="hello|isyouded.com" data-query="">Email ↗</a>
      </nav>

      <div class="footer-center">
        <div class="footer-divider"></div>
        <p class="footer-copy">© 2026 <span>DED.</span> All rights reserved.</p>
        <p class="footer-beta">Currently in beta.</p>
      </div>

      <nav class="footer-nav footer-legal" aria-label="Legal">
        <a href="../privacy.html">Privacy</a>
        <a href="../terms.html">Terms</a>
        <a href="../help.html#contact">Contact</a>
      </nav>
    </div>
  </footer>

  <script src="../script.js?v=7"></script>
</body>
</html>
"""

CTA = """
        <section class="card article-cta" aria-label="Join the waitlist">
          <h2>Make it easier for your people.</h2>
          <p>DED. helps you plan your send-off, sort your important stuff and share it with the people who'll need it.</p>
          <a class="button" href="https://tally.so/r/5XKYGP" target="_blank" rel="noopener" data-signup="waitlist">Join the waitlist</a>
        </section>
"""

DISCLAIMER = """
        <p class="article-small">This is general information for New Zealand, not legal, medical or financial advice. Rules and fees change, so check the official links above, or talk to a lawyer, Community Law or Citizens Advice for your situation.</p>
"""


def parse(path):
    raw = path.read_text()
    meta_block, body = raw.split("---\n", 2)[1:]
    meta = {}
    for line in meta_block.strip().splitlines():
        k, v = line.split(":", 1)
        meta[k.strip()] = v.strip()
    meta["slug"] = path.stem
    meta["body"] = body
    return meta


def build_article(a):
    url = f"{SITE}/articles/{a['slug']}"
    schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": a["title"],
        "description": a["description"],
        "datePublished": a["date"],
        "dateModified": a.get("updated", a["date"]),
        "author": {"@type": "Organization", "name": "DED."},
        "publisher": {"@type": "Organization", "name": "DED.", "url": SITE},
        "mainEntityOfPage": url,
    }
    extra = f'  <script type="application/ld+json">{json.dumps(schema)}</script>\n'
    page = head(f"{a['title']} | DED.", a["description"], url, extra)
    page += f"""
  <main class="page">
    <div class="wrap">
      <article class="article">
        <header class="article-head">
          <span class="kicker">{html.escape(a['kicker'])}</span>
          <h1>{html.escape(a['title'])}</h1>
          <p class="standfirst">{html.escape(a['standfirst'])}</p>
          <p class="article-meta">{html.escape(a['readtime'])} read · Updated {html.escape(a['updated_label'])}</p>
        </header>

        <div class="card article-body">
{a['body'].rstrip()}
        </div>
{CTA}{a.get('sources_html', '')}{DISCLAIMER}
        <p class="article-small"><a href="index.html">← All articles</a></p>
      </article>
    </div>
  </main>
{FOOT}"""
    (ROOT / f"{a['slug']}.html").write_text(page)


def build_index(articles):
    cards = "\n".join(
        f"""        <a class="card article-card" href="{a['slug']}.html" data-article="{a['slug']}">
          <span class="kicker">{html.escape(a['kicker'])}</span>
          <h2>{html.escape(a['title'])}</h2>
          <p>{html.escape(a['standfirst'])}</p>
          <span class="read">Read it ({html.escape(a['readtime'])}) →</span>
        </a>"""
        for a in articles
    )
    page = head(
        "Articles | DED.",
        "Plain-English guides to death, dying and the admin that comes after, for New Zealanders.",
        f"{SITE}/articles/",
    ).replace('og:type" content="article"', 'og:type" content="website"')
    page += f"""
  <main class="page">
    <div class="wrap">
      <div class="page-head">
        <div>
          <h1>Articles</h1>
          <p class="body-copy">Death, dying and all the admin in between. Explained properly, for New Zealand.</p>
        </div>
      </div>

      <div class="article-list">
{cards}
      </div>
    </div>
  </main>
{FOOT}"""
    (ROOT / "index.html").write_text(page)


def build_sitemap(articles):
    """Writes sitemap.xml in the website folder, listing every public page and article."""
    pages = ["/", "/articles/", "/faq", "/help", "/partners", "/privacy", "/terms"]
    newest = max((a.get("updated", a["date"]) for a in articles), default="")
    urls = [f"  <url><loc>{SITE}{p}</loc></url>" for p in pages]
    urls[1] = f"  <url><loc>{SITE}/articles/</loc><lastmod>{newest}</lastmod></url>"
    urls += [
        f"  <url><loc>{SITE}/articles/{a['slug']}</loc><lastmod>{a.get('updated', a['date'])}</lastmod></url>"
        for a in articles
    ]
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "\n".join(urls) + "\n</urlset>\n"
    (ROOT.parent / "sitemap.xml").write_text(xml)


def sources_html(raw):
    items = []
    for line in raw.strip().splitlines():
        label, url = line.rsplit("|", 1)
        items.append(f'            <li><a href="{url.strip()}" target="_blank" rel="noopener">{html.escape(label.strip())}</a></li>')
    return (
        '\n        <section class="article-sources" aria-label="Sources">\n'
        "          <h2>Where this comes from</h2>\n          <ul>\n"
        + "\n".join(items)
        + "\n          </ul>\n        </section>\n"
    )


if __name__ == "__main__":
    articles = []
    for path in sorted(CONTENT.glob("*.html")):
        a = parse(path)
        body, _, src = a["body"].partition("<!-- sources -->")
        a["body"] = body
        if src.strip():
            a["sources_html"] = sources_html(src)
        articles.append(a)
    articles.sort(key=lambda a: a["date"], reverse=True)
    for a in articles:
        build_article(a)
    build_index(articles)
    build_sitemap(articles)
    print("built", [a["slug"] for a in articles])
