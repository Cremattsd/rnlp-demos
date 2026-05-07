# RealNex Listings Pro QA Checklist

Use this checklist before tagging the v3.5.0 release or publishing demo builds.

## API and Licensing

- [ ] Valid license validates successfully.
- [ ] Invalid license shows "Invalid license" without exposing raw API payloads.
- [ ] Expired license shows "Expired license" or subscription status clearly.
- [ ] Missing company ID/company key blocks listing sync with a clear admin message.
- [ ] Company ID mismatch is handled without rendering stale listings.
- [ ] API unavailable shows "Listings are temporarily unavailable."
- [ ] Production API base is `https://api.initial3development.com/`.
- [ ] Root API 404 does not mark the plugin broken if `/health`, `/version`, and endpoint calls work.
- [ ] `/health` returns service `realnex-marketplace-proxy` and status `ok`.
- [ ] `/version` returns service `realnex-marketplace-proxy`, version, and production environment.
- [ ] No localhost, staging, Render default, Supabase secret, RealNex secret, database URL, admin key, or private API response appears in page source.

## Data States

- [ ] No listings displays "No listings found. Try adjusting your filters."
- [ ] One listing renders without layout gaps.
- [ ] Many listings render with pagination and responsive grid behavior.
- [ ] For Sale listings show correct status and pricing fields when available.
- [ ] For Lease listings show correct status and rate fields when available.
- [ ] Missing price/rate hides the field without blank labels.
- [ ] Missing image uses branded fallback.
- [ ] Broken image URL falls back cleanly.
- [ ] Portrait image renders intentionally, without stretch or distortion.
- [ ] Huge landscape image fills the media area without layout shift.
- [ ] Undefined/null values never appear in listing cards, detail views, or filters.

## Layouts and Design

- [ ] Full Grid renders cards, filters, pagination, and detail CTA.
- [ ] Grid + Map renders listings and a safe map placeholder when lat/lng is missing.
- [ ] Hero + Grid renders a featured listing and remaining grid.
- [ ] List View renders compact CRE rows with CTA.
- [ ] Brand color picker updates `--rnx-primary` and keeps readable contrast.
- [ ] Dark mode applies readable backgrounds, cards, borders, and text.
- [ ] Light mode applies readable backgrounds, cards, borders, and text.
- [ ] Font selector applies system, Inter, serif, and modern font options.
- [ ] Each premium template still has a distinct visual personality.

## Detail Behavior

- [ ] Popup detail mode opens without page jump.
- [ ] Popup detail mode closes with Escape.
- [ ] Popup detail mode closes from the close button.
- [ ] Popup detail mode closes on backdrop click.
- [ ] Full page mode opens a safe detail URL fallback when routing is not configured.
- [ ] Brochure/OM CTA appears only when a URL exists.
- [ ] Share button works or degrades gracefully.
- [ ] Broker/contact CTA is obvious and never displays empty contact fields.

## WordPress Admin

- [ ] Settings save requires nonce and admin capability.
- [ ] License key is sanitized and not printed into public frontend JavaScript.
- [ ] Company ID/company key input is sanitized.
- [ ] API/proxy base URL is sanitized and configurable in one place.
- [ ] Admin shows connected API environment, version, and base URL.
- [ ] Admin shows connection status, company source status, and last sync/check time.
- [ ] Shortcode is visible and copyable.
- [ ] Iframe/embed code is visible, responsive, and copyable.
- [ ] Manual refresh/sync action works and updates last check time.

## Frontend Integration

- [ ] Shortcode rendering works in native/self-hosted mode.
- [ ] Iframe embed renders from production proxy URLs.
- [ ] Generated embed code contains no stale staging or localhost URLs.
- [ ] CSS remains scoped under the plugin/demo wrapper.
- [ ] Scripts and styles load only where needed in WordPress.
- [ ] Demo diagnostics appear only when debug mode is enabled.
- [ ] Render failures are logged with mount status, layout, template, fetched count, and caught errors.

## Responsive Matrix

- [ ] Mobile 320px.
- [ ] Mobile 390px.
- [ ] Tablet.
- [ ] Desktop.
- [ ] Common builder/theme page containers.

## Demo Pages

- [ ] `darkpro-broker.html`
- [ ] `classic-broker.html`
- [ ] `ember-company.html`
- [ ] `steel-company.html`
- [ ] `hcbre-replica.html`
- [ ] `property-detail.html`
- [ ] `iframe-demo.html`
- [ ] `mp-premier-demo.html`
- [ ] `activate.html`

## Steve Smoke Test

- [ ] Open each broker/company demo with `?debug=1`.
- [ ] Confirm each demo renders listing cards.
- [ ] Confirm each demo opens popup detail.
- [ ] Confirm each demo supports `?detail=full_page` without breaking card CTA.
- [ ] Confirm browser console has no fatal JavaScript errors.
- [ ] Confirm inquiry modal opens from popup detail.
- [ ] Submit a safe test inquiry: Steve Test, `steve-test+{timestamp}@example.com`, `555-0100`.
- [ ] Confirm public success message is exactly: "Thanks. Your inquiry was sent to the listing team."
- [ ] Confirm public UI does not mention CRM internals, project IDs, JWT, Supabase, Render, or raw API errors.
- [ ] Confirm no CRM JWT path saves/queues the lead and returns public success.
- [ ] Confirm CRM JWT path is optional and skipped/simulated when no CRM JWT exists.
- [ ] Confirm future CRM JWT path searches/creates contact, searches/creates project, links lead where supported, and creates history where supported.
- [ ] Confirm broker email sends through a provider when configured, or simulates/queues with admin-only warning when no provider exists.
- [ ] Confirm missing broker email falls back to configured company/admin email, then `LEAD_EMAIL_FALLBACK`.
- [ ] Confirm `/health` returns HTTP 200 after proxy deployment.
- [ ] Confirm `/version` returns HTTP 200 after proxy deployment.
- [ ] Confirm `/listings` returns listing data after proxy deployment.
- [ ] Confirm root API 404 is treated as non-fatal by plugin/admin status.
- [ ] Prefer root API health response after proxy deployment to avoid confusion.
- [ ] Confirm Google/Regrid powered tiles are hidden when keys are missing.
- [ ] Confirm WalkScore/Census/Geoapify/NREL data appears only when available and never blocks rendering.
