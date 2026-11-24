import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { EXPERIENCE, IDENTITY, INTERESTS, LINKS, PROJECTS, STACK, roleSlug } from "./content";
import { ExperienceView } from "./ExperienceView";
import { Palette } from "./Palette";
import { ProjectView } from "./ProjectView";
import { Icon } from "./TechIcon";

const PROJECT_BY_SLUG = new Map(PROJECTS.map((project) => [project.slug, project]));
const EXPERIENCE_BY_SLUG = new Map(EXPERIENCE.map((role) => [roleSlug(role), role]));

/* The count the stack window prints on its bar, derived so it cannot drift from
   the file below it. */
const STACK_ITEMS = STACK.reduce((total, section) => total + section.items.length, 0);

type Target = { kind: "project" | "experience"; slug: string } | null;

/* An employment kind belongs in the tag, next to the year. Anything else in that
   field is the domain of the role and reads better on the summary line. */
const EMPLOYMENT = new Set(["freelance", "internship", "full-time", "contract"]);

/* The pill is narrow: the word goes in, the fact stays. */
const SHORT_KIND: Record<string, string> = { internship: "intern" };

/* The open window is the URL hash, so a detail view is linkable, survives a
   reload, and answers the back button without a router. Project and experience
   slugs share one namespace and never collide. */
function targetFromHash(): Target {
  const raw = decodeURIComponent(window.location.hash.replace(/^#/, ""));
  if (PROJECT_BY_SLUG.has(raw)) return { kind: "project", slug: raw };
  if (EXPERIENCE_BY_SLUG.has(raw)) return { kind: "experience", slug: raw };
  return null;
}

function Tile({
  command,
  area,
  aside,
  footer,
  children,
}: {
  command: string;
  area: string;
  aside?: string;
  /* Chrome that belongs to the window and not to its content, like a statusline:
     rendered outside the body so it never scrolls with the buffer and never loses
     its right edge to a scrollbar. */
  footer?: ReactNode;
  children: ReactNode;
}) {
  /* The command is the window's visible title; the accessible name is the same
     string, so the seven regions can be walked by landmark instead of being
     anonymous <section> elements. */
  const titleId = `tile-${area}-title`;
  return (
    <section
      className={`tile tile--${area}`}
      id={`tile-${area}`}
      aria-labelledby={titleId}
      tabIndex={-1}
    >
      <div className="tile-bar">
        <span className="dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <h2 className="ttl" id={titleId}>
          {command}
        </h2>
        {aside ? <span className="tile-aside">{aside}</span> : null}
      </div>
      <div className="tile-body">{children}</div>
      {footer}
    </section>
  );
}

/* Copy affordance for the contact rows: a quiet icon button that confirms with
   a check for a moment. The confirmation is also announced through a live
   region, so it is not a sighted-only signal. */
function CopyGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  );
}

function CheckGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="m4 12.5 5 5L20 6.5" />
    </svg>
  );
}

export default function App() {
  const [open, setOpen] = useState<Target>(() => targetFromHash());
  const [preview, setPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  /* The confirmation carries its own state: a copy that fails is not a copy that
     worked, and the toast says which one happened. */
  const [announce, setAnnounce] = useState<{ text: string; error: boolean } | null>(null);
  const [palette, setPalette] = useState(false);
  const copyTimer = useRef<number | null>(null);

  useEffect(() => {
    const sync = () => setOpen(targetFromHash());
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  /* One shortcut for the whole page: Cmd+K where there is a Command key, Ctrl+K
     everywhere else. Both are always accepted, because the layout does not care
     which keyboard the visitor brought. */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k") return;
      if (!event.metaKey && !event.ctrlKey) return;
      event.preventDefault();
      setPalette((current) => !current);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const closeProject = useCallback(() => {
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    setOpen(null);
  }, []);

  /* Stable identities: the palette keys an effect on `onClose`, and an inline
     arrow would tear that effect down and steal focus back on every re-render. */
  const openPalette = useCallback(() => setPalette(true), []);
  const closePalette = useCallback(() => setPalette(false), []);

  useEffect(
    () => () => {
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
    },
    [],
  );

  /* Copy the destination, not the printed label: an absolute URL so it can be
     pasted anywhere, and the bare address for the mail link. */
  const copyLink = useCallback(async (link: { key: string; value: string; href: string }) => {
    const text = link.href.startsWith("mailto:")
      ? link.value
      : new URL(link.href, window.location.origin).href;
    let ok = true;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* Older or non-secure contexts: select the text in a throwaway field and
         run the legacy command instead of failing silently. */
      const field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.top = "-9999px";
      document.body.append(field);
      field.select();
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      field.remove();
    }

    if (!ok) {
      setAnnounce({ text: `could not copy ${link.value}`, error: true });
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => {
        setAnnounce(null);
        copyTimer.current = null;
      }, 2400);
      return;
    }

    setCopied(link.key);
    setAnnounce({ text: `${link.value} copied`, error: false });
    if (copyTimer.current) window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => {
      setCopied(null);
      setAnnounce(null);
      copyTimer.current = null;
    }, 1800);
  }, []);

  const openProject = open?.kind === "project" ? PROJECT_BY_SLUG.get(open.slug) : undefined;
  const openRole = open?.kind === "experience" ? EXPERIENCE_BY_SLUG.get(open.slug) : undefined;

  return (
    <main className="desktop">
      <div className="mosaic">
        <div className="mosaic-col">
          <Tile command="whoami" area="profile">
            <div className="head">
              <img
                className="avatar"
                src="/4nddrs-avatar.jpg"
                alt=""
                width={184}
                height={184}
                decoding="async"
              />
              <div className="ident">
                <h1>
                  {IDENTITY.handle}
                  <span className="handle-caret" aria-hidden="true">
                    _
                  </span>
                </h1>
                <p className="realname">{IDENTITY.name}</p>
              </div>
            </div>
            <div className="metas">
              <p className="meta">
                {IDENTITY.role}
                {IDENTITY.tags.map((tag) => (
                  <span className="tag" key={tag}>
                    {" · "}
                    {tag}
                  </span>
                ))}
              </p>
              <p className="meta meta--where">
                <span className="where-k">where</span> ·{" "}
                <span className="place">{IDENTITY.where}</span>
              </p>
            </div>
            {/* The current role, read from content.ts: a status line, not a badge. */}
            <p className="status">
              <span className="status-dot" aria-hidden="true" />
              {IDENTITY.status}
            </p>
            <div className="intro">
              {IDENTITY.intro.map((line) => (
                <p className="about" key={line}>
                  {line}
                </p>
              ))}
            </div>
            <div className="philo">
              <p className="philo-k">~/philosophy</p>
              <p className="philo-p">{IDENTITY.philosophy}</p>
            </div>
          </Tile>
          <Tile command="tree ~/stack" area="stack" aside={`${STACK_ITEMS} tools`}>
            <div className="tree">
              <p className="tree-root">~/stack</p>
              <ul className="tree-list">
                {STACK.map((section) => (
                  <li
                    className="tree-row"
                    key={section.section}
                    style={{ "--tint": section.tint } as CSSProperties}
                  >
                    {/* The elbow is drawn, not typed: the spine is one element, so
                                              it stays continuous no matter how far apart the rows land. */}
                    <span className="tree-graph" aria-hidden="true" />
                    <span className="tree-label">
                      <Icon id={section.icon} className="tech tree-icon" />
                      <h3 className="tree-dir">{section.section}/</h3>
                    </span>
                    <p className="tree-values">
                      {section.items.map((item, position) => (
                        <Fragment key={item}>
                          {position > 0 ? (
                            <span className="tree-sep">{"\u00a0\u00b7 "}</span>
                          ) : null}
                          {item}
                        </Fragment>
                      ))}
                    </p>
                  </li>
                ))}
              </ul>
              {/* The line `tree` prints when it finishes, derived from the same
                                        data so it cannot drift. */}
              <p className="tree-summary">
                {STACK.length} directories, {STACK_ITEMS} tools
              </p>
            </div>
          </Tile>
        </div>
        <div className="mosaic-col">
          <Tile
            command="ls ~/projects"
            area="projects"
            aside={preview ? `~/projects/${preview}` : `${PROJECTS.length} projects`}
          >
            <ul className="projects">
              {PROJECTS.map((project) => (
                <li
                  className="prow"
                  key={project.slug}
                  onMouseEnter={() => setPreview(project.slug)}
                  onMouseLeave={() => setPreview(null)}
                >
                  <a
                    className="pmain"
                    href={`#${project.slug}`}
                    onFocus={() => setPreview(project.slug)}
                    onBlur={() => setPreview(null)}
                  >
                    <span className="pname">{project.name}</span>
                    <span className="pdesc">{project.blurb}</span>
                  </a>
                  <span className="pmeta">
                    <span className="ptag">[{project.tag}]</span>
                    <a
                      className="parrow"
                      href={project.repo}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${project.name} on GitHub`}
                    >
                      <Icon id="github" />
                    </a>
                  </span>
                </li>
              ))}
            </ul>
          </Tile>
          <Tile command="./connect.sh" area="contact" aside={`${LINKS.length} channels`}>
            <ul className="links">
              {LINKS.map((link) => (
                <li className="linkrow" key={link.key}>
                  <a
                    href={link.href}
                    {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
                    {...(link.download ? { download: true } : {})}
                  >
                    <Icon id={link.icon} className="licon" />
                    <span className="lval">{link.value}</span>
                  </a>
                  <button
                    type="button"
                    className="copy"
                    aria-label={`Copy ${link.value} to clipboard`}
                    onClick={() => copyLink(link)}
                  >
                    {copied === link.key ? <CheckGlyph /> : <CopyGlyph />}
                  </button>
                </li>
              ))}
            </ul>
          </Tile>
        </div>
        <div className="mosaic-col">
          <Tile command="git log" area="experience" aside={`${EXPERIENCE.length} entries`}>
            {EXPERIENCE.length === 0 ? (
              <div className="empty">
                <p className="empty-h">no entries yet</p>
                <p className="empty-p">organization, role, dates, contributions</p>
                <p className="empty-src">content.ts → EXPERIENCE</p>
              </div>
            ) : (
              <ul className="log">
                {EXPERIENCE.map((entry, index) => {
                  const employment = EMPLOYMENT.has(entry.kind);
                  return (
                    <li
                      className={`logrow${index === 0 ? " logrow--head" : ""}`}
                      key={`${entry.org}-${entry.period}`}
                    >
                      <a className="log-main" href={`#${roleSlug(entry)}`}>
                        <span className="log-head">
                          <span className="log-org">{entry.org}</span>
                          <span className="log-tag">
                            {employment
                              ? `(${entry.short} · ${SHORT_KIND[entry.kind] ?? entry.kind})`
                              : `(${entry.short})`}
                          </span>
                          {index === 0 ? <span className="log-head-tag">(HEAD)</span> : null}
                        </span>
                        <span className="log-sub">
                          {employment ? entry.title : `${entry.title} · ${entry.kind}`}
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </Tile>
          <Tile
            command="nvim interests.md"
            area="interests"
            aside={`${INTERESTS.length} topics`}
            footer={
              /* lualine: a mode block, the buffer, the file type and the count,
                 with the angled segments the real statusline draws. It is window
                 chrome, so it sits on the window and not in the scrollable body:
                 inside the body a classic scrollbar steals its right edge and the
                 bar stops short of the corner. */
              <p className="md-status">
                <span className="md-seg md-seg--light">NORMAL</span>
                <span className="md-seg">
                  <span className="md-flag" aria-hidden="true">
                    {"\u2039"}
                  </span>
                  interests.md
                </span>
                <span className="md-seg md-seg--right">markdown</span>
                <span className="md-seg md-seg--light">{INTERESTS.length}L</span>
              </p>
            }
          >
            {/* A markdown buffer: gutter number, the `##` a heading keeps in
                                      source, and its note as a list item with a hanging indent so the
                                      wrapped line sits under the text and not under the bullet. The row
                                      is the hover target the way CursorLine covers the row. */}
            <ul className="md">
              {INTERESTS.map((interest, index) => (
                <li className="md-line" key={interest.name}>
                  <span className="md-num" aria-hidden="true">
                    {index + 1}
                  </span>
                  <div className="md-body">
                    <p className="md-head">
                      <span className="md-hash" aria-hidden="true">
                        {"## "}
                      </span>
                      {interest.name}
                    </p>
                    <p className="md-text">
                      <span className="md-bullet" aria-hidden="true">
                        {"\u21b3 "}
                      </span>
                      {interest.note}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Tile>
        </div>
      </div>

      {openProject ? <ProjectView project={openProject} onClose={closeProject} /> : null}
      {openRole ? <ExperienceView role={openRole} onClose={closeProject} /> : null}
      <Palette open={palette} onClose={closePalette} />

      {/* A shell echo, not a floating card: one mark, one line, gone. */}
      {announce ? (
        <p className="toast" role="status">
          <span
            className={`toast-mark${announce.error ? " toast-mark--error" : ""}`}
            aria-hidden="true"
          >
            {announce.error ? "\u2715" : "\u2713"}
          </span>
          {announce.text}
        </p>
      ) : null}
    </main>
  );
}
