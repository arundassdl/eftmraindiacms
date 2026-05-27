"use client";

import React, { useEffect, useState } from "react";

const collapsedClass = "eftmra-admin-nav-collapsed";
const storageKey = "eftmra-admin-nav-collapsed";

export function EftmraAdminNav() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const storedValue = window.localStorage.getItem(storageKey);
    const shouldCollapse = storedValue === "true";

    document.documentElement.classList.toggle(collapsedClass, shouldCollapse);
    setIsCollapsed(shouldCollapse);
  }, []);

  const toggleCollapsed = () => {
    const nextValue = !isCollapsed;

    document.documentElement.classList.toggle(collapsedClass, nextValue);
    window.localStorage.setItem(storageKey, String(nextValue));
    setIsCollapsed(nextValue);
  };

  return (
    <div className="eftmra-admin-nav flex items-center gap-3 px-6 py-7">
      <div className="eftmra-admin-nav__brand-mark" aria-hidden="true">
        <img
          src="/api/media/file/LogoMakr-0kSFrf-300dpi-1-300x300.webp"
          alt=""
          className="eftmra-admin-nav__brand-image"
        />
      </div>
      <h1 className="eftmra-admin-nav__title text-2xl font-bold">EFTMRA India</h1>
      <button
        aria-label={isCollapsed ? "Expand navigation" : "Collapse navigation"}
        aria-pressed={isCollapsed}
        className="eftmra-admin-nav__menu"
        type="button"
        onClick={toggleCollapsed}
      >
        <span />
        <span />
        <span />
      </button>
    </div>
  );
}

export default EftmraAdminNav;
