import type { ReactElement } from "react";
import {
  IconCpu,
  IconFastapi,
  IconFile,
  IconGithub,
  IconGmail,
  IconGo,
  IconLinkedin,
  IconLinux,
  IconNeovim,
  IconPostgresql,
  IconPython,
  IconReact,
  IconSparkle,
  IconX,
} from "./icons";

/* Only the glyphs the page renders are imported, so the rest of the generated
   set is tree-shaken out of the bundle. */
const ICONS: Record<string, () => ReactElement> = {
  cpu: IconCpu,
  fastapi: IconFastapi,
  file: IconFile,
  github: IconGithub,
  gmail: IconGmail,
  go: IconGo,
  linkedin: IconLinkedin,
  linux: IconLinux,
  neovim: IconNeovim,
  postgresql: IconPostgresql,
  python: IconPython,
  react: IconReact,
  sparkle: IconSparkle,
  x: IconX,
};

/* One 16px glyph. Decorative by default: the surrounding text or the parent
   cluster carries the accessible name. */
export function Icon({ id, className = "tech" }: { id: string; className?: string }) {
  const Glyph = ICONS[id];
  if (!Glyph) return null;
  return (
    <span className={className} aria-hidden="true">
      <Glyph />
    </span>
  );
}
