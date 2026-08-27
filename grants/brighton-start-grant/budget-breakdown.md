# START Grant — Detailed Budget

Supporting detail for the £300 request. Not part of the 500-word proposal — bring this to the
Student Enterprise progress meetings, where spend has to be accounted for.

| # | Item | Cost | Why it matters | Evidence of impact |
|---|------|------|----------------|--------------------|
| 1 | Anthropic Claude API credits | £120 | Powers the AI tutor (`api/chat.js`). Currently paid personally; usage scales with every new user. | ~6 months of runway at current volume; cost per active user from PostHog event counts |
| 2 | Paid collaborations with medical student creators | £100 | The primary acquisition channel. Micro-influencers (5k–30k followers) on TikTok and Instagram charge roughly £30–75 per post — 2–3 collaborations, or gifted-plus-fee deals. | Referral traffic and sign-ups per post; cost per acquired user, compared against organic |
| 3 | Brand and share-asset kit | £80 | Link-preview (OG) image, favicon and app icon set, apple-touch-icon, plus 2–3 short demo clips for creators to use. The site currently references `og-image.png`, which does not exist — every shared link renders a blank preview. | Click-through rate on shared links before vs. after; share-to-visit conversion |
|   | **Total** | **£300** | | |

## What the grant buys, in one line

Six months of AI tutor runway, a paid test of the creator channel, and the share assets that
channel depends on to convert.

## Why these three, and not the obvious alternatives

- **Domain** — already owned and live, so no cost.
- **Print and flyers** — acquisition is running through medical student creators online, not campus footfall.
- **Event prizes** — not planned; spend is going to creators whose audiences already exist.
- **Trademark registration (£170, one class)** — eligible under the guidance, but "MLA Conditions"
  is descriptive of the service and risks refusal under s.3(1)(c) of the Trade Marks Act 1994. The
  fee is non-refundable, so this is deferred until there is a stylised mark worth protecting.

## Milestones for the two 6-month progress meetings

**Meeting 1 (≈3 months in)**
- Share assets shipped: OG image, app icons, demo clips
- First paid creator collaboration live, with referral tracking in place
- Baseline metrics reported: weekly active users, average session length, AI questions per week

**Meeting 2 (≈6 months in)**
- 500 weekly active users targeted
- Cost per acquired user established for the creator channel
- Willingness to pay tested for the £4.99/month tier, with retention data behind the decision

## Costs deliberately not in this ask

- Hosting — Vercel free tier is sufficient at current scale
- Analytics — PostHog free tier
- Database and auth — Supabase free tier
- Development — self-built, no contractor cost
