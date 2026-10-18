/**
 * DED. sign-up worker
 *
 * Receives the website's sign-up forms and adds the person to Resend:
 *   list "waitlist" -> the Resend segment named "waitlist"
 *   list "dedline"  -> the Resend segment named "ded.line subscribe"
 *
 * The Resend API key never touches the browser; it lives here as a secret.
 *
 * Secrets / variables (see README.md):
 *   RESEND_API_KEY        secret
 *   WAITLIST_SEGMENT_ID   id of the "waitlist" segment
 *   DEDLINE_SEGMENT_ID    id of the "ded.line subscribe" segment
 *   ALLOWED_ORIGINS       comma-separated, e.g. "https://isyouded.com,https://www.isyouded.com"
 */

const RESEND_API = "https://api.resend.com";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = (env.ALLOWED_ORIGINS || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    const originOk = allowed.includes(origin);

    const cors = {
      "Access-Control-Allow-Origin": originOk ? origin : allowed[0] || "",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
      Vary: "Origin",
    };

    const reply = (status, body) =>
      new Response(JSON.stringify(body), {
        status,
        headers: { ...cors, "Content-Type": "application/json" },
      });

    if (request.method === "OPTIONS") {
      return new Response(null, { status: originOk ? 204 : 403, headers: cors });
    }

    if (request.method !== "POST") {
      return reply(405, { ok: false, error: "method_not_allowed" });
    }

    if (!originOk) {
      return reply(403, { ok: false, error: "origin_not_allowed" });
    }

    let data;
    try {
      data = await request.json();
    } catch {
      return reply(400, { ok: false, error: "invalid_json" });
    }

    // Honeypot: real people never fill this in. Pretend it worked.
    if (data.website) {
      return reply(200, { ok: true });
    }

    const email = String(data.email || "").trim().toLowerCase();
    const firstName = String(data.first_name || "").trim().slice(0, 80);
    const list = String(data.list || "");

    if (!EMAIL_PATTERN.test(email) || email.length > 254) {
      return reply(400, { ok: false, error: "invalid_email" });
    }

    const segmentId = {
      waitlist: env.WAITLIST_SEGMENT_ID,
      dedline: env.DEDLINE_SEGMENT_ID,
    }[list];

    if (!segmentId) {
      return reply(400, { ok: false, error: "unknown_list" });
    }

    const headers = {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    };

    // 1. Try to create the contact straight into the segment.
    const contact = { email, unsubscribed: false, segments: [{ id: segmentId }] };
    if (firstName) contact.first_name = firstName;

    const created = await fetch(`${RESEND_API}/contacts`, {
      method: "POST",
      headers,
      body: JSON.stringify(contact),
    });

    if (created.ok) {
      return reply(200, { ok: true });
    }

    if (created.status === 401 || created.status === 403 || created.status >= 500) {
      console.error("Resend create contact failed", created.status, await created.text());
      return reply(502, { ok: false, error: "upstream_error" });
    }

    // 2. Contacts are global in Resend, so someone already on one list
    //    (e.g. the waitlist) can't be created again. Add them to this segment instead.
    const added = await fetch(
      `${RESEND_API}/contacts/${encodeURIComponent(email)}/segments/${encodeURIComponent(segmentId)}`,
      { method: "POST", headers }
    );

    if (added.ok) {
      return reply(200, { ok: true });
    }

    console.error(
      "Resend add to segment failed",
      created.status,
      await created.text(),
      added.status,
      await added.text()
    );
    return reply(502, { ok: false, error: "upstream_error" });
  },
};
