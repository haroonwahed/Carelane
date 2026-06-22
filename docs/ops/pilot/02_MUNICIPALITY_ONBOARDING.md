# Gemeente Onboarding Guide

**Audience:** Pilot Operations Lead onboarding a municipality coordinator  
**Time required:** ~45 minutes (operator + coordinator together)  
**Prerequisites:** Deployment Runbook completed, account credentials ready  

---

## What this pilot is

Carelane is a digital coordination tool for matching youth care clients to providers. During this 30-day supervised pilot, your organisation uses Carelane to:

1. Register a care case (aanmelding)
2. Review matching suggestions and select a provider
3. Monitor provider response
4. Confirm placement
5. View audit history

**What this pilot is not:**
- A replacement for your zaaksysteem or DBC administration
- A legally binding process system
- Connected to external iWlz/VECOZO systems (pilot scope)

---

## Accounts and access

### Your accounts

You will receive:
- **Login URL:** `https://www.carelane.nl/care/`
- **Username:** provided separately
- **Temporary password:** provided via separate secure channel

Change your password after first login: click **Instellingen** in the left sidebar (under **BEHEER**) → **Algemeen**.

### Roles in the system

| Role | What they can do |
|------|-----------------|
| **Gemeente (OWNER/ADMIN)** | All intake, matching, placement, audit access |
| **Zorgaanbieder** | Review assigned cases only; no audit access |

Your coordinator account has the Gemeente role. Provider accounts are managed separately.

### Adding team members

1. Click **Instellingen** in the left sidebar (under **BEHEER**)
2. Click **Gebruikers & rollen**
3. Click **Gebruikersbeheer openen**
4. Enter the email address and assign a role
5. The invite flow creates the account

> **Note:** `CARELANE_INVITE_ONLY_ONBOARDING` is active. New accounts are only created through the invite flow — not by self-registration. This protects your tenant data.

---

## Your navigation (left sidebar)

After login you will see:

```
DOORSTROOM
  Regiekamer        — dashboard overview of all cases
  Aanmeldingen      — your case list; create new cases here

CAPACITEIT
  Matching          — matching queue
  Reacties          — provider response tracking
  Plaatsingen       — placement confirmations

ONDERSTEUNING
  Acties

NETWERK
  Zorgaanbieders
  Gemeenten
  Regio's

BEHEER
  Documenten
  Audittrail        — full audit log (export available here)
  Instellingen      — account, team, and settings
```

---

## The case workflow

### Step 1 — Aanmelding (Register a case)

1. Click **Aanmeldingen** in the left sidebar
2. Click the **Nieuwe aanmelding** button (top right of the page)
3. A four-step wizard opens with steps: **Casus → Matching → Aanbieder beoordeling → Plaatsing**

**Wizard step 1 — Casus**

Fill in these fields:

| Field | What to enter |
|-------|--------------|
| **Gemeente (woonplaatsbeginsel) \*** | The municipality responsible under woonplaatsbeginsel |
| **Gewenste startdatum \*** | Desired care start date |
| **Uiterste plaatsingsdatum \*** | Latest acceptable date to place the client |
| **Regio** | Derived automatically from gemeente — read-only |
| **Zorgbehoefte categorie \*** | The care category needed |
| **Persoonsbeeld \*** | Anonymous case description — the operational context needed for matching. **Do not enter real names, addresses, phone numbers, email addresses, or BSN.** Use references such as "Testclient A" or "Pilotcasus 001". |

The **Urgentieadvies** score is calculated automatically as you fill in the form — you do not set it manually. If the score triggers an urgency flag and the client already holds an urgency declaration, you can upload it. If not, you can save and continue without it.

Click **Volgende stap** when done.

**Wizard step 2 — Matching**

Matching parameters are pre-filled from step 1. Review and adjust if needed. Click **Volgende stap**.

**Wizard steps 3 & 4 — Aanbieder beoordeling / Plaatsing**

These steps are informational. Click **Casus aanmaken** on the final step to create the case.

The case now appears in **Aanmeldingen** with its first active tasks shown in the context rail.

### Step 2 — Toetsing (Route validation)

Open the case from **Aanmeldingen**. You will see tabs:

```
Overzicht | Aanmelding | Documenten | Activiteit
```

If the case has missing required data, a **"Casus is nog niet compleet"** warning appears. Complete the listed fields before continuing.

Once the case is complete, a **Toetsing** tab appears alongside the others. Click it.

The Toetsing tab shows:
- **Toetsing route** — shows **Vereist** when the case needs validation
- A data completeness checklist (Verplichte gegevens / Compleet or Onvolledig)

When all items are green, the next-best action panel shows **"Valideer matching"**.

Click **Valideer matching** to confirm that the proposed care route, financing, and regional responsibility are acceptable.

> After clicking **Valideer matching** the case advances. The **Matching** tab becomes the active working area.

### Step 3 — Matching

1. Click the **Matching** tab
2. Review ranked provider candidates (based on care need, capacity, and region)
3. Select your preferred provider
4. Click **Stuur naar aanbieder**
5. Confirm in the dialog

The context rail now shows **"Wacht op aanbiederreactie"**.

The selected provider receives:
- An in-app notification (their bell icon shows a count on next login)
- An email to their registered contact address

### Step 4 — Aanbiederreactie (Waiting for provider)

Monitor from the **Reacties** page (sidebar) or directly in the case. The context rail shows:

| Context rail text | Meaning |
|-------------------|---------|
| **Wacht op aanbiederreactie** | Provider has not yet responded |
| **Plaatsing voorbereid** | Provider accepted — you can now confirm placement |
| **Her-match casus** | Provider declined — return to Matching to select another |

**If a provider declines:**
1. The next-best action shows **"Her-match casus"**
2. Click it to return to the **Matching** tab
3. Select a different provider and click **Stuur naar aanbieder** again

### Step 5 — Plaatsing bevestigen

After provider acceptance, the context rail shows **"Bevestig plaatsing"**.

1. Click **Bevestig plaatsing** (in the context rail or on the **Plaatsingen** page)
2. A confirmation dialog shows the case reference, provider name, and urgency
3. Click **Bevestig**

The case status becomes **"Plaatsing bevestigd"**. Provider capacity is decremented automatically.

### Step 6 — Monitoring

After confirmation you can:
- View the case timeline in **Overzicht** or **Activiteit**
- See the full decision record in the **Arrangement** tab
- Export the audit trail via **Audittrail** in the sidebar (CSV or JSON)

---

## Audit trail

Access: **Audittrail** in the left sidebar, under **BEHEER**.

- Scoped to your organisation — you see only your cases
- Records survive if a user leaves your team (organisation-scoped, not user-scoped)
- Export available for compliance review

---

## What to do when something goes wrong

| Problem | What to do |
|---------|-----------|
| Can't log in | Check username and password. Contact support. |
| Can't find where to create a case | Go to **Aanmeldingen** in the sidebar — click **Nieuwe aanmelding** (top right). |
| **Toetsing** tab not visible | The case likely has missing fields. Open the case and follow the **"Casus is nog niet compleet"** prompts. |
| No **Valideer matching** action appears | Toetsing is still showing items as **Onvolledig** — complete them first. |
| Case stuck after sending to provider | Do not force-advance. Contact support with the case reference. |
| Provider says they didn't receive a notification | Ask them to check their in-app bell on next login. If still missing, contact support — email configuration may need to be verified. |
| You see another organisation's data | Stop immediately. Contact support as P1. |
| Page shows an error | Note the URL and the full error text, then contact support. |

**Support contact:** haroonwahed@live.nl  
**Response:** same business day during pilot week 1; 4 hours for workflow-blocking issues

---

## Pilot data rules

1. **No real client data.** Use fabricated names and references only.
2. **No real BSN numbers.** Use test references only.
3. **No production provider addresses.** Use postcode region only.
4. **Report any real data accidentally entered** to the pilot lead immediately.

These rules are required for AVG compliance during the trial period.

---

## First session checklist

Complete on Day 1 before involving any providers:

```
[ ] Login succeeds
[ ] Change password: Instellingen → Algemeen
[ ] Aanmeldingen page visible (empty is fine)
[ ] Click "Nieuwe aanmelding" — wizard opens
[ ] Complete wizard: use "Pilotcasus 001" in the Persoonsbeeld field
[ ] Case appears in Aanmeldingen
[ ] Open the case — Overzicht tab visible
[ ] Complete any flagged missing fields
[ ] Toetsing tab appears — "Valideer matching" action shown
[ ] Click "Valideer matching"
[ ] Matching tab appears — at least one candidate shown
[ ] Click "Stuur naar aanbieder" on a test provider — confirm in dialog
[ ] Context rail shows "Wacht op aanbiederreactie"
[ ] Go to Audittrail — transition event logged for this case
[ ] Logout and log back in successfully
```

If any step fails, contact support before proceeding.

---

## Frequently asked questions

**Q: Where do I create a new case?**  
A: Click **Aanmeldingen** in the sidebar, then click **Nieuwe aanmelding** (top right of the page).

**Q: The guide mentions "Beoordeling" — where is that?**  
A: The tab is called **Toetsing**. It appears on a case once the case data is complete enough to route.

**Q: Can multiple coordinators work on the same case?**  
A: Yes. Any team member with the Gemeente role can act on any case in your organisation.

**Q: What happens to cases when the pilot ends?**  
A: Data persists on the platform. No automatic deletion. Export your Audittrail before the pilot ends.

**Q: Can we add more providers during the pilot?**  
A: Yes, contact the pilot lead. New providers need a user account and their Zorgaanbieder must be linked in the system by an operator.

**Q: Is the matching recommendation binding?**  
A: No. Matching is advisory. You can select any available candidate.

**Q: What if we need to rematch after a provider declines?**  
A: The context rail shows **"Her-match casus"** automatically after a rejection. Click it to return to Matching. To rematch a confirmed placement, contact the pilot lead — that requires operator action.

**Q: Where is the audit log?**  
A: Click **Audittrail** in the sidebar under **BEHEER**.

**Q: Where are user and team settings?**  
A: Click **Instellingen** in the sidebar under **BEHEER**, then **Gebruikers & rollen**.
