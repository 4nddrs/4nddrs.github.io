import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  EXPERIENCE,
  IDENTITY,
  INTERESTS,
  LINKS,
  NOTES,
  PROJECTS,
  STACK,
  roleSlug,
} from "./content";
import { ExperienceView } from "./ExperienceView";
import { Palette } from "./Palette";
import { ProjectView } from "./ProjectView";
import { Terminal } from "./Terminal";
import { Icon } from "./TechIcon";

const PROJECT_BY_SLUG = new Map(PROJECTS.map((project) => [project.slug, project]));
const EXPERIENCE_BY_SLUG = new Map(EXPERIENCE.map((role) => [roleSlug(role), role]));

/* The count the stack window prints on its bar, derived so it cannot drift from
   the file below it. */
const STACK_ITEMS = STACK.reduce((total, section) => total + section.items.length, 0);

type Target = { kind: "project" | "experience"; slug: string } | null;

const X_URL = "https://x.com/4nddrs";

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
  children,
}: {
  command: string;
  area: string;
  aside?: string;
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
  const [announce, setAnnounce] = useState("");
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
      setAnnounce(`Could not copy ${link.value}`);
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => {
        setAnnounce("");
        copyTimer.current = null;
      }, 2200);
      return;
    }

    setCopied(link.key);
    setAnnounce(`${link.value} copied to clipboard`);
    if (copyTimer.current) window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => {
      setCopied(null);
      setAnnounce("");
      copyTimer.current = null;
    }, 1600);
  }, []);

  const openProject = open?.kind === "project" ? PROJECT_BY_SLUG.get(open.slug) : undefined;
  const openRole = open?.kind === "experience" ? EXPERIENCE_BY_SLUG.get(open.slug) : undefined;

  return (
    <main className="desktop">
      <div className="mosaic">
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
              <h1>{IDENTITY.handle}</h1>
              <p className="realname">{IDENTITY.name}</p>
            </div>
          </div>
          <div className="metas">
            <p className="meta">{IDENTITY.role}</p>
            <p className="meta meta--where">
              <span className="where-k">where</span> · {IDENTITY.where}
            </p>
          </div>
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
                onFocus={() => setPreview(project.slug)}
                onBlur={() => setPreview(null)}
              >
                <a className="pmain" href={`#${project.slug}`}>
                  <span className="pname">{project.name}</span>
                  <span className="pdesc">{project.blurb}</span>
                </a>
                <span className="pmeta">
                  <span
                    className="tags"
                    role="img"
                    aria-label={project.tags.map((tag) => tag.name).join(", ")}
                  >
                    {project.tags.map((tag) => (
                      <Icon key={tag.id} id={tag.id} />
                    ))}
                  </span>
                  <a
                    className="plink"
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

        <Tile command="bat -p stack.toml" area="stack" aside={`${STACK_ITEMS} tools`}>
          <ul className="conf">
            {STACK.map((section) => (
              <li key={section.section}>
                <h3 className="c-table">[{section.section}]</h3>
                <p>
                  {section.items.map((item, index) => (
                    <Fragment key={item}>
                      {index > 0 ? <span className="c-punc">{"\u00a0\u00b7 "}</span> : null}
                      <span className="conf-item">{item}</span>
                    </Fragment>
                  ))}
                </p>
              </li>
            ))}
          </ul>
        </Tile>

        <Tile
          command="git log --experience"
          area="experience"
          aside={`${EXPERIENCE.length} entries`}
        >
          {EXPERIENCE.length === 0 ? (
            <div className="empty">
              <p className="empty-h">no entries yet</p>
              <p className="empty-p">organization, role, dates, contributions</p>
              <p className="empty-src">content.ts → EXPERIENCE</p>
            </div>
          ) : (
            <ul className="log">
              {EXPERIENCE.map((entry) => (
                <li className="logrow" key={`${entry.org}-${entry.period}`}>
                  <a className="log-main" href={`#${roleSlug(entry)}`}>
                    <span className="log-head">
                      <span className="log-org">{entry.org}</span>
                      <span className="log-period">
                        {" \u00b7 "}
                        {entry.short}
                      </span>
                    </span>
                    <span className="log-role">{entry.title}</span>
                    <span className="log-kind">{entry.kind}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
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
          <p className="sr-only" aria-live="polite">
            {announce}
          </p>
        </Tile>

        <Tile
          command="bat notes.md"
          area="notes"
          aside={NOTES.length ? `${NOTES.length} notes` : "empty"}
        >
          {NOTES.length === 0 ? (
            <div className="empty">
              <p className="empty-h">no notes published yet</p>
              <p className="empty-p">backend architecture, linux automation, api design</p>
              <p className="empty-src">
                updates:{" "}
                <a href={X_URL} target="_blank" rel="noreferrer">
                  x.com/4nddrs
                </a>
              </p>
            </div>
          ) : (
            <ul className="notes">
              {NOTES.map((note) => (
                <li key={note.href}>
                  <span className="note-date">{note.date}</span>
                  <a className="note-title" href={note.href} target="_blank" rel="noreferrer">
                    {note.title}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Tile>

        <Tile command="nvim interests.md" area="interests" aside={`${INTERESTS.length} topics`}>
          <ul className="interests">
            {INTERESTS.map((interest) => (
              <li key={interest.name}>
                <span className="int-name">{interest.name}</span>
                <span className="int-note">{interest.note}</span>
              </li>
            ))}
          </ul>
        </Tile>
      </div>

      <Terminal
        onOpenProject={(slug) => (window.location.hash = slug)}
        onOpenPalette={openPalette}
      />

      {openProject ? <ProjectView project={openProject} onClose={closeProject} /> : null}
      {openRole ? <ExperienceView role={openRole} onClose={closeProject} /> : null}

      <Palette open={palette} onClose={closePalette} />
    </main>
  );
}
