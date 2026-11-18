/* All copy and data for the page. Presentation lives in the components, so a
   project, a stack row or a contact channel can be edited here without touching
   markup or styles. Every claim below comes from the repository README, its
   GitHub metadata, or the owner's live site — nothing is invented. */

export const IDENTITY = {
  /* The handle is the name on the page; the legal name sits under it, smaller. */
  handle: "4nddrs",
  name: "Andrés Menchaca",
  role: "systems engineer · backend · linux-first",
  where: "south america",
  intro: [
    "Hey, I'm Andrés.",
    "I enjoy understanding how things work and building software that makes them work better.",
    "I'm interested in backend engineering, Linux, system architecture, automation and the intersection of software and AI.",
  ],
  philosophy: "I like simple solutions to complex problems.",
};

export const EMAIL = "4nddrs.dev@gmail.com";

export type TechTag = { id: string; name: string };

export type ProjectSection = {
  title: string;
  body?: string[];
  code?: string;
};

export type Project = {
  slug: string;
  name: string;
  blurb: string;
  tagline: string;
  repo: string;
  demo?: string;
  tags: TechTag[];
  sections: ProjectSection[];
  stack: string[];
};

export const PROJECTS: Project[] = [
  {
    slug: "snag",
    name: "snag",
    blurb: "Terminal client for OpenAPI 3.x.",
    tagline: "Keyboard-driven TUI client for OpenAPI 3.x.",
    repo: "https://github.com/4nddrs/snag",
    demo: "https://snag-tui.netlify.app/",
    tags: [{ id: "go", name: "Go" }],
    sections: [
      {
        title: "overview",
        body: [
          "SNAG discovers every endpoint in an OpenAPI document, groups them by tag, and gives you a parameter editor and a response panel inside one terminal window.",
        ],
      },
      {
        title: "problem",
        body: [
          "Testing an API meant leaving the shell for a desktop client, re-importing the spec, and losing the flow of a terminal session.",
        ],
      },
      {
        title: "approach",
        body: [
          "Point snag at a base URL or an openapi.json; it parses the specification, then drives three panels — navigation, parameters, response — with Vim keys: j and k to move, enter to select, esc to go back.",
        ],
      },
      {
        title: "architecture",
        code: `main.go   Bubble Tea loop
model.go  app state
api.go    spec + requests
ui.go     Lip Gloss panels`,
      },
      {
        title: "implementation",
        body: [
          "Built on Bubble Tea's Elm architecture, so requests and rendering stay asynchronous and the interface never blocks. Responses arrive syntax-highlighted with status code and elapsed time, and y copies the body.",
        ],
      },
    ],
    stack: ["Go", "Bubble Tea", "Lip Gloss", "Bubbles"],
  },
  {
    slug: "mkf",
    name: "mkf",
    blurb: "Scaffolds a modular FastAPI service.",
    tagline: "FastAPI project scaffolder.",
    repo: "https://github.com/4nddrs/mkf",
    tags: [
      { id: "python", name: "Python" },
      { id: "fastapi", name: "FastAPI" },
    ],
    sections: [
      {
        title: "overview",
        body: [
          "A CLI that generates a FastAPI starter with a modular layout — api, core, db, models, schemas — plus a virtual environment, the dependencies and a first commit.",
        ],
      },
      {
        title: "problem",
        body: [
          "Every new FastAPI service started the same way: copy a previous repository, delete the domain code, fix the imports. The repetition invited drift between projects and slowed down the first hour of work.",
        ],
      },
      {
        title: "approach",
        body: [
          "One command scaffolds the structure, creates and populates a virtual environment, installs FastAPI and Uvicorn, writes requirements.txt, and initialises a git repository with an initial commit.",
        ],
      },
      {
        title: "architecture",
        code: `app/
  api/routes.py
  core/config.py
  db/database.py
  models/user.py
  schemas/user.py
  main.py
tests/test_main.py`,
      },
      {
        title: "implementation",
        body: [
          "Distributed through pipx, so the CLI lives in its own environment instead of inside every project's virtualenv. The generated project runs with a single uvicorn command.",
        ],
      },
    ],
    stack: ["Python", "FastAPI", "Uvicorn", "pipx", "Git"],
  },
  {
    slug: "smart-gym",
    name: "smart-gym",
    blurb: "Three services, face-recognition check-in.",
    tagline: "Gym management with facial recognition.",
    repo: "https://github.com/4nddrs/smart-gym",
    tags: [
      { id: "python", name: "Python" },
      { id: "react", name: "React" },
    ],
    sections: [
      {
        title: "overview",
        body: [
          "A React frontend talks to a FastAPI CRUD API and a separate FastAPI face service backed by CompreFace in Docker, with an MJPEG stream for live recognition.",
        ],
      },
      {
        title: "problem",
        body: [
          "Member check-in and access control were manual. The gym needed recognition at the door and one place to manage members and their records.",
        ],
      },
      {
        title: "approach",
        body: [
          "Split by responsibility: the CRUD API owns members and their records, the face service owns recognition, and CompreFace runs in a container. The frontend composes both.",
        ],
      },
      {
        title: "architecture",
        code: `React  ─┬─ CRUD API :8001 → SQLite
        └─ Face API :8002 → CompreFace`,
      },
      {
        title: "implementation",
        body: [
          "Both services serve HTTPS with self-signed certificates so devices on the local network can reach them, and recognition runs over the webcam's MJPEG stream. The CRUD API is pinned to 32-bit Python while the face service runs 64-bit, a constraint the setup documents.",
        ],
      },
    ],
    stack: ["React", "TypeScript", "Vite", "FastAPI", "SQLite", "CompreFace", "Docker"],
  },
  {
    slug: "eppCheck",
    name: "eppCheck",
    blurb: "YOLOv8 PPE detection on live video.",
    tagline: "Real-time PPE detection for construction sites.",
    repo: "https://github.com/4nddrs/eppCheck",
    tags: [{ id: "python", name: "Python" }],
    sections: [
      {
        title: "overview",
        body: [
          "A YOLOv8 model detects people, hard hats, safety vests and masks on a live video feed, keeps a running count and records each violation.",
        ],
      },
      {
        title: "problem",
        body: [
          "PPE compliance is checked by walking the site. Violations that happen between rounds go unrecorded, and there is no evidence to act on afterwards.",
        ],
      },
      {
        title: "approach",
        body: [
          "OpenCV reads the stream, YOLOv8 classifies each frame, and a panel shows live counts. A person detected without a hard hat triggers an alert carrying the captured frame.",
        ],
      },
      {
        title: "implementation",
        body: [
          "Email delivery and the audio alarm run asynchronously, so inference never stalls waiting on I/O. The trained weights ship in the repository together with the training notebook.",
        ],
      },
    ],
    stack: ["Python", "YOLOv8", "PyTorch", "OpenCV", "NumPy"],
  },
  {
    slug: "backend-Country",
    name: "backend-Country",
    blurb: "Equestrian ERP: inventory and billing.",
    tagline: "Equestrian ERP backend, built with clean architecture.",
    repo: "https://github.com/4nddrs/backend-Country",
    tags: [
      { id: "python", name: "Python" },
      { id: "postgresql", name: "PostgreSQL" },
    ],
    sections: [
      {
        title: "overview",
        body: [
          "A backend of more than twenty routers covering horses, staff, owners, medicine stock, vaccinations, nutrition, finances and monthly billing for an equestrian facility.",
        ],
      },
      {
        title: "problem",
        body: [
          "Facility operations lived across paper and spreadsheets: medicine expiries and low stock were discovered late, and owner billing was assembled by hand every month.",
        ],
      },
      {
        title: "approach",
        body: [
          "Clean layers — routers, Pydantic schemas, CRUD and services — over a PostgreSQL database. Business rules live in services; routers validate and delegate.",
        ],
      },
      {
        title: "architecture",
        code: `routers → schemas
   ↓
  crud → PostgreSQL
   ↓
services → Telegram
         → APScheduler`,
      },
      {
        title: "implementation",
        body: [
          "A daily scheduler job runs at 21:30 Bolivia time, checks stock and expiry dates, and notifies the veterinarians through a Telegram webhook. The dashboard aggregates counts and finances concurrently and caches the result for thirty seconds.",
        ],
      },
    ],
    stack: [
      "Python",
      "FastAPI",
      "Pydantic",
      "PostgreSQL",
      "Supabase",
      "APScheduler",
      "Telegram Bot API",
    ],
  },
  {
    slug: "linux-config",
    name: "linux-config",
    blurb: "Sway, Waybar and LazyVim dotfiles.",
    tagline: "A keyboard-driven Wayland workstation.",
    repo: "https://github.com/4nddrs/linux-config",
    tags: [
      { id: "linux", name: "Linux" },
      { id: "neovim", name: "Neovim" },
    ],
    sections: [
      {
        title: "overview",
        body: [
          "The environment this site was built in: a tiling Wayland desktop, its status bar, a Zsh prompt and a LazyVim setup, kept together in one repository.",
        ],
      },
      {
        title: "problem",
        body: [
          "A hand-tuned desktop is lost on reinstall and drifts between machines. The configuration has to be versioned and reapplied in minutes, not evenings.",
        ],
      },
      {
        title: "approach",
        body: [
          "Symlinks — or GNU Stow — map the repository into ~/.config, while machine-specific secrets stay in a gitignored ~/.zshrc.local.",
        ],
      },
      {
        title: "architecture",
        code: `config/
  sway/    config + autotile.py
  waybar/
  nvim/    LazyVim
.zshrc`,
      },
      {
        title: "implementation",
        body: [
          "autotile.py keeps the workspace tiled as windows open and close. The theme is a blue-grey palette with 10px gaps, and Powerlevel10k drives the prompt.",
        ],
      },
    ],
    stack: ["Sway", "Waybar", "Neovim", "LazyVim", "Zsh", "Python"],
  },
];

/* The stack, grouped the way a person reads it: a table name and one line of
   values under it. Keys, brackets, quotes and line numbers all went — they made
   the file look like a config dump instead of a list someone could read. */ export type StackSection =
  {
    section: string;
    items: string[];
  };

export const STACK: StackSection[] = [
  { section: "backend_engineering", items: ["Python", "Go", "FastAPI", "Flask"] },
  { section: "data_and_storage", items: ["PostgreSQL", "MongoDB", "Firebase"] },
  { section: "systems_and_infrastructure", items: ["Linux", "Docker", "Kubernetes"] },
  { section: "applied_ai", items: ["PyTorch", "OpenCV", "Computer Vision"] },
  { section: "frontend_engineering", items: ["TypeScript", "React", "Astro", "Vite"] },
  { section: "development_workflow", items: ["Neovim", "Bash", "Git"] },
  { section: "agentic_engineering", items: ["Pi", "OpenCode", "T3 Code"] },
];

/* Professional experience, given by the owner from his LinkedIn profile and,
   for Ninescale, from what he described directly. Only the facts that fit the
   log are kept: organization, title, employment kind and, for Ninescale, the
   three things he said the role covers. `short` is the compact date the index
   prints, `period` the full range. */
export type Role = {
  org: string;
  title: string;
  kind: string;
  short: string;
  period: string;
  /* Optional detail, shown only when the source documents it. */
  span?: string;
  place?: string;
  summary?: string;
  bullets?: { label: string; text: string }[];
  skills?: string[];
};

/* Stable id for a role: the organization, slugged. The hash route and the
   detail window both need the same string, so it lives in one place. */
export const roleSlug = (role: Role) => role.org.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export const EXPERIENCE: Role[] = [
  {
    org: "Ninescale",
    title: "software developer",
    kind: "robotics \u00b7 ai tools \u00b7 teams",
    short: "2026",
    period: "2026 \u2013 present",
    /* He described the role in conversation but LinkedIn carries no summary
       for it yet, so the detail view only restates what he said. */
    summary:
      "Building software for a robotics company: product work, internal AI tooling, and coordinating the people side of delivery.",
    skills: ["robotics", "ai tooling", "team coordination"],
  },
  {
    org: "4nddrs",
    title: "software architect & developer",
    kind: "freelance",
    short: "2026",
    period: "feb 2026 \u2013 present",
    span: "10 mos",
    place: "cochabamba, bolivia \u00b7 hybrid",
    summary:
      "Architecting and delivering full-stack web applications for international clients, focusing on scalable backend architectures and modern user interfaces.",
    bullets: [
      {
        label: "full-stack development",
        text: "Designing and implementing end-to-end solutions using FastAPI (Python) and React (Vite), ensuring seamless integration between complex backends and responsive frontends.",
      },
      {
        label: "scalable backend design",
        text: "Implementing Clean Architecture principles and managing complex enterprise data with PostgreSQL and Supabase.",
      },
      {
        label: "process automation",
        text: "Developing custom scripts and services to automate business logic and real-time notification systems.",
      },
      {
        label: "infrastructure & cli",
        text: 'Maintaining a "Linux-first" workflow to optimize development pipelines and building high-performance system tools in Go.',
      },
    ],
    skills: ["FastAPI", "software architecture"],
  },
  {
    org: "Paramo Games",
    title: "software developer",
    kind: "internship",
    short: "2025",
    period: "aug 2025 \u2013 oct 2025",
    span: "3 mos",
    place: "cochabamba, bolivia \u00b7 hybrid",
    skills: ["game development"],
  },
  {
    org: "EDUBO",
    title: "software developer",
    kind: "internship",
    short: "2025",
    period: "jul 2025 \u2013 aug 2025",
    span: "2 mos",
    place: "cochabamba, bolivia \u00b7 hybrid",
    skills: ["integrated systems", "Python"],
  },
];

export const NOTES: { title: string; date: string; href: string }[] = [];

/* Interests are a note file: a topic, then the line that explains why it is
   here. The closing line is the page's own voice, not a claim about anyone. */
export const INTERESTS: { name: string; note: string }[] = [
  { name: "agentic systems", note: "How agents reason, collaborate and build things." },
  { name: "developer tooling", note: "Building tools that make developers more effective." },
  { name: "systems architecture", note: "Simple, reliable systems that scale with purpose." },
  {
    name: "applied ai & robotics",
    note: "Bringing intelligence closer to the physical world.",
  },
  { name: "automation", note: "Reproducible workflows and less friction." },
];

/* Environment shown in the status bar, taken from linux-config: Sway on Linux,
   Zsh and a LazyVim setup. */
export const CONTEXT = ["linux", "zsh", "nvim"];

export const LINKS: {
  key: string;
  value: string;
  href: string;
  icon: string;
  external?: boolean;
  download?: boolean;
}[] = [
  {
    key: "github",
    value: "github.com/4nddrs",
    href: "https://github.com/4nddrs",
    icon: "github",
    external: true,
  },
  {
    key: "linkedin",
    value: "linkedin.com/in/4nddrs",
    href: "https://www.linkedin.com/in/4nddrs",
    icon: "linkedin",
    external: true,
  },
  {
    key: "x",
    value: "x.com/4nddrs",
    href: "https://x.com/4nddrs",
    icon: "x",
    external: true,
  },
  { key: "email", value: EMAIL, href: `mailto:${EMAIL}`, icon: "gmail" },
  {
    key: "cv",
    value: "CV_andresMenchaca.pdf",
    href: "/CV_andresMenchaca.pdf",
    icon: "file",
    download: true,
  },
];
