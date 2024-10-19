"use client";

import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { IoHomeSharp } from "react-icons/io5";
import { Tooltip } from "react-tippy";

export default function NavLinks() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="links">
      {pathname !== "/" ? (
        <Tooltip
          title="Home"
          position="bottom"
          trigger="mouseenter"
          theme="light"
        >
          <IoHomeSharp
            size={28}
            className="button-link"
            onClick={() => router.push("/")}
          />
        </Tooltip>
      ) : null}
    </div>
  );
}
