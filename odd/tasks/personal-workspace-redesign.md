# Personal engineering workspace — depth, hierarchy, palette

Objective: raise the existing terminal dashboard from a flat set of equal panels to a
layered workspace — three surfaces, defined borders, differentiated typography — and give
it one keyboard entry point (command palette). Keep the terminal/Linux identity and the
mosaic; do not become a template.
Stack: React 19 + Vite 8 + hand-written CSS (Tailwind provides Preflight only).
No git repository exists, so work-unit commits are not possible; each task records its
verification evidence instead.
Runner: `pnpm typecheck`, `pnpm build`, `pnpm format:check`, `node odd/audit-contrast.mjs`.

## Specs

**S1 — Palette.** `Cmd+K` and `Ctrl+K` open a command palette; `Esc` closes it; `↑` `↓`
move the selection; `Enter` runs it; typing filters on label and group. It exposes every
panel (About, Projects, Experience, Stack, Contact, Notes, Interests) plus GitHub,
LinkedIn, X, email and the CV. Choosing a panel scrolls to it and moves focus to the
section. Focus returns to where it was only when no command was chosen.

**S2 — Surfaces.** Exactly three depths: `--bg #080a13` (desktop), `--surface #0d111b`
(panels), `--surface-hi #171e2b` (window chrome and the detail window). Borders
`--edge #30394a`, internal hairlines `--rule #1a2230`.

**S3 — Accents.** Blue `#55b8f5` = links, projects, interactive text. Purple `#c49af5` =
identity, philosophy, interests. Green `#83d49b` = active state and availability. Text
`#d5dce7`, secondary `#9aa5b7`, tertiary `#8994a6`.

**S4 — Contrast.** Every text colour in `src/index.css` reaches 4.5:1 against the lightest
surface it is painted on. `node odd/audit-contrast.mjs` reports zero failures; no text
below 13px.

**S5 — Typography split.** Monospace for terminal chrome, filenames, commands and
metadata. A restrained proportional face for the introductory paragraphs and the
philosophy line only. No new font dependency: the system UI stack.

**S6 — Identity panel.** `whoami` carries more weight than the other panels: a larger
name, a brighter border and an active-state ring on the avatar. No new decorative lines.

**S7 — Title bars.** Every title bar states what the window is and, where the data is
real and derived, a count (`6 projects`, `4 entries`, `22 tools`, `5 channels`). No git
branch names: the branch state of those repositories is not verifiable from here, and the
page does not print claims it cannot support.

**S8 — Status bar.** Prompt, command-palette hint, environment and a real local clock
(`HH:MM`, 24h, refreshed every 15s). No fake metrics, no visitor counters.

**S9 — Landmarks.** Every panel `<section>` has an accessible name through
`aria-labelledby`, so the seven regions are navigable instead of anonymous.

**S10 — Copy.** The intro and philosophy come verbatim from the brief:
"Hey, I'm Andrés." / "I enjoy understanding how things work and building software that
makes them work better." / "I'm interested in backend engineering, Linux, system
architecture, automation and the intersection of software and AI." / philosophy:
"I like simple solutions to complex problems."

**S11 — Motion.** All new transitions are opacity/colour only, ≤160ms, and disabled under
`prefers-reduced-motion`. The palette scroll honours the same preference (instant instead
of smooth).

**S12 — Stack.** Stays React 19 + Vite. Astro is declined for this repository: the scaffold
is a Figma Make project whose `vite.config.ts` plugin owns HMR, HTML transforms and build
metadata, the repository is not under git, and the brief forbids unnecessary rewrites.

## Tasks

| ID  | Specs                            | Route  | Status                                  |
| --- | -------------------------------- | ------ | --------------------------------------- |
| T1  | S2, S3, S4                       | inline | done                                    |
| T2  | S5, S6, S7, S10                  | inline | done                                    |
| T3  | S9                               | inline | done                                    |
| T4  | S1, S11                          | inline | done                                    |
| T5  | S8                               | inline | done                                    |
| T6  | S2 (viewer elevation)            | inline | done                                    |
| T7  | Responsive pass                  | inline | pending — needs a browser, not just CSS |
| T8  | Git timeline connectors          | inline | pending                                 |
| T9  | File-tree language for interests | inline | pending                                 |

## Log

**L1** (user, faithful consolidation of an 11-section brief): redesign the site as a
"personal engineering workspace": Linux workstation + tiling windows identity, dark navy,
three surfaces, thin borders, three accents, no gradients/glass/neon, no fake metrics,
no invented project or employment facts. Panels: `whoami`, `ls ~/projects`,
`git log --experience`, `bat -p stack.toml`, `./connect.sh`, `bat notes.md`,
`nvim interests.md`. Add a Raycast-style command palette on Cmd/Ctrl+K, a bottom status
bar with environment and optional local clock, restrained micro-interactions, intentional
tablet and mobile layouts, and prefer Astro while not rewriting what works.

**L2** Inspection. The repository is a Figma Make React 19 + Vite 8 scaffold; Astro is
declined (S12). `odd/audit-contrast.mjs` measures every `color:` declaration against the
lightest surface token, so introducing `--surface-hi` automatically re-bases every
audit — the muted pair had to be re-derived to keep two readable levels.

**L3** S3 palette checked by hand before writing: `#8994a6` on `#171e2b` is 5.45:1 and
`#9aa5b7` is 6.71:1, so the two-step muted scale survives the elevated surface. The old
`#7d8590` would have been 4.48:1 there — it would have failed by 0.02.

**L4** Verification after T1–T6: `pnpm typecheck` exit 0; `node odd/audit-contrast.mjs`
0 failures over 70 colour declarations (minimum font size 13px, maximum 24px);
`pnpm format:check` clean over 27 files; `pnpm build` succeeds (CSS 22.27 kB / 5.79 kB
gzip, JS 242.66 kB / 80.03 kB gzip).

**L4b** Two defects found by reading, not by a browser: the palette's `onClose` prop was
an inline arrow, so any parent re-render tore down the focus/scroll-lock effect and pulled
focus out of the field (fixed with `useCallback`); and choosing a project from the palette
let the palette's focus restore steal focus back from the detail window (fixed by marking
that command as focus-moving).

**L5** Known limits. Layout was reasoned from the CSS, not measured in a browser: the
profile panel gained a third intro paragraph and may scroll at 1440×713. The experience
timeline connectors, the interests file-tree and the full responsive pass stay open.

**L6** (user, verbatim): "mm no me gusta, vuelve a como estaba antes" — asked for the
whole second iteration to be reverted, not a single piece. Reverted: featured project cards,
the editorial whoami (headline, 72px portrait, merged role line, purple quote), the git rail
on the experience log, the end-of-file markers, the copy toast, the status-bar centre slot,
the mobile area reorder and the `DECORATIVE` exemption in the audit script. The palette,
the three-surface system, the elevated title bars and the monospace/proportional split stay.

**L7** Recorded for the next iteration: project prominence has now been rejected twice — the
grey left edge in this file's older history, and the elevated cards with stack chips. The six
projects stay one uniform list. Do not reintroduce a featured distinction without the owner
asking for it by name.

**L8** Verification after the revert: `pnpm typecheck` exit 0; audit back to 70 declarations,
0 failures, minimum font size 13px; `pnpm build` succeeds (CSS 22.27 kB / 5.79 kB gzip,
JS 242.77 kB / 80.04 kB gzip).
