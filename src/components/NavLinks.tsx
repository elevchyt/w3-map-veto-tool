"use client";

import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { IoHomeSharp } from "react-icons/io5";
import { Tooltip } from "react-tooltip";

export default function NavLinks() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="links">
      {pathname !== "/" ? (
        <>
          <Tooltip
            id="home-tooltip"
            style={{ backgroundColor: "rgb(255, 255, 255)", color: "#222" }}
          />
          <IoHomeSharp
            size={28}
            className="button-link"
            onClick={() => router.push("/")}
            data-tooltip-id="home-tooltip"
            data-tooltip-content="Home"
            data-tooltip-place="top"
          />
        </>
      ) : null}
    </div>
  );
}
