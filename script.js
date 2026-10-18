/* =========================
   CONFIG
   Set this to the URL of the deployed Cloudflare Worker (see worker/README.md).
   While it's empty, the buttons fall back to their plain links
   (the Google Form for the waitlist, an email for DED.line).
========================= */
const SIGNUP_ENDPOINT = "";

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
const MENU_LINKS = [
  ["Home", "index.html"],
  ["FAQs", "faq.html"],
  ["Help", "help.html"],
  ["Partners", "partners.html"],
];

(function buildMenu() {
  const button = document.createElement("button");
  button.className = "menu-toggle";
  button.type = "button";
  button.setAttribute("aria-label", "Open menu");
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-controls", "site-menu");
  button.innerHTML = "<span></span><span></span><span></span>";

  const nav = document.createElement("nav");
  nav.className = "site-menu";
  nav.id = "site-menu";
  nav.setAttribute("aria-label", "Main menu");

  const here = location.pathname.split("/").pop() || "index.html";

  MENU_LINKS.forEach(([label, href]) => {
    const link = document.createElement("a");
    link.href = href;
    link.textContent = label;
    if (href === here) link.setAttribute("aria-current", "page");
    nav.appendChild(link);
  });

  const join = document.createElement("a");
  join.href = "https://forms.gle/ffepxH5SXRe6pMuR7";
  join.target = "_blank";
  join.rel = "noopener";
  join.dataset.signup = "waitlist";
  join.textContent = "Join the waitlist";
  nav.appendChild(join);

  document.body.prepend(nav);
  document.body.prepend(button);

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
   ROTATING QUESTIONS
========================= */
const QUESTIONS = [
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
];

(function rotateQuestions() {
  const el = document.getElementById("rotating-question");
  if (!el) return;

  let index = 0;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const interval = reduceMotion ? 6000 : 3500;

  setInterval(() => {
    if (document.hidden) return;

    index = (index + 1) % QUESTIONS.length;

    if (reduceMotion) {
      el.textContent = QUESTIONS[index];
      return;
    }

    el.classList.add("is-out");
    setTimeout(() => {
      el.textContent = QUESTIONS[index];
      el.classList.remove("is-out");
    }, 350);
  }, interval);
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
      status.textContent = "Something went wrong. Try again, or email hello@isyouded.com.";
      status.classList.add("error");
    } finally {
      submit.disabled = false;
    }
  });

  document.body.appendChild(dialog);
  return dialog;
}

if (SIGNUP_ENDPOINT && typeof HTMLDialogElement === "function") {
  const dialogs = {};

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-signup]");
    if (!trigger) return;

    const list = trigger.dataset.signup;
    if (!FORMS[list]) return;

    event.preventDefault();
    document.body.classList.remove("menu-open");
    dialogs[list] = dialogs[list] || buildDialog(list);
    dialogs[list].showModal();
    dialogs[list].querySelector('input[name="first_name"]').focus();
  });
}

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
