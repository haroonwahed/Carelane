# Carelane — End-to-End Test Guide

A single tester can follow this top to bottom. It walks one casus through the full
workflow: **Aanmelding → Matching → Aanbiederreactie → Plaatsing → Intake.**

> ⚠️ **Read this first — the most important rule.**
> The workflow is **role-gated**. The provider's *accept/reject* actions only appear
> when you are logged in as a **zorgaanbieder (provider)** account, and the gemeente's
> *matching/placement* actions only appear when logged in as a **gemeente** account.
> **No single account can click through the whole flow** — not even the admin, because
> the provider screens only render for a provider login.
> ➜ You will **log in as the gemeente account, then switch to a provider account, then
> back**, as marked in each step below.

---

## 1. Setup (do once)

| What | Value |
|------|-------|
| App URL | **https://carelane.nl/** |
| Login page | https://carelane.nl/login/ → **Inloggen** with username + password |
| Django admin (admin accounts only) | https://carelane.nl/admin/ |

**Two-window tip:** open the app in a **normal window** (stay logged in as gemeente)
and an **incognito/private window** (logged in as the provider). That way you don't
have to log out/in repeatedly — just switch windows at each ⇄ marker.

**Login method:** use **username + password**. Ignore the "Doorgaan met
organisatieaccount" (Google) button — it needs SSO config and isn't used for testing.

---

## 2. Test accounts (all verified, already seeded)

| # | Account (username) | Password | Role in app | Use for |
|---|--------------------|----------|-------------|---------|
| A | `test@gemeente-demo.nl` | `DemoTest123!` | **Gemeente** | Aanmelding, Matching, Plaatsing |
| B | `provider.horizon@gemeente-demo.nl` | `DemoTest123!` | **Zorgaanbieder** (Horizon Jeugdzorg) | Aanbiederreactie, Intake |
| C | `provider.kompas@gemeente-demo.nl` | `DemoTest123!` | **Zorgaanbieder** (Kompas Zorg) | alt. provider |
| D | `provider.groei@gemeente-demo.nl` | `DemoTest123!` | **Zorgaanbieder** (Groei & Co) | alt. provider |
| E | `luuk@carelane.nl` | `ChangeMeNow1!` | **Admin / superuser** | Full oversight, audittrail, Django admin |
| F | `sina@carelane.nl` | `ChangeMeNow2!` | **Admin / superuser** | Full oversight, Django admin |

Notes:
- Accounts **A–D belong to the same organisation** ("Gemeente Demo") but have different
  roles — that's how one tester can play both sides.
- **Rotate the admin passwords** (`ChangeMeNow…`) after first login.
- The match in step 4 must pick **Horizon Jeugdzorg** so the provider login (B) is the
  one that receives the request. If you match a different provider, log in as that
  provider's account (C or D) instead.

---

## 3. The end-to-end flow

Each step lists: **who** (account), **where** (sidebar item), **what** (action), and the
**expected result**. The casus-detail page always highlights the *next* action, so when
in doubt, click the primary (purple) button it suggests.

### Phase 1 — Aanmelding  ·  account **A (gemeente)**

1. Log in as **A** (`test@gemeente-demo.nl`). You land on **Regiekamer** (the dashboard).
2. Sidebar → **Aanmeldingen** → click **"Nieuwe aanmelding"** (top-right).
3. **Step 1 – Casusgegevens:** fill title (e.g. *"E2E Testcasus"*), choose gemeente,
   zorgcategorie, urgentie/complexiteit, add a short omschrijving → **Volgende**.
4. **Step 2 – Zorgvraag:** choose diagnostiek, gewenste zorgvorm, voorkeursregio, max.
   wachttijd, leeftijd/setting → **Volgende**.
5. **Step 3 – Samenvatting:** write the assessment-samenvatting, assign a casuscoördinator
   → click the primary submit button **"Aanmelding indienen"**.
   - ✅ **Expected:** casus is created and you're taken to the **casusdetail** page. State = *Aanmelding/Concept*.
6. On the casusdetail page, complete each highlighted gemeente step in turn (the page
   guides you): **voltooi aanmelding → voltooi samenvatting → start matching**.
   - ✅ **Expected:** the casus reaches **"Klaar voor matching"**.

### Phase 2 — Matching  ·  account **A (gemeente)**

7. Sidebar → **Matching**. Your casus appears in the queue → click it to open the
   matching detail (case on the left, ranked aanbieders on the right with match scores).
8. Select **Horizon Jeugdzorg** from the candidates.
9. Click **"Bevestigen"** (or *"Selecteren met toelichting"* if you want to add an
   override reason).
   - ✅ **Expected:** casus moves to **"Wacht op aanbiederreactie"**; a request is sent to
     the provider; you're returned toward the **Reacties** list. The casus is now visible
     to provider account **B**.

### Phase 3 — Aanbiederreactie  ·  ⇄ switch to account **B (zorgaanbieder)**

10. Log in as **B** (`provider.horizon@gemeente-demo.nl`) — in your incognito window.
11. Sidebar (provider view) → **Reacties** (or **Mijn aanvragen**). Open the incoming
    casus ("E2E Testcasus").
12. Choose one:
    - **Accept (happy path):** click **"Aanvraag accepteren"** → optionally add a note → confirm.
      - ✅ **Expected:** casus → **"Aanbieder akkoord"** (PROVIDER_ACCEPTED).
    - *Reject:* **"Aanvraag weigeren"** → pick a **reden** (Capaciteit/Wachtlijst/…) → confirm. (Casus → afgewezen; ends this happy-path run.)
    - *Request info:* **"Informatie aanvragen"** → choose info-type, write ≥10 chars → confirm. (Casus stays pending, gemeente sees "informatie gevraagd".)

For the full flow, choose **Accept**.

### Phase 4 — Plaatsing  ·  ⇄ switch back to account **A (gemeente)**

13. Back in the gemeente window (account **A**). Sidebar → **Plaatsingen**.
14. Open the casus. Review the checklist ("Aanbieder akkoord ontvangen ✓", selected
    provider, overdrachtsinformatie).
15. Optionally set the intake-afspraak (datum/locatie), then click **"Bevestigen"**.
    - ✅ **Expected:** casus → **"Plaatsing bevestigd"** (PLACEMENT_CONFIRMED); intake phase begins.

### Phase 5 — Intake  ·  ⇄ switch to account **B (zorgaanbieder)**

16. Back in the provider window (account **B**). Sidebar → **Intake** (or open the casus
    from **Mijn aanvragen**).
17. Fill the intake-afspraak: datum/tijd, locatie, wie de intake uitvoert, notities.
18. Click the primary action to complete it (**"Intake afronden"** / bevestigen).
    - ✅ **Expected:** casus → **"Intake gestart / Actieve plaatsing"**. The casus is now
      live. End of the happy-path flow.

### Phase 6 — Verify (any account; best as **A** or admin **E**)

19. As **A**, open **Audittrail** (sidebar) and confirm every step above is logged with
    actor, role and timestamp (this proves the "herleidbaar" promise).
20. As admin **E** (`luuk@carelane.nl`), open **Regiekamer** for the full-keten overview,
    and `https://carelane.nl/admin/` to inspect raw records if needed.

---

## 4. Quick role-switch cheat sheet

| Step | Account | Sidebar | Action |
|------|---------|---------|--------|
| Aanmelding | **A** gemeente | Aanmeldingen | Nieuwe aanmelding → indienen |
| → matching | **A** gemeente | (casusdetail) | voltooi stappen → start matching |
| Matching | **A** gemeente | Matching | kies Horizon → **Bevestigen** |
| ⇄ Reactie | **B** provider | Reacties | **Aanvraag accepteren** |
| ⇄ Plaatsing | **A** gemeente | Plaatsingen | **Bevestigen** |
| ⇄ Intake | **B** provider | Intake | **Intake afronden** |
| Verify | **A** / **E** | Audittrail | controleer log |

---

## 5. What to test besides the happy path

- **Reject path:** at step 12 choose **Aanvraag weigeren** with a reason → confirm the
  gemeente sees it under **Reacties** as "afgewezen".
- **Info-request path:** at step 12 choose **Informatie aanvragen** → gemeente sees
  "informatie gevraagd"; the SLA/wachttijd indicator should update.
- **Role gating (negative test):** while logged in as provider **B**, you should **not**
  see gemeente-only actions (matching/placement confirm); as gemeente **A** you should
  **not** see provider accept/reject. This is expected and correct.
- **Responsive:** repeat on a narrow window — the sidebar collapses to the C-mark only.
- **Light/dark:** toggle theme; the sidebar logo and surfaces should adapt.

---

## 6. Reset / re-seed (if data gets messy)

**On production (carelane.nl):** use the Render dashboard → your service → **Shell** tab:

```bash
python manage.py seed_demo_data
python manage.py create_pilot_superusers
```

**Local development only** (from the project root with backend venv):

```bash
DJANGO_SECRET_KEY="dev-not-for-production" .venv/bin/python manage.py seed_demo_data
DJANGO_SECRET_KEY="dev-not-for-production" .venv/bin/python manage.py create_pilot_superusers
```

Both commands restore the Gemeente Demo organisation, the three providers
(Horizon/Kompas/Groei), the demo cases, and all A–D login accounts.

---

## 7. Known issues / caveats

- **No single "do-everything" account in the UI.** The admin (E/F) has permission for
  every action at the API level, but the provider accept/reject screens only render for a
  provider login — so the role-switch above is required. (This is by design: it mirrors
  how gemeenten and aanbieders really work in separate workspaces.)
- The **Regiekamer** dashboard returned an `API fout 500` in one earlier session. If a
  tester hits "Regiekamer kon niet worden geladen", note it — it's a backend issue to
  investigate, unrelated to login or the workflow steps.
- Exact button wording may differ by one or two words between the casusdetail page and the
  provider portal (e.g. *"Aanvraag accepteren"* vs *"Accepteren"*); the **primary
  highlighted button** at each step is always the correct one.
- For local development, servers must be running on **:3000** (frontend) and **:8000** (backend). If a page won't load locally, restart them (they're pinned to those ports). On production (`carelane.nl`) no local servers are needed.
