# Pilot Support Playbook

**Audience:** Pilot Operations Lead handling support requests  
**Scope:** 30-day supervised pilot  
**SLA:** P1 = same business day; P2 = 4 business hours; P3 = next business day  

---

## Severity definitions

| Level | Definition | Examples |
|-------|-----------|---------|
| **P1** | Pilot blocked — no user can progress | Login broken, app returns 500, data isolation breach |
| **P2** | Workflow blocked for ≥ 1 user | Case stuck in wrong state, provider not notified, email not sending |
| **P3** | Degraded but functional | Slow responses, UI confusion, notification bell wrong count |

Upgrade P2 → P1 if it affects all users or involves data integrity.

---

## Quick UI reference for support calls

When a user describes what they see on screen, use this to locate the issue:

**Gemeente sidebar:** DOORSTROOM (Regiekamer, Aanmeldingen) · CAPACITEIT (Matching, Reacties, Plaatsingen) · ONDERSTEUNING (Acties) · NETWERK · BEHEER (Documenten, **Audittrail**, Instellingen)

**Provider sidebar:** WERK (**Reacties** is their main working area, Intake, Mijn aanvragen) · ONDERSTEUNING (Nieuwe aanvraag, Documenten)

**Key button names:**
- Create case: **Nieuwe aanmelding** (button on Aanmeldingen page — not in sidebar nav)
- Validate route: **Valideer matching** (appears in next-best-action panel on Toetsing tab)
- Send to provider: **Stuur naar aanbieder** (on Matching tab)
- Provider accept: **Accepteren** · Provider decline: **Afwijzen**
- Confirm placement: **Bevestig plaatsing** → confirm dialog → **Bevestig**
- Rematch: **Her-match casus** (appears in next-best-action after provider declines)

**Key tab names (case detail):** Overzicht · Aanmelding · Documenten · Activiteit · **Toetsing** (appears when case is ready for validation) · Matching · Arrangement

---

## Playbook 1 — User cannot log in

**Reported as:** "Ik kan niet inloggen" / "Login fails"

```
1. Ask: exact error message? (wrong password / account locked / 500 error)

2. Wrong password:
   → From Render shell:
   python manage.py shell -c "
   from django.contrib.auth import get_user_model
   User = get_user_model()
   u = User.objects.get(username='<USERNAME>')
   u.set_password('TEMP_NEW_PASSWORD')
   u.save()
   print('Password reset.')
   "
   → Send new temp password via secure channel
   → Instruct user to change immediately via Instellingen → Algemeen

3. Account locked (too many attempts):
   → From Render shell:
   python manage.py shell -c "
   from django.contrib.auth import get_user_model
   User = get_user_model()
   u = User.objects.get(username='<USERNAME>')
   u.is_active = True
   u.save()
   print('Unlocked.')
   "

4. 500 error on login page:
   → Check Sentry — likely a DB or settings issue
   → Escalate to infrastructure check (/_health/)
```

---

## Playbook 2 — User cannot find where to start

**Reported as:** "Waar maak ik een nieuwe casus aan?" / "Ik zie geen Nieuwe casus knop"

This is a documentation-gap issue, not a system bug. The create button is not in the sidebar nav.

```
Tell the user:
  1. Click "Aanmeldingen" in the left sidebar (under DOORSTROOM)
  2. The "Nieuwe aanmelding" button is at the top right of that page
  3. A four-step wizard opens: Casus → Matching → Aanbieder beoordeling → Plaatsing
  4. Fill in Gemeente, Gewenste startdatum, Uiterste plaatsingsdatum, 
     Zorgbehoefte categorie, and Persoonsbeeld
  5. Click "Volgende stap" to advance through each step
  6. Click "Casus aanmaken" on the final step

If Toetsing tab is not visible after creation:
  → The case has missing fields. A "Casus is nog niet compleet" banner
    appears on the Overzicht tab — complete those fields first.
```

---

## Playbook 3 — Case stuck in wrong workflow state

**Reported as:** "Case toont verkeerde status" / "Kan stap niet voltooien"

```
1. Ask user: case reference (ID from URL), what they see on screen,
   last action they took.

2. Check actual state:
   python manage.py shell -c "
   from contracts.models import CaseIntakeProcess
   intake = CaseIntakeProcess.objects.get(pk=<CASE_ID>)
   print(f'State: {intake.workflow_state}')
   print(f'Status: {intake.status}')
   "

3. Valid state transitions:
   DRAFT_CASE → SUMMARY_READY → MATCHING_READY
   → GEMEENTE_VALIDATED → PROVIDER_REVIEW_PENDING
   → PROVIDER_ACCEPTED → PLACEMENT_CONFIRMED

   PROVIDER_REJECTED → MATCHING_READY  (only rematch path)

4. Match state to what the user should see on screen:
   MATCHING_READY / GEMEENTE_VALIDATED  → next action: "Valideer matching"
                                           then "Stuur naar aanbieder"
   PROVIDER_REVIEW_PENDING              → context rail: "Wacht op aanbiederreactie"
   PROVIDER_ACCEPTED                    → next action: "Bevestig plaatsing"
   PROVIDER_REJECTED                    → next action: "Her-match casus"
   PLACEMENT_CONFIRMED                  → status: "Plaatsing bevestigd"

5. If state is correct but UI shows wrong value:
   → Hard refresh (Ctrl+Shift+R). SPA may have stale state.

6. If state is genuinely wrong:
   → Do NOT manually set workflow_state via shell without explicit lead approval
   → Log the discrepancy: case ID, expected state, actual state, how it got there
   → Treat as potential code bug; check Sentry for errors around that case
   → Only correct manually if blocking pilot and you understand the cause

7. Document the incident in PILOT_INCIDENT_LOG.md
```

---

## Playbook 4 — Provider not receiving notifications

**Reported as:** "Aanbieder heeft geen melding ontvangen" / bell count not updating

```
1. Verify in-app notification was created:
   python manage.py shell -c "
   from contracts.models.governance import Notification
   from contracts.models import CaseIntakeProcess
   intake = CaseIntakeProcess.objects.get(pk=<INTAKE_ID>)
   notifs = Notification.objects.filter(
       message__contains=str(intake.pk),
       notification_type='APPROVAL'
   )
   print(f'{notifs.count()} notification(s) created')
   for n in notifs:
       print(f'  recipient={n.recipient.username} is_read={n.is_read}')
   "

2. If 0 notifications:
   → The Stuur naar aanbieder action may have failed silently (check Sentry)
   → Check application log for:
     "notify_provider_review_requested: provider client X has no active members"
     (provider org has no users — see provisioning)

3. Tell provider: notifications appear on the Reacties page in the sidebar.
   The bell icon also shows a count. Both update on next page load — not in real time.
   Ask provider to navigate to Reacties and refresh.

4. If in-app notification exists but email not received:
   a) Check application log for:
      "notify_provider_review_requested: no contact email for provider client X"
      → Fix: set Client.primary_contact_email
      python manage.py shell -c "
      from contracts.models import Client
      c = Client.objects.get(pk=<CLIENT_ID>)
      c.primary_contact_email = 'correct@provider.nl'
      c.save(update_fields=['primary_contact_email'])
      "
   b) Check for:
      "notify_provider_review_requested: failed to send email"
      → EMAIL_HOST or credentials misconfigured
      → Verify EMAIL_HOST in Render environment variables
      → Test: python manage.py shell -c "
        from django.core.mail import send_mail
        send_mail('Test', 'Test body', None, ['you@test.nl'])
        print('Sent.')
        "

5. If email config confirmed broken:
   → Set EMAIL_HOST credentials in Render dashboard
   → Trigger a test send
   → Manually inform provider via direct message while email is fixed
```

---

## Playbook 5 — Capacity error (409 on placement confirmation)

**Reported as:** "Plaatsing mislukt — geen capaciteit" / 409 error in browser network tab

```
1. This is working as designed. The 409 means the provider's capacity is 0
   or was consumed by a concurrent request.

2. Check current capacity:
   python manage.py shell -c "
   from contracts.models.providers import Zorgaanbieder
   from contracts.models import Client
   client = Client.objects.get(pk=<PROVIDER_CLIENT_ID>)
   za = getattr(client, 'zorgaanbieder', None)
   if za:
       for v in za.vestigingen.all():
           for cr in v.capaciteit_records.order_by('-recorded_at')[:1]:
               print(f'Vestiging={v.name} beschikbaar={cr.beschikbare_capaciteit} open_slots={cr.open_slots}')
   else:
       print('No Zorgaanbieder linked')
   "

3. If capacity is 0 but should be higher:
   → Contact pilot lead for capacity record update
   → Do NOT update capacity records via shell without lead approval

4. If capacity is > 0 but still getting 409:
   → Possible race condition resolved correctly (second of two concurrent requests)
   → Reload page and try again
   → If persistent: Sentry investigation needed
```

---

## Playbook 6 — Potential cross-tenant data leak

**Reported as:** "Ik zie casussen van een andere organisatie"

**TREAT AS P1. Act immediately.**

```
1. Ask user: what did they see exactly? (screenshot if possible)
   Do not ask them to navigate further.

2. Immediately check for real leakage:
   python manage.py shell -c "
   from contracts.tenancy import get_user_organization
   from django.contrib.auth import get_user_model
   User = get_user_model()
   u = User.objects.get(username='<REPORTING_USER>')
   org = get_user_organization(u)
   if org:
       print(f'User org: {org.slug}')
   "

3. If real leakage confirmed:
   a) Immediately disable the affected user account:
      python manage.py shell -c "
      from django.contrib.auth import get_user_model
      User = get_user_model()
      u = User.objects.get(username='<USER>')
      u.is_active = False
      u.save()
      print('Account disabled.')
      "
   b) Notify all affected organisation contacts
   c) Raise P1 — do NOT proceed with pilot until root cause is found
   d) Document: incident timestamp, affected users, data scope
   e) This is a potential AVG breach — document for 72h notification assessment

4. If false alarm (user confused about context):
   → Explain the sidebar — providers only see Reacties, Intake, Mijn aanvragen
   → Document as P3 UX issue
```

---

## Playbook 7 — Application returning 500 errors

**Reported as:** Error page, blank screen, or API returning 500

```
1. Check /_health/:
   curl -s https://www.carelane.nl/_health/
   → {"status": "ok"} = app is up; problem is specific to that endpoint
   → {"db": "error"} = database issue; check Supabase connection pool
   → 500 or no response = app is down; check Render service status

2. Check Sentry for the error:
   → Look for the stack trace
   → Note correlation_id from the error (shown in Render logs and Sentry)

3. Check Render logs:
   → Dashboard → carelane-web → Logs
   → Filter for ERROR or CRITICAL level

4. Common causes during pilot:
   a) DB connection pool exhausted (Supabase free tier = 10 connections max)
      → Reduce GUNICORN_WORKERS to 1 in Render env vars
   b) Redis unavailable
      → Check carelane-redis service in Render dashboard
   c) New deploy with broken code
      → Immediately rollback via Render dashboard (< 2 min)

5. If resolution not clear within 15 minutes:
   → Rollback to last known good deploy
   → Notify pilot users of the interruption
   → Investigate root cause on staging before redeploying
```

---

## Playbook 8 — Audit trail concerns

**Reported as:** "We can't see an event that should be logged" / concern about completeness

```
1. The audit trail is accessed via "Audittrail" in the sidebar (BEHEER section).
   It is not called "Audit log". Direct the user there first.

2. If the user can reach Audittrail but a specific event is missing,
   query from Render shell:
   python manage.py shell -c "
   from contracts.models import AuditLog
   entries = AuditLog.objects.filter(
       model_name='CaseIntakeProcess',
       object_id=<INTAKE_ID>
   ).order_by('timestamp')
   for e in entries:
       print(f'{e.timestamp} | {e.action} | {e.user} | {e.object_repr}')
   "

3. Also check decision events:
   python manage.py shell -c "
   from contracts.models import CaseDecisionLog
   logs = CaseDecisionLog.objects.filter(case_id=<INTAKE_ID>).order_by('timestamp')
   for l in logs:
       print(f'{l.timestamp} | {l.event_type} | {l.user_action}')
   "

4. If a log is missing:
   → Check if the action was completed in the UI (vs. interrupted)
   → Check Sentry for errors around that time
   → GovernanceLogImmutableError in logs = modification attempt (security alert)

5. The audit trail is append-only. A missing entry means the action did not
   complete successfully — not that a record was deleted.
```

---

## Support log template

For every P1/P2 incident, log in `PILOT_INCIDENT_LOG.md`:

```markdown
## Incident — [DATE]

- **Reporter:** [user/org name]
- **Severity:** P1 / P2 / P3
- **Time reported:** HH:MM CET
- **Description:** [what they reported]
- **Root cause:** [what was found]
- **Resolution:** [what was done]
- **Time resolved:** HH:MM CET
- **User impact:** [who was affected, for how long]
- **Follow-up required:** yes/no — [if yes, what]
```
