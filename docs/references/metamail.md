# Reference: MetaMail (transactional email)

Admin systems built on these UI standards almost always need to **send email** — password
resets, email verification, invitations, and notifications. In the MetaLogix stack that is
handled by **MetaMail**, the self-hosted multi-domain transactional email platform. Wire the
UI flows to MetaMail rather than inventing a one-off mailer.

## Documentation (authoritative)

- **API docs:** https://metamail.metalogix.solutions/api-docs
  — the live OpenAPI/Swagger reference. Always confirm exact endpoints, request/response
  shapes, and auth against this page; treat it as the source of truth over any summary here.
- **Ask an expert:** run `/metaMailAgent <question>` (dispatches the read-only
  `metamail-consultant`) for architecture, the transactional REST API, data model, DNS
  record generation, and webhook signing/retries.

## What MetaMail provides (overview)

- **Transactional send** — a REST API to send email, typically with a domain-scoped API key
  (`Authorization` header / API key). Confirm the exact send endpoint and payload in the
  api-docs.
- **Templates** — reusable email templates (for consistent, on-brand transactional mail).
- **Multi-domain** — per-domain sending with generated DNS records (MX / SPF / DKIM / DMARC).
- **Delivery & bounce webhooks** — events such as `email.delivered` / `email.bounced`,
  signed with an HMAC signature you verify, with retries. Use these to drive UI/account
  state (e.g. mark an address unverified on hard bounce).

## Where this matters in the UI standards

- **Auth flows (Phase 6):** `ForgotPassword` / `ResetPassword` send a reset link, and sign-up
  flows send a verification email — both through MetaMail. The auth pattern doc
  (`docs/patterns/auth.md`, when it lands) references this file for the email side.
- **Notifications / invitations:** any admin action that emails a user goes through MetaMail.

## Integration notes for the frontend

- The frontend does **not** call MetaMail directly with the API key — the key is a backend
  secret. The UI triggers a backend endpoint (e.g. "send reset link"), and the backend calls
  MetaMail. Keep API keys out of client code.
- Show the right UI states around async email: a pending/sent confirmation, a resend affordance
  with a cooldown, and clear error/empty states (use the standard feedback patterns).
- Treat delivery as eventual — the UI should confirm "we've sent a link if the account exists"
  rather than block on delivery.

> Exact endpoint paths, auth scheme, and webhook signature details live in the api-docs above
> and evolve — read them (or ask `/metaMailAgent`) when implementing, don't hardcode from this
> summary.
