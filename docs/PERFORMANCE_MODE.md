# Performance Modes

The website uses progressive enhancement so the content and navigation remain available on slow
connections and modest devices. The setting is stored in the visitor's browser only and is not
sent to analytics or any other service.

## Modes

- **Auto** is the default. It selects Lite when the browser reports Data Saver, `2g` or `3g`, high
  latency, low downlink bandwidth, constrained hardware, or reduced-motion preference. If the
  browser does not expose those optional APIs, Auto selects Standard.
- **Standard** starts the background video once the browser is idle and keeps inline PDF previews
  and Comunica/SPARQL search available.
- **Lite** retains the same pages, keyword search, and direct resource links, but keeps the
  background static, hides the Comunica/SPARQL query mode, and defers PDF/slide/poster previews
  until the visitor selects the corresponding `Load ... Preview` button.

Visitors can cycle modes with the performance button in the upper-right navigation bar. The
mobile navigation menu exposes the same control.

## Background Assets

`src/assets/abstract-dna-poster.webp` is a 1920x1080 WebP still derived from the existing
background MP4. It is intentionally small enough to be the first background request. The original
MP4 remains the Standard-mode enhancement and is only added to the page after an idle callback.

When updating the video, regenerate the poster with a visually representative frame. Keep the
replacement as WebP and check its dimensions and file size before committing it.

## Verification

1. Run `npm run build` and `npm run preview`.
2. Open the site in a private browser context so no prior preference is stored.
3. In Standard mode, verify the video fades in after the initial page settles, PDF previews render,
   and the Spotlight search exposes the SPARQL option.
4. Switch to Lite, refresh, then verify no video starts, Spotlight contains keyword search only,
   and every PDF-based detail page shows an explicit preview-load action before its PDF is fetched.
5. Switch back to Standard and navigate to a fresh detail page to verify the standard preview path.

Network Information and Device Memory APIs are not supported by every browser. This is expected:
the control remains available and Auto safely uses Standard when no constrained-device signal is
available.
