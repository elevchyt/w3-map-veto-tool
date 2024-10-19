"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { IoHomeSharp } from "react-icons/io5";
import { Tooltip } from "react-tippy";

export default function NavLinks() {
  const router = useRouter();
  return (
    <div className="links">
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
    </div>
  );
}
