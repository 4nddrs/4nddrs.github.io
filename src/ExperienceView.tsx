import type { Role } from "./content";
import { roleSlug } from "./content";
import { Dialog } from "./Dialog";

/* The experience log opened as a window, the same way a project opens. Only
   what the owner supplied is printed; when a role has no documented detail the
   window says so instead of filling the gap. */
export function ExperienceView({ role, onClose }: { role: Role; onClose: () => void }) {
  const slug = roleSlug(role);
  const hasDetail = Boolean(role.summary || role.bullets?.length);

  return (
    <Dialog path={`~/experience/${slug}`} titleId="viewer-title" resetKey={slug} onClose={onClose}>
      <p className="vprompt">
        <span className="path">4nddrs@dev</span>:~$ cd experience
      </p>
      <p className="vprompt">
        <span className="path">4nddrs@dev</span>:~/experience$ bat {slug}.log
      </p>

      <h2 className="vtitle" id="viewer-title">
        <span className="vhash" aria-hidden="true">
          #
        </span>
        {role.org}
      </h2>
      <p className="vtagline">
        {role.title} · {role.kind}
      </p>
      <p className="vmeta">
        {role.period}
        {role.span ? ` · ${role.span}` : ""}
        {role.place ? ` · ${role.place}` : ""}
      </p>

      {role.summary ? (
        <section className="vsec">
          <h3 className="vsec-h">
            <span className="vhash" aria-hidden="true">
              ##
            </span>
            summary
          </h3>
          <p className="vtext">{role.summary}</p>
        </section>
      ) : null}

      {role.bullets?.length ? (
        <section className="vsec">
          <h3 className="vsec-h">
            <span className="vhash" aria-hidden="true">
              ##
            </span>
            contributions
          </h3>
          {role.bullets.map((bullet) => (
            <p className="vtext vbullet" key={bullet.label}>
              <span className="vlabel">{bullet.label}</span>
              {bullet.text}
            </p>
          ))}
        </section>
      ) : null}

      {role.skills?.length ? (
        <section className="vsec">
          <h3 className="vsec-h">
            <span className="vhash" aria-hidden="true">
              ##
            </span>
            skills
          </h3>
          <p className="vtext vstack">{role.skills.join(" · ")}</p>
        </section>
      ) : null}

      {!hasDetail ? (
        <p className="vtext vpending">
          responsibilities, systems and stack are not documented yet — add them in content.ts →
          EXPERIENCE.
        </p>
      ) : null}

      <p className="vprompt vprompt--end">
        <span className="path">4nddrs@dev</span>:~/experience${" "}
        <i className="caret" aria-hidden="true" />
      </p>
    </Dialog>
  );
}
