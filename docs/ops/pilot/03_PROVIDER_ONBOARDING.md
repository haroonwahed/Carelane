# Provider (Zorgaanbieder) Onboarding Guide

**Audience:** Pilot Operations Lead onboarding a provider contact  
**Time required:** ~20 minutes  
**Prerequisites:** Provider user account created, Zorgaanbieder linked to Client record  

---

## What you do in this system

As a provider (zorgaanbieder), Carelane notifies you when a municipality has selected your organisation for a care case. Your role is:

1. Receive a notification when a case is sent to you
2. Review the case details
3. Accept or decline the placement request

You do **not** see cases assigned to other providers, and you cannot see the municipality's full case list.

---

## Accounts and access

### Your login

- **Login URL:** `https://www.carelane.nl/care/`
- **Username:** provided by your contact at the municipality or pilot lead
- **Temporary password:** provided via separate secure channel

Change your password after first login.

### What you can see

| Feature | Provider access |
|---------|----------------|
| Cases assigned to your organisation | ✅ Yes |
| Other organisations' cases | ✗ No |
| Audittrail | ✗ No (gemeente-only feature) |
| Matching candidates | ✗ No (gemeente-only feature) |
| Your notification inbox | ✅ Yes |

---

## Your navigation (left sidebar)

After login you will see:

```
WERK
  Intake            — cases in active placement / intake phase
  Reacties          — cases waiting for your response (main working area)
  Mijn aanvragen    — your submitted requests

ONDERSTEUNING
  Nieuwe aanvraag
  Documenten
```

Your daily working area is **Reacties**. That is where pending cases appear.

---

## How notifications work

### In-app bell

When the municipality sends a case to your organisation, the bell icon in the top navigation bar shows an unread count on your next login. Click the bell to see the notification. The notification contains:
- The case reference number
- A prompt to log in and respond

> Notifications update when you load a page — they are not pushed in real time. If you are already logged in when a case is sent, refresh or navigate to **Reacties** to see it.

### Email notification

You will also receive an email to the address registered for your organisation. The email comes from `noreply@carelane.nl` and contains the case reference and a prompt to log in.

> If you are not receiving emails, contact the pilot lead. Your contact email may need to be updated in the system.

---

## Responding to a case

### Step 1 — Find the case

After login, click **Reacties** in the left sidebar. Cases sent to your organisation appear here under the heading **"Wacht op uw reactie"**.

### Step 2 — Review the case

Click on a case to open it. You will see the care need, urgency, start date, and region.

### Step 3 — Respond

Three action buttons appear:

| Button | What it does |
|--------|-------------|
| **Accepteren** | Accept the placement. The case moves to accepted state. The municipality is notified. Your capacity decrements by 1. |
| **Afwijzen** | Decline the placement. You must select a **Reden voor afwijzing** (required). The case returns to the municipality for rematching. Capacity is not affected. |
| **Info vragen** | Request additional information. Provide a **Toelichting** (required, minimum 10 characters). |

**Rejection reasons available:**
- Capaciteit
- Wachtlijst
- Zorgvraag past niet
- Regio past niet
- Veiligheidsrisico
- Administratieve blokkade
- Anders

---

## Tracking your responses

After responding, the case moves to the **"Eerder beantwoord"** section on the **Reacties** page.

Status labels:

| Label | Meaning |
|-------|---------|
| **Wacht op uw reactie** | Case is pending your response |
| **Geaccepteerd** | You accepted |
| **Afgewezen** | You declined |
| **Plaatsing bevestigd** | Municipality confirmed the placement |

---

## Capacity

The system tracks available capacity per organisation. When you accept a placement:
- Available capacity decreases by 1 automatically
- The system prevents double-booking: if two requests arrive simultaneously, only one will succeed (the other receives a 409 error — the municipality is responsible for re-sending)

If capacity reaches 0 for your organisation, the matching engine will not assign new cases to you until capacity is updated. Contact the pilot lead if your capacity settings need adjustment.

---

## Pilot data rules

This pilot uses fabricated data only:
- Case references are test cases — not real clients
- Do not act on these as real placements for reporting or invoicing purposes
- Do not enter real client information anywhere in the system during this pilot

---

## What to do when something goes wrong

| Problem | What to do |
|---------|-----------|
| You didn't receive an email for a case | Check spam folder. Check **Reacties** in the sidebar — the case may be there even if email is missing. Contact pilot lead if you can't find it. |
| You can't see a case the gemeente says they sent | Go to **Reacties** and refresh. If still missing, contact pilot lead with the case reference. |
| You accepted a case by mistake | Contact pilot lead immediately — capacity rollback requires operator action. |
| You see unexpected data (another org's cases) | Stop and contact pilot lead as P1. |
| System error or blank page | Note the URL and contact pilot lead. |

**Support contact:** haroonwahed@live.nl  
**Response:** same business day during supervised pilot weeks

---

## First session checklist

```
[ ] Login succeeds at https://www.carelane.nl/care/
[ ] Bell icon visible in top navigation bar
[ ] Click "Reacties" in sidebar — see at least one case under "Wacht op uw reactie"
[ ] Click the case to open it
[ ] Accept OR decline the test case (use "Accepteren" or "Afwijzen")
[ ] Case moves to "Eerder beantwoord" section
[ ] Check email inbox — received notification email for the test case
[ ] Logout successfully
```

---

## Contact

All questions during the pilot go to the pilot lead first:

**Pilot lead:** haroonwahed@live.nl  
**Response:** same business day (week 1 supervised); 4 business hours for blocked workflow
