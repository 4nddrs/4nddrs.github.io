# Portfolio hardening — 4nddrs

Objective: fix the seven defects found in the code review (SEO shell, layout overflow, WCAG contrast, styling architecture, missing typecheck, clipboard error handling, misc a11y/perf).
Branch: none (this directory is not a git repository — no commits are possible). Runner: none (no test framework); verification is `tsc --noEmit`, `vite build`, and scripted contrast/HTML assertions.

## Specs

- **S1** The document title is `4nddrs`. No `noindex`/`nofollow` meta tag and no `Disallow` robots.txt are emitted.
- **S2** `openGraph.image` and `icons.icon` are set so `og:image`, `twitter:card`, and `twitter:image` are emitted.
- **S3** Content is never unreachable: the page participates in normal document flow and the document scrolls when the viewport is shorter than the content. Vertical centering is preserved while the page fits.
- **S4** Every text color used in `src/index.css` reaches at least 4.5:1 contrast against the lightest background it is rendered on (`#0f1215` panel). Decorative-only separators are exempt and must not carry text.
- **S5** No text is rendered below 10px.
- **S6** `npm run typecheck` runs `tsc --noEmit` and exits 0.
- **S7** `npm run format:check` runs `oxfmt --check`.
- **S8** Clicking "copy email" never produces an unhandled rejection: success and failure both surface a visible state, and the state is announced through an `aria-live` region.
- **S9** The brand link navigates to `/`, never to `#`.
- **S10** The portrait `<img>` declares `width` and `height` so it reserves layout space.
- **S11** Font origins are preconnected in `index.html`.
- **S12** No unused CSS custom properties remain.
- **S13** Tailwind is a deliberate, documented dependency: its Preflight and cascade layers are load-bearing for the hand-written CSS, which uses zero utility classes.

## Tasks

| ID  | Specs            | Route  | Status |
| --- | ---------------- | ------ | ------ |
| T1  | S1, S2           | inline | done   |
| T2  | S3               | inline | done   |
| T3  | S4, S5, S12      | inline | done   |
| T4  | S13              | inline | done   |
| T5  | S6, S7           | inline | done   |
| T6  | S8, S9, S10, S11 | inline | done   |

## Log

**L1** (user): "si, arregla todo, la pagina se llama 4nddrs"

**L2** Decision — Tailwind stays. Measured: Preflight is 3,917 of 13,487 bytes of built CSS (29%), and total CSS gzips to 3.91 kB. The hand-written CSS depends on Preflight for `margin: 0` on `p`/`h1`/`figure`, `box-sizing`, `a { color: inherit; text-decoration: inherit }`, `button { background: transparent; font: inherit }`, and `img/svg { display: block }`. Removing it saves ~1 kB gzip, breaks the Figma Make scaffold convention documented in AGENTS.md, and requires hand-maintaining a reset with no visual regression test available. The fix is therefore to document the dependency, not to remove it.

**L3** Decision — muted palette collapsed to a two-token scale. Scripted search showed every failing color converges to ~`#777f85` when raised to 4.6:1, which would flatten the design's hierarchy. Instead: `--text-dim: #7a8288` for micro-labels/indices and `--text-soft: #8a9298` for real secondary text, both verified above 4.5:1 on `#0f1215`.

**L4** Verification evidence:

- `pnpm typecheck` → `tsc --noEmit` exit 0.
- `pnpm build` → 17 modules, `dist/index.html` 1.58 kB, CSS 13.70 kB (3.85 kB gzip), built in 71ms.
- `node odd/audit-contrast.mjs` → 33 color declarations audited, **0** below 4.5:1 against `#0f1215`; minimum font-size 10px.
- `pnpm format:check` → "All matched files use the correct format" (17 files).
- `dist/` contains no `robots.txt`; served HTML has `<title>4nddrs</title>`, `og:image`, `twitter:card`, `twitter:image`, two `preconnect` hints, and **no** `noindex`.
- Compiled `.page` rule contains no `position: fixed` and uses `margin: auto`.

**L5** Known gaps: no test suite exists, so layout behavior at unusual viewport heights was verified by CSS reasoning and compiled-output inspection, not by a browser screenshot. `og:image` is a root-relative path; social crawlers require an absolute URL, which the deploy step must supply.
