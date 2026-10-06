# Awaaz — India protest discovery prototype

**Tagline:** Know the cause. Check the facts. Find your voice.

An independent, non-partisan prototype that helps people understand publicly reported protests, check the evidence, and express themselves peacefully. It promises *auto-updating news coverage as a goal* — never "every protest live". It does not track individuals.

## Status at a glance (honest)

| Component | State |
|---|---|
| Map records (14) | **Fictional demo** — clearly labelled; sources link to example.org |
| GDELT DOC 2.0 "Latest reporting" | Real API, **fetched by the browser** on demand; unverified, **never mapped**. The normal fetch is blocked by CORS, so it now **falls back to JSONP**. The fallback loaded real headlines in one test and failed in another, when GDELT returned HTTP 429 (rate limited). On failure the UI shows a clean error with a "Try again" button. A production build should call GDELT server-side. |
| Event extraction / grouping | Not built |
| 15-minute ingestion job | **Not configured** (shown in header). A static site has no scheduler. |
| Submissions | Saved to `tables/submissions` with `review_status = pending_review`; never auto-published. If the API fails, the UI says "Demo — not submitted". |
| Slogan studio | **Template-based, not AI** (labelled) |
| Follow a cause | localStorage only; no notifications |

## Features
- **Atlas:** a Leaflet map of India (OpenStreetMap tiles) with clustering. Each status has its own **shape + letter**: circle A = Announced, diamond O = Reported ongoing, square E = Ended, triangle ? = Unknown. A dashed ring marks events located only to city level. Map markers and cards stay in sync both ways (hovering one highlights the other, and clicking either opens the event).
- **Filters:** search, state, cause, status, evidence type, event date range, followed causes, and sort order. Empty results say "No sourced events found for these filters."
- **Detail panel** (slides in from the right on desktop, bottom sheet on mobile): a "What do we actually know?" grid that keeps **status / evidence / freshness** separate, unresolved source conflicts flagged in red, a neutral summary, reported demands, a timeline, sources, and buttons for corrections and slogans.
- **"Why is this on the map?"** opens a modal with the location excerpt, date excerpt, source attribution and conflicts.
- **Directions rules** (`Atlas.directionsPolicy`): directions are offered only if the venue is published, the event is reviewed and not from a submission, its status is announced or ongoing, no sources conflict, and the latest source is under 72 hours old. Otherwise the button is disabled and the reason is shown. A "verify before travelling" warning always appears.
- **Slogan studio:** English, हिन्दी, मराठी, Hinglish and Marathi-English. Four tones and three formats (placard, chant, caption). Six editable options, each with copy and poster buttons. Blocked words and personal details (phone numbers, emails, handles, links) are caught. Poster preview on a canvas in 4 themes, downloadable as PNG, with the footer "User-generated slogan · not the platform's position".
- **Submit update:** a correction or a public announcement form. Requires a source URL, includes a privacy notice, and goes to a review queue.
- **How it works:** methodology, the proposed pipeline, safety rules and data sources.

## Entry URIs
- `index.html`: Atlas (default)
- `index.html#event=demo-004`: deep link that opens an event's detail panel
- `#reporting`, `#studio`, `#submit`, `#method`: the other views

## Data model
- Demo events (`js/data.js`): `id, title, cause, state, city, publicVenue, locationPrecision (venue|city), coordinates, eventStart, eventEnd, status (announced|ongoing|ended|unknown), evidence (news|organizer|submission), summary, demands[], timeline[], sources[{outlet,title,url,type,publishedAt}], supportingExcerpts{location,date}, conflicts[], sourcePublishedAt, lastFetchedAt, reviewedAt`. Timestamps are relative to page load, so they only demonstrate the freshness labels.
- Table `submissions`: `kind, event_id, field, title, state, city, public_venue, event_date, details, source_url, review_status`.

## Files
`index.html`, `css/style.css`, `js/data.js` (fictional data), `js/utils.js`, `js/atlas.js`, `js/news.js`, `js/slogans.js`, `js/submit.js`, `js/main.js`

## Not yet implemented / next steps
1. A server-side worker that queries GDELT DOC/GEO every 15 minutes, with the API key kept server-side and the CORS problem fixed.
2. Extraction of candidate events with supporting excerpts, a relevance filter, and a separate event date and article date.
3. Grouping of reports that describe the same event, plus a reviewer dashboard for new events, location changes and conflicts.
4. A real review workflow for submissions, with admin access protected by Hosted access rules rather than client-side checks.
5. AI slogan generation through a backend, with review by fluent speakers.
6. Opt-in notifications for followed causes, and an archive and state pages.
7. ACLED cross-checking, subject to its access and reuse terms.

## Public URL
Not deployed yet. Use the **Publish tab**, or ask for a Hosted Deploy.
