import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

/* One maximised terminal window over the desktop, shared by the project and
   experience details: same chrome, same neighbours, and the same rules — focus
   is trapped inside, Esc and the backdrop close it, and the page behind cannot
   scroll while it is open. */
export function Dialog({
  path,
  titleId,
  resetKey,
  onClose,
  children,
}: {
  path: string;
  titleId: string;
  resetKey: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const winRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;

    /* Focus the window itself, not the first control: the dialog gets announced
       and Tab moves through the links without pinning a ring on `esc`. */
    winRef.current?.focus();
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = winRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [onClose]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [resetKey]);

  return (
    <div className="viewer" onClick={onClose}>
      <div
        className="viewer-win"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={winRef}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="tile-bar">
          <span className="dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="vpath">{path}</span>
          <button type="button" className="vclose" onClick={onClose}>
            esc
          </button>
        </div>

        <div className="viewer-body" ref={bodyRef}>
          {children}
        </div>
      </div>
    </div>
  );
}
