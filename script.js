/* =========================
   CONFIG
   Set this to the URL of the deployed Cloudflare Worker (see worker/README.md).
   While it's empty, the buttons fall back to their plain links
   (the Google Form for the waitlist, an email for DED.line).
========================= */
const SIGNUP_ENDPOINT = "";

/* Tally forms, opened as pop-ups. Add the DED.line form id when it exists. */
const TALLY_FORMS = {
  waitlist: "5XKYGP",
  dedline: "o96ZVM",
};

/* =========================
   SOUNDTRACK
========================= */
const audio = document.getElementById("ded-audio");
const toggle = document.getElementById("sound-toggle");

if (audio && toggle) {
  audio.volume = 0.35;

  const updateButton = () => {
    const isPlaying = !audio.paused;

    toggle.textContent = isPlaying ? "♫ ON" : "♫ OFF";
    toggle.setAttribute(
      "aria-label",
      isPlaying ? "Pause soundtrack" : "Play soundtrack"
    );
  };

  toggle.addEventListener("click", async () => {
    if (audio.paused) {
      try {
        await audio.play();
      } catch (error) {
        console.error("Audio could not be played:", error);
      }
    } else {
      audio.pause();
    }

    updateButton();
  });

  audio.addEventListener("play", updateButton);
  audio.addEventListener("pause", updateButton);
  audio.addEventListener("ended", updateButton);

  window.addEventListener("load", async () => {
    try {
      await audio.play();
    } catch (error) {
      // Autoplay may be blocked until the visitor clicks the button.
    }

    updateButton();
  });

  updateButton();
}

/* =========================
   MENU
========================= */
(function menu() {
  const button = document.querySelector(".menu-toggle");
  const nav = document.getElementById("site-menu");
  if (!button || !nav) return;

  const setOpen = (open) => {
    document.body.classList.toggle("menu-open", open);
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  button.addEventListener("click", () => {
    setOpen(!document.body.classList.contains("menu-open"));
  });

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });
})();

/* =========================
   ROTATING CALLOUTS (home page cards)
========================= */
const CALLOUTS = {
  funeral: [
    "What are you wearing?",
    "Buried, cremated, or something stranger?",
    "Where do you want to end up?",
    "Open casket or closed?",
    "What song do you go out to?",
    "Who gets the mic, and who definitely doesn't?",
    "Organ donor?",
    "Any rules for the day? Mandatory karaoke?",
    "Party or proper service?",
    "Which photos? And which ones are banned?",
    "Embalmed, or au naturel?",
  ],
  vault: [
    "Where's the will?",
    "Who has the Netflix login?",
    "Which bank are you with?",
    "Where are the spare keys?",
    "Any debts we should know about?",
    "What's the laptop password?",
    "Is there life insurance?",
    "What happens to your socials?",
    "Who's cancelling the gym membership?",
  ],
  letters: [
    "Anything you never got round to saying?",
    "What do you want them to remember?",
    "A note for the kids?",
    "Who gets the last word?",
    "Who's running the show on the day?",
    "Who should see your plan?",
    "Something to read at the funeral?",
  ],
};

(function rotateCallouts() {
  const bubbles = Array.from(document.querySelectorAll("[data-rotate]"))
    .filter((el) => CALLOUTS[el.dataset.rotate]);
  if (!bubbles.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const positions = bubbles.map(() => 0);
  let turn = 0;

  // One card changes at a time, taking turns, so they never all flip at once.
  setInterval(() => {
    if (document.hidden) return;

    const i = turn % bubbles.length;
    turn += 1;

    const el = bubbles[i];
    const list = CALLOUTS[el.dataset.rotate];
    positions[i] = (positions[i] + 1) % list.length;
    const next = list[positions[i]];

    if (reduceMotion) {
      el.textContent = next;
      return;
    }

    el.classList.add("is-out");
    setTimeout(() => {
      el.textContent = next;
      el.classList.remove("is-out");
    }, 320);
  }, reduceMotion ? 3000 : 1700);
})();

/* =========================
   SIGN-UP FORMS (Resend via worker)
========================= */
const FORMS = {
  waitlist: {
    title: "Join the waitlist.",
    copy: "Be first in when DED. opens up. We'll only email you about access.",
    button: "Join the waitlist",
    done: "You're on the list. We'll be in touch when it's your turn.",
  },
  dedline: {
    title: "Get DED.line.",
    copy: "News, updates and the odd death fact, straight to your inbox. Unsubscribe whenever.",
    button: "Subscribe",
    done: "You're subscribed to DED.line. See you in your inbox.",
  },
};

function buildDialog(list) {
  const config = FORMS[list];
  const dialog = document.createElement("dialog");
  dialog.className = "signup-dialog";
  dialog.setAttribute("aria-labelledby", `${list}-title`);

  dialog.innerHTML = `
    <button class="dialog-close" type="button" aria-label="Close">✕</button>
    <form novalidate>
      <h2 id="${list}-title">${config.title}</h2>
      <p class="body-copy">${config.copy}</p>
      <div class="field">
        <label for="${list}-name">First name</label>
        <input id="${list}-name" name="first_name" type="text" autocomplete="given-name" maxlength="80" />
      </div>
      <div class="field">
        <label for="${list}-email">Email</label>
        <input id="${list}-email" name="email" type="email" autocomplete="email" required maxlength="254" />
      </div>
      <div class="honeypot" aria-hidden="true">
        <label for="${list}-website">Leave this empty</label>
        <input id="${list}-website" name="website" type="text" tabindex="-1" autocomplete="off" />
      </div>
      <input type="hidden" name="list" value="${list}" />
      <p class="form-status" role="status"></p>
      <button class="button" type="submit">${config.button}</button>
      <p class="fine-print">We'll only use your email for this. See our <a href="privacy.html">privacy policy</a>.</p>
    </form>
    <div class="done" hidden>
      <h2>Sorted.</h2>
      <p class="body-copy">${config.done}</p>
      <button class="button" type="button" data-close>Close</button>
    </div>
  `;

  const form = dialog.querySelector("form");
  const done = dialog.querySelector(".done");
  const status = dialog.querySelector(".form-status");
  const submit = form.querySelector('button[type="submit"]');

  const close = () => dialog.close();
  dialog.querySelector(".dialog-close").addEventListener("click", close);
  done.querySelector("[data-close]").addEventListener("click", close);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) close();
  });
  dialog.addEventListener("close", () => {
    form.hidden = false;
    done.hidden = true;
    status.textContent = "";
    status.classList.remove("error");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = Object.fromEntries(new FormData(form));
    const email = (data.email || "").trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      status.textContent = "That email doesn't look right.";
      status.classList.add("error");
      form.email.focus();
      return;
    }

    submit.disabled = true;
    status.classList.remove("error");
    status.textContent = "Sending…";

    try {
      const response = await fetch(SIGNUP_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, email }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      form.reset();
      form.hidden = true;
      done.hidden = false;

      if (typeof gtag === "function") {
        gtag("event", "sign_up", { method: list });
      }
    } catch (error) {
      status.textContent = "Something went wrong. Try again, or use the email on our Help page.";
      status.classList.add("error");
    } finally {
      submit.disabled = false;
    }
  });

  document.body.appendChild(dialog);
  return dialog;
}

/* Load Tally's pop-up script once, if any Tally form is set up. */
if (Object.values(TALLY_FORMS).some(Boolean)) {
  const tallyScript = document.createElement("script");
  tallyScript.src = "https://tally.so/widgets/embed.js";
  tallyScript.async = true;
  document.head.appendChild(tallyScript);
}

const dialogs = {};

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-signup]");
  if (!trigger) return;

  const list = trigger.dataset.signup;
  const tallyId = TALLY_FORMS[list];

  // 1. Tally pop-up, when that list has a Tally form and the script has loaded.
  if (tallyId && window.Tally) {
    event.preventDefault();
    document.body.classList.remove("menu-open");
    let submitted = false;
    window.Tally.openPopup(tallyId, {
      layout: "modal",
      width: 520,
      overlay: true,
      hideTitle: true,
      onOpen: () => {
        submitted = false;
      },
      onSubmit: () => {
        submitted = true;
        if (typeof gtag === "function") gtag("event", "sign_up", { method: list });
      },
      onClose: () => {
        // Opened the form but closed it without signing up
        if (!submitted && typeof gtag === "function") gtag("event", "signup_abandon", { list });
      },
    });
    return;
  }

  // 2. Our own form, when the Resend worker is set up.
  if (!tallyId && SIGNUP_ENDPOINT && FORMS[list] && typeof HTMLDialogElement === "function") {
    event.preventDefault();
    document.body.classList.remove("menu-open");
    dialogs[list] = dialogs[list] || buildDialog(list);
    dialogs[list].showModal();
    dialogs[list].querySelector('input[name="first_name"]').focus();
  }

  // 3. Otherwise the link's own href (the Tally page, or an email for DED.line).
});

/* =========================
   SEARCH + TOPIC FILTERS (FAQ, Help, Partners)
========================= */
(function filters() {
  const items = Array.from(document.querySelectorAll("[data-topic]"));
  if (!items.length) return;

  const search = document.querySelector(".search");
  const pills = Array.from(document.querySelectorAll(".pill[data-filter]"));
  const groups = Array.from(document.querySelectorAll("[data-group]"));
  const empty = document.querySelector(".empty-note");
  let topic = "all";

  const apply = () => {
    const term = (search ? search.value : "").trim().toLowerCase();
    let shown = 0;

    items.forEach((item) => {
      const topicMatch = topic === "all" || item.dataset.topic === topic;
      const textMatch = !term || item.textContent.toLowerCase().includes(term);
      const visible = topicMatch && textMatch;
      item.hidden = !visible;
      if (visible) shown += 1;
      if (term && visible && item.tagName === "DETAILS") item.open = true;
    });

    groups.forEach((group) => {
      group.hidden = !group.querySelector("[data-topic]:not([hidden])");
    });

    if (empty) empty.hidden = shown > 0;
  };

  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      const pressed = pill.getAttribute("aria-pressed") === "true";
      pills.forEach((p) => p.setAttribute("aria-pressed", "false"));
      topic = pressed ? "all" : pill.dataset.filter;
      if (!pressed) pill.setAttribute("aria-pressed", "true");
      apply();
    });
  });

  if (search) search.addEventListener("input", apply);
})();

/* =========================
   ANALYTICS (Google Analytics 4, G-5WCCEEQ6JL)
   Sends events to GA when people do things that matter.
   Event names and what they mean are listed in ANALYTICS.md.
========================= */
function track(name, params) {
  if (typeof gtag === "function") gtag("event", name, params || {});
}

// Where on the page something was clicked: menu, hero, intro, features, cta, footer, faq…
function placeOf(el) {
  if (el.closest(".site-menu")) return "menu";
  if (el.closest("footer")) return "footer";
  const section = el.closest("section, details");
  if (section && section.tagName === "DETAILS") return "answer";
  if (section) return section.id || section.classList[0] || "page";
  return "page";
}

const PAGE = (() => {
  const parts = location.pathname.split("/").filter(Boolean);
  const last = (parts.pop() || "index.html").replace(".html", "") || "index";
  // Articles live in /articles/, so name them "articles/<slug>" (the list page is "articles/index")
  return parts.includes("articles") || last === "articles" ? `articles/${last === "articles" ? "index" : last}` : last;
})();

document.addEventListener("click", (event) => {
  const el = event.target.closest("a, button");
  if (!el) return;

  // Waitlist / newsletter buttons (before the form opens)
  if (el.dataset.signup) {
    track("signup_click", { list: el.dataset.signup, location: placeOf(el), page: PAGE });
    return;
  }

  // Article cards on the Articles page
  if (el.dataset.article) {
    return track("article_click", { article: el.dataset.article, page: PAGE });
  }

  // Buttons on the Instagram links page (isyouded.com/links)
  if (el.dataset.link) {
    return track("links_click", { link: el.dataset.link, page: PAGE });
  }

  const href = el.getAttribute("href") || "";

  // Social links
  if (href.includes("instagram.com")) return track("social_click", { platform: "instagram", location: placeOf(el), page: PAGE });
  if (href.includes("linkedin.com")) return track("social_click", { platform: "linkedin", location: placeOf(el), page: PAGE });

  // Partner enquiries (the email link on the Partners page that opens with the "DED. partners" subject)
  if ((el.dataset.query || href).includes("partners")) {
    return track("partner_enquiry", { location: placeOf(el), page: PAGE });
  }

  // Email links
  if (el.dataset.email || href.startsWith("mailto:")) {
    return track("email_click", { location: placeOf(el), page: PAGE });
  }

  // "Have a question?" and other buttons to the FAQ / Help
  if (el.classList.contains("button") && /(faq|help)\.html/.test(href)) {
    return track("cta_click", { cta: el.textContent.trim().slice(0, 60), location: placeOf(el), page: PAGE });
  }

  // Menu open (the menu's own click handler has already run, so "open" means it just opened)
  if (el.classList.contains("menu-toggle") && document.body.classList.contains("menu-open")) {
    return track("menu_open", { page: PAGE });
  }

  // Topic filter pills (FAQ, Help, Partners)
  if (el.classList.contains("pill") && el.dataset.filter) {
    return track("filter_topic", { topic: el.dataset.filter, page: PAGE });
  }

  // Soundtrack on/off
  if (el.id === "sound-toggle") {
    const audioEl = document.getElementById("ded-audio");
    // The click handler above runs first, so read the state just after it.
    setTimeout(() => track("soundtrack_toggle", { state: audioEl && !audioEl.paused ? "on" : "off" }), 0);
  }
});

// Which questions people open on the FAQ and Help pages
document.querySelectorAll("details").forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    const summary = item.querySelector("summary");
    track("faq_open", {
      question: (summary ? summary.textContent : "").trim().slice(0, 100),
      topic: item.dataset.topic || "",
      page: PAGE,
    });
  });
});

// What people search for on the FAQ, Help and Partners pages (sent once they stop typing)
document.querySelectorAll("input.search").forEach((input) => {
  let timer;
  let last = "";
  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const term = input.value.trim().toLowerCase();
      if (term.length < 3 || term === last) return;
      last = term;
      track("search", { search_term: term.slice(0, 100), page: PAGE });
    }, 1200);
  });
});

// Article read: fires once when someone scrolls to the end of an article
(function articleRead() {
  const end = document.querySelector(".article-cta");
  if (!end || !("IntersectionObserver" in window)) return;
  const seen = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      track("article_read", { article: PAGE.replace("articles/", ""), page: PAGE });
      seen.disconnect();
    }
  });
  seen.observe(end);
})();

/* =========================
   EMAIL LINKS
   The address is split up in the HTML so spam bots scraping the page
   can't read it. This puts it back together for real visitors.
========================= */
document.querySelectorAll("[data-email]").forEach((link) => {
  const [user, domain] = link.dataset.email.split("|");
  const address = `${user}@${domain}`;
  link.href = `mailto:${address}${link.dataset.query || ""}`;
  if (link.textContent.includes("[at]")) link.textContent = address;
});
