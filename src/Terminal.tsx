import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { CONTEXT, EXPERIENCE, IDENTITY, INTERESTS, LINKS, PROJECTS, STACK } from "./content";

/* The status bar is a small command surface, not a shell. It answers a fixed
   set of words and can open a project; it never evaluates input, never touches
   the filesystem and never runs anything from the system. Anything else gets a
   short, honest reply. */
type Line = { id: number; kind: "cmd" | "out" | "err"; text: string };

let seq = 0;
const line = (kind: Line["kind"], text: string): Line => ({ id: ++seq, kind, text });

const HELP = [
  "available commands",
  "",
  `  ${"whoami".padEnd(12)}about me`,
  `  ${"projects".padEnd(12)}explore my work`,
  `  ${"experience".padEnd(12)}professional experience`,
  `  ${"stack".padEnd(12)}technologies`,
  `  ${"contact".padEnd(12)}get in touch`,
  `  ${"interests".padEnd(12)}personal interests`,
  `  ${"cd <name>".padEnd(12)}open a project`,
  `  ${"clear".padEnd(12)}clear the screen`,
];

const pad = (text: string, width: number) => text.padEnd(width);

/* The chip in the bar has to name the key this keyboard actually has. Both
   combinations work either way; only the label changes. */
const MOD_KEY = /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl+";

/* A real clock, not a decoration: local time, 24-hour, refreshed on a coarse
   interval because the minute is the only thing that changes. */
function Clock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 15000);
    return () => window.clearInterval(id);
  }, []);

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return (
    <time className="clock" dateTime={`${hours}:${minutes}`}>
      {hours}:{minutes}
    </time>
  );
}

export function Terminal({
  onOpenProject,
  onOpenPalette,
}: {
  onOpenProject: (slug: string) => void;
  onOpenPalette: () => void;
}) {
  const [lines, setLines] = useState<Line[]>([]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [lines]);

  function run(raw: string) {
    const cmd = raw.trim();
    const out: Line[] = [line("cmd", cmd)];
    const [name, ...rest] = cmd.split(/\s+/);
    const arg = rest.join(" ");

    switch (name) {
      case "":
        break;
      case "help":
        out.push(...HELP.map((text) => line("out", text)));
        break;
      case "whoami":
        out.push(
          line("out", `${IDENTITY.handle} · ${IDENTITY.name}`),
          line("out", IDENTITY.role),
          line("out", `${IDENTITY.where}`),
        );
        break;
      case "projects":
      case "ls":
        out.push(
          ...PROJECTS.map((project) => line("out", `${pad(project.name, 18)}${project.blurb}`)),
          line("out", ""),
          line("out", "cd <name> opens a project"),
        );
        break;
      case "experience":
        out.push(
          ...EXPERIENCE.map((role) =>
            line("out", `${pad(role.short, 6)}${pad(role.org, 16)}${role.title}`),
          ),
          line("out", ""),
          line("out", "open an entry from the experience window to read more"),
        );
        break;
      case "stack":
        out.push(
          ...STACK.map((group) =>
            line("out", `${pad(group.section, 28)}${group.items.join(" · ")}`),
          ),
        );
        break;
      case "contact":
        out.push(...LINKS.map((link) => line("out", `${pad(link.key, 10)}${link.value}`)));
        break;
      case "interests":
        out.push(
          ...INTERESTS.map((interest) => line("out", `${pad(interest.name, 24)}${interest.note}`)),
        );
        break;
      case "cd": {
        if (!arg) {
          out.push(line("err", "cd: missing project name"), line("out", "try: projects"));
          break;
        }
        const hit = PROJECTS.find((project) => project.slug === arg);
        if (!hit) {
          out.push(line("err", `cd: no such project: ${arg}`), line("out", "try: projects"));
          break;
        }
        setLines([]);
        setValue("");
        onOpenProject(hit.slug);
        return;
      }
      case "clear":
        setLines([]);
        setValue("");
        return;
      default:
        out.push(
          line("err", `command not found: ${name}`),
          line("out", "type help to see what this terminal answers."),
        );
    }

    setLines((current) => [...current, ...out]);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const cmd = value.trim();
    if (cmd) setHistory((current) => [...current, cmd]);
    setCursor(-1);
    run(cmd);
    setValue("");
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setLines([]);
      setValue("");
      event.currentTarget.blur();
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!history.length) return;
      const next = cursor < 0 ? history.length - 1 : Math.max(0, cursor - 1);
      setCursor(next);
      setValue(history[next]);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (cursor < 0) return;
      const next = cursor + 1;
      if (next >= history.length) {
        setCursor(-1);
        setValue("");
      } else {
        setCursor(next);
        setValue(history[next]);
      }
    }
  }

  return (
    <footer className="statusbar">
      <form className="term" onSubmit={onSubmit} onClick={() => inputRef.current?.focus()}>
        <span className="path">{IDENTITY.handle}@dev:~</span>
        <span className="dollar">$</span>
        <i className="caret" aria-hidden="true" />
        <input
          ref={inputRef}
          className="term-input"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={onKeyDown}
          aria-label="Terminal command"
          placeholder="help"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />
      </form>
      <span className="ctx">{CONTEXT.join(" · ")}</span>
      <button
        type="button"
        className="pal-hint"
        onClick={onOpenPalette}
        aria-haspopup="dialog"
        aria-keyshortcuts="Meta+K Control+K"
      >
        {MOD_KEY}K<span className="sr-only"> opens the command palette</span>
      </button>
      <Clock />

      {lines.length ? (
        <div className="term-log" role="log" aria-live="polite" ref={logRef}>
          {lines.map((entry) => (
            <p className={`term-line term-line--${entry.kind}`} key={entry.id}>
              {entry.kind === "cmd" ? (
                <>
                  <span className="path">{IDENTITY.handle}@dev:~</span>
                  <span className="dollar">$</span> {entry.text}
                </>
              ) : (
                entry.text || "\u00a0"
              )}
            </p>
          ))}
        </div>
      ) : null}
    </footer>
  );
}
