import React from "react";
import { EftmraMark } from "./EftmraAdminGlyphs";
import { withCmsBasePath } from "./adminBasePath";

type LogoProps = {
  className?: string;
};

export function EftmraAdminLogo({ className }: LogoProps) {
  return (
    <div
      className={[
        "flex items-center gap-3 rounded-[16px] border border-[rgba(25,118,210,0.12)]",
        "bg-white/90 px-3 py-2 shadow-[var(--shadow-admin-soft)] backdrop-blur-md",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,var(--color-admin-brand-deep),var(--color-admin-highlight))] shadow-[0_12px_24px_rgba(21,101,192,0.2)]">
        <EftmraMark className="h-6 w-6" />
        <img
                      src={withCmsBasePath("/api/media/file/LogoMakr-0kSFrf-300dpi-1-300x300.webp")}
                      alt="EFTMRA India Logo"
                      className="h-[38px] w-[38px] rounded-[9px] object-contain"
                    />
      </div>
      <div className="leading-none">
        
        <div className="text-[1.02rem] uppercase font-semibold tracking-[-0.01em] text-[var(--color-admin-brand)]">
          EFTMRA India
        </div>
        <div className="mt-1 text-[0.7rem] font-bold  tracking-[0.18em] text-[var(--color-admin-ink)]">
          Login to your account
        </div>
      </div>
    </div>
  );
}

export default EftmraAdminLogo;
