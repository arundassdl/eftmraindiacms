import React from "react";
import { HomeGlyph } from "./EftmraAdminGlyphs";

type IconProps = {
  className?: string;
  fill?: string;
};

export function EftmraAdminIcon({ className, fill }: IconProps) {
  return (
    <HomeGlyph
      className={[
        "eftmra-admin-icon",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      fill={fill}
    />
  );
}

export default EftmraAdminIcon;
