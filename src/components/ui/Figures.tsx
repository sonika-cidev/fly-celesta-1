import { Fragment } from "react";

/**
 * Renders digit runs in the numeric face. Italiana's old-style figures make model
 * numbers ambiguous ("200" reads as "2oo"), so names like "King Air 200" use this.
 */
export function Figures({ children }: { children: string }) {
  return (
    <>
      {children.split(/(\d+)/).map((part, i) =>
        /^\d+$/.test(part) ? (
          <span key={i} className="figures">
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
