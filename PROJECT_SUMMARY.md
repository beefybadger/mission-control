# PROJECT SUMMARY: Local Gap-Filler AI Agency

## 1. The Core Concept
The "Gap-Filler" Agency identifies and plugs revenue leaks in local businesses by providing an autonomous, 24/7 AI Receptionist for Google Business Profile (GBP) Chat and missed calls. We sell **Speed-to-Lead** as a service.

## 2. The Prototype (MVP)
- **File:** `receptionist.py`
- **Function:** Receives inbound customer messages, references a Business Knowledge Base, qualifies the lead, and attempts to secure a booking (Address/Phone).
- **Target Response Time:** < 5 seconds.

## 3. The Tech Stack (Headless)
- **Orchestration:** n8n (Self-hosted on VPS).
- **Intelligence:** Gemini 2.0 Flash (Fast & Cost-Efficient).
- **Database:** Supabase (Lead storage & transcript logging).
- **Security:** Zero-Trust architecture via Tailscale tunnel.
- **Compliance:** GDPR-First (EU residency, 14-day auto-purge).

## 4. Monetization (Tiered Units)
- **Tier 1 ($199/mo):** 'The Hook' - AI Text-Back & GBP Chat.
- **Tier 2 ($399/mo):** 'The Pro' - Automated Google Calendar Booking.
- **Tier 3 ($799/mo):** 'The Engine' - Multi-channel & CRM Integration.

## 5. Execution Strategy
- **Robert (Owner):** High-level oversight and sales via "Product-Led" trials.
- **Baron (CTO):** Infrastructure, code production, and security.
- **The "No-Expertise" Advantage:** We sell a working prototype trial, not technical consulting.

## 6. Current Status
- [x] Secure Infrastructure (Tailscale)
- [x] Strategic Roadmap (Notion)
- [x] Initial Prototype Engine (`receptionist.py`)
- [ ] Live Sandbox Testing
