import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { LINKS, PROJECTS } from "./content";

/* A keyboard entry point, not a second interface: every command either moves
   focus to a window that already exists or opens a destination the page already
   offers. Nothing here invents an action the page cannot perform. */
type Command = {
  id: string;
  label: string;
  group: string;
  run: () => void;
  /* Choosing a command moves focus somewhere deliberate, so the palette must
     not drag it back when it closes. */
  movesFocus?: boolean;
};

const PANELS: { area: string; label: string; command: string }[] = [
  { area: "profile", label: "About me", command: "whoami" },
  { area: "projects", label: "Projects", command: "ls ~/projects" },
  { area: "experience", label: "Experience", command: "git log" },
  { area: "stack", label: "Stack", command: "bat -p stack.toml" },
  { area: "contact", label: "Contact", command: "./connect.sh" },
  { area: "interests", label: "Interests", command: "nvim interests.md" },
];

const calm = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function goToPanel(area: string) {
  const panel = document.getElementById(`tile-${area}`);
  if (!panel) return;
  panel.scrollIntoView({ block: "center", behavior: calm() ? "auto" : "smooth" });
  panel.focus({ preventScroll: true });
}

/* Downloads, new tabs and mail all have to be triggered from a real anchor, so
   the command builds one and clicks it instead of navigating the window. */
function follow(link: (typeof LINKS)[number]) {
  const anchor = document.createElement("a");
  anchor.href = link.href;
  if (link.external) {
    anchor.target = "_blank";
    anchor.rel = "noreferrer";
  }
  if (link.download) anchor.download = "";
  anchor.click();
}

export function Palette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const restoreFocus = useRef(true);

  const commands = useMemo<Command[]>(
    () => [
      ...PANELS.map((panel) => ({
        id: `panel-${panel.area}`,
        label: panel.label,
        group: panel.command,
        run: () => goToPanel(panel.area),
        movesFocus: true,
      })),
      ...PROJECTS.map((project) => ({
        id: `project-${project.slug}`,
        label: project.name,
        group: "open project",
        run: () => {
          window.location.hash = project.slug;
        },
        /* The detail window takes focus when it opens, so the palette must not
           pull it back. */
        movesFocus: true,
      })),
      ...LINKS.map((link) => ({
        id: `link-${link.key}`,
        label: link.value,
        group: link.key === "cv" ? "download" : link.key,
        run: () => follow(link),
      })),
    ],
    [],
  );

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((command) =>
      `${command.label} ${command.group}`.toLowerCase().includes(q),
    );
  }, [commands, query]);

  /* Opening resets the list and remembers where the keyboard came from. */
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    restoreFocus.current = true;
    returnTo.current = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      if (restoreFocus.current) returnTo.current?.focus?.();
    };
  }, [open, onClose]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  if (!open) return null;

  const choose = (command: Command | undefined) => {
    if (!command) return;
    restoreFocus.current = !command.movesFocus;
    command.run();
    onClose();
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((current) => (matches.length ? (current + 1) % matches.length : 0));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) =>
        matches.length ? (current - 1 + matches.length) % matches.length : 0,
      );
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      choose(matches[active]);
    }
  };

  const activeId = matches.length ? `palette-${matches[active].id}` : undefined;

  return (
    <div className="palette-scrim" onClick={onClose}>
      <div
        className="palette"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <input
          ref={inputRef}
          className="palette-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="run a command"
          aria-label="Search commands"
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-list"
          aria-activedescendant={activeId}
          aria-autocomplete="list"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />

        {matches.length ? (
          <ul className="palette-list" id="palette-list" role="listbox" aria-label="Commands">
            {matches.map((command, index) => (
              <li
                key={command.id}
                id={`palette-${command.id}`}
                className="palette-item"
                role="option"
                aria-selected={index === active}
                onMouseEnter={() => setActive(index)}
                onClick={() => choose(command)}
              >
                <span className="palette-label">{command.label}</span>
                <span className="palette-group">{command.group}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="palette-empty">
            nothing answers {query.trim() ? `"${query.trim()}"` : "that"} — try "projects"
          </p>
        )}
      </div>
    </div>
  );
}
