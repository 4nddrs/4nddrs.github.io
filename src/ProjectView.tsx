import type { Project } from "./content";
import { Dialog } from "./Dialog";

/* A project opens as a maximised terminal window over the desktop: the same
   chrome, the prompts that would have produced it, and the README sections the
   repository actually documents. */
export function ProjectView({ project, onClose }: { project: Project; onClose: () => void }) {
  return (
    <Dialog
      path={`~/projects/${project.slug}`}
      titleId="viewer-title"
      resetKey={project.slug}
      onClose={onClose}
    >
      <p className="vprompt">
        <span className="path">4nddrs@dev</span>:~/projects$ cd {project.slug}
      </p>
      <p className="vprompt">
        <span className="path">4nddrs@dev</span>:~/projects/{project.slug}$ cat README.md
      </p>

      <h2 className="vtitle" id="viewer-title">
        <span className="vhash" aria-hidden="true">
          #
        </span>
        {project.name}
      </h2>
      <p className="vtagline">{project.tagline}</p>

      {project.sections.map((section) => (
        <section className="vsec" key={section.title}>
          <h3 className="vsec-h">
            <span className="vhash" aria-hidden="true">
              ##
            </span>
            {section.title}
          </h3>
          {section.body?.map((paragraph) => (
            <p className="vtext" key={paragraph}>
              {paragraph}
            </p>
          ))}
          {section.code ? (
            <pre className="vcode">
              <code>{section.code}</code>
            </pre>
          ) : null}
        </section>
      ))}

      <section className="vsec">
        <h3 className="vsec-h">
          <span className="vhash" aria-hidden="true">
            ##
          </span>
          stack
        </h3>
        <p className="vtext vstack">{project.stack.join(" · ")}</p>
      </section>

      <p className="vactions">
        <a className="vact" href={project.repo} target="_blank" rel="noreferrer">
          [ source ]
        </a>
        {project.demo ? (
          <a className="vact" href={project.demo} target="_blank" rel="noreferrer">
            [ demo ]
          </a>
        ) : null}
      </p>

      <p className="vprompt vprompt--end">
        <span className="path">4nddrs@dev</span>:~/projects/{project.slug}${" "}
        <i className="caret" aria-hidden="true" />
      </p>
    </Dialog>
  );
}
