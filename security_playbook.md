# VenuePro Enterprise Security & Abuse Prevention Playbook

This playbook establishes a robust security design, threat models, and proactive defense procedures for **VenuePro** in production. It specifically addresses **OWASP Top 10 vulnerabilities**, **Supabase multi-tenant isolation**, **paid API spend constraints**, **Indian regulatory compliance (DPDP Act & GST)**, and **automated abuse scenarios**.

---

## 🛡️ 1. OWASP Top 10 Risk Mitigation Matrix

VenuePro's architecture employs serverless frontends (Vite/React) communicating directly with secure serverless backends (Supabase PostgreSQL). Here is how we mitigate core risks:

### A01:2021-Broken Access Control
*   **Threat:** Tenant A tries to access event bookings, payments, or client leads belonging to Tenant B by guessing UUIDs.
*   **Mitigation:** 
    *   **Postgres Row Level Security (RLS)** is strictly active on all tables.
    *   Tenant isolation relies on a security-definer helper function `get_current_org_id()`, which resolves the logged-in user's profile context directly inside PostgreSQL:
        ```sql
        CREATE OR REPLACE FUNCTION get_current_org_id()
        RETURNS UUID AS $$
          SELECT org_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
        $$ LANGUAGE sql SECURITY DEFINER;
        ```
    *   Every row query, update, or deletion enforces:
        ```sql
        USING (org_id = get_current_org_id())
        ```

### A03:2021-Injection (SQLi & XSS)
*   **Threat (SQL Injection):** Malicious inputs in search fields or booking forms designed to escape queries and dump tables.
*   **Mitigation:** 
    *   **PostgREST Integration:** All database queries utilize the official Supabase Javascript SDK. PostgREST handles query interpretation by automatically compiling calls into highly sanitized, parameterized PostgreSQL prepared statements. Raw string-concatenated SQL queries are never executed in client code.
*   **Threat (Cross-Site Scripting - XSS):** Storing malicious `<script>` tags in Customer Names or Booking Notes to hijack operator sessions.
*   **Mitigation:** 
    *   React automatically escapes all dynamic expressions (`{value}`) inside HTML JSX before rendering.
    *   Codebase audit verifies **zero uses** of React's `dangerouslySetInnerHTML`.
    *   Enforce a strict Content Security Policy (CSP) header (see Section 4).

### A07:2021-Identification and Authentication Failures
*   **Threat:** Brute-force attacks guessing passwords of venue operators.
*   **Mitigation:**
    *   Enforce multi-factor authentication (MFA) via Supabase Auth settings.
    *   Limit password validation attempts at the gateway (configured in Supabase Kong gateway limits).

---

## 🚦 2. API Rate Limiting Architecture

Since the client contacts Supabase APIs directly, rate limits are managed at the **Kong API Gateway** overlay and inside PostgreSQL.

### A. Kong Gateway Configuration (Supabase Dashboard)
Configure the following limits under **Auth Settings > Rate Limits** to protect against API flooding:

| Endpoint | Target Limit | Action Upon Breach |
| :--- | :--- | :--- |
| `/auth/v1/signup` | 3 per IP per hour | HTTP 429 Too Many Requests |
| `/auth/v1/token` (Login) | 15 per IP per minute | HTTP 429 Too Many Requests |
| `/auth/v1/recover` | 3 per IP per hour | HTTP 429 Too Many Requests |
| `/rest/v1/*` (Database) | 1000 per user per minute | Connection throttling |

### B. Protection Against Booking Denial-of-Service (Database Level)
*   **Threat:** A competitor uses automated scripts to book every available slot on the calendar tentatively, locking out authentic clients.
*   **Mitigation (Auto-Expiry Cron Job):** Deploy a database cron job using `pg_cron` that automatically releases "Hold" bookings if they are not confirmed with an advance deposit payment within 24 hours.

```sql
-- SQL Script to schedule tentative hold releases
CREATE OR REPLACE FUNCTION expire_stale_holds()
RETURNS void AS $$
BEGIN
  UPDATE bookings
  SET status = 'cancelled',
      internal_notes = COALESCE(internal_notes, '') || ' [System Expired: Hold duration exceeded 24h without payment]'
  WHERE status = 'hold'
    AND created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Schedule the job to run hourly
SELECT cron.schedule('release-holds-hourly', '0 * * * *', 'SELECT expire_stale_holds()');
```

---

## 💸 3. Paid API Spend Limits & Hard Caps

VenuePro utilizes external paid interfaces (Google Maps Places API, WhatsApp Business API via Twilio, and Email services). We establish strict thresholds to prevent run-away bills.

### A. Google Cloud Platform (Google Maps API)
*   **Mitigation:**
    1.  **Restrict API Keys:** Configure HTTP Referrer restrictions in the GCP Console so keys only execute on `*.venuepro.in`.
    2.  **Daily Quota Hard Cap:** In the Google Cloud Console, navigate to **APIs & Services > Google Places API > Quotas**. Set a strict cap of **1,000 requests/day** (well within standard free tier limits). This guarantees you will never exceed your target budget.
    3.  **Billing Alerts:** Configure GCP billing alerts at $10/month and $50/month thresholds to notify engineering immediately.

### B. Twilio & SMS Gateways (WhatsApp quick actions)
*   **Mitigation:**
    1.  We utilize **Client-Side Intent Redirects** (e.g., `https://wa.me/` protocol) for general WhatsApp communication. This costs **$0** in SaaS infrastructure spend as it routes through the operator's local device!
    2.  For backend notification flows, configure **Twilio Segment Spending Limits**. Set a hard limit of **$20/month** in the Twilio Account Console. If reached, API requests fail safely without accumulating unexpected costs.

---

## 🔒 4. Production Security Headers

To mitigate clickjacking, MIME sniffing, and connection downgrades, the hosting provider (e.g. Vercel, Netlify, or AWS) must inject the following headers on all responses:

```http
# HSTS (Enforce HTTPS)
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload

# Prevent Clickjacking
X-Frame-Options: DENY

# Disable MIME Sniffing
X-Content-Type-Options: nosniff

# Referrer Policy
Referrer-Policy: strict-origin-when-cross-origin

# Content Security Policy (Sanitized for Supabase connections)
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co; img-src 'self' data: https://*.supabase.co;
```

---

## 🇮🇳 5. Indian Regulatory Compliance Architecture

### A. Digital Personal Data Protection (DPDP) Act, 2023
As a **Significant Data Fiduciary** in India, VenuePro implements the following technical measures:
1.  **Consent Managers:** Public booking inquiries gather explicit, clear consent regarding the handling of phone numbers and email details.
2.  **Right to Erasure ("Right to be Forgotten"):** If a venue organizer deletes a customer profile, the database cascade policies execute hard deletions on all linked bookings and transaction records within 72 hours.
3.  **Data Protection Officer (DPO):** Our privacy policy lists an active compliance contact (compliance@venuepro.in) to resolve consumer queries promptly.

### B. GST & Tax Audit Compliance
*   **Invoice Records:** Financial updates to the `payments` and `bookings` tables trigger immutable event logs. Confirmed invoices containing GSTIN and PAN details cannot be modified retroactively by operators, satisfying the audits required under Indian commercial legislation.
