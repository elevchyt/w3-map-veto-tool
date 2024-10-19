"use client";

/* eslint-disable @next/next/no-img-element */
import React from "react";
import "./Footer.scss";
import { SiGithub } from "react-icons/si";

export default function Footer() {
  return (
    <footer>
      <p>Created by biskuit#21557</p>
      <a href="https://ko-fi.com/O4O3LO6XY" target="_blank">
        <img
          width={128}
          src="https://storage.ko-fi.com/cdn/kofi2.png?v=3"
          alt="Buy Me a Coffee at ko-fi.com"
        />
      </a>
      <div
        className="github"
        onClick={() =>
          window.open("https://github.com/elevchyt/w3-map-veto-tool", "_blank")
        }
      >
        <SiGithub size={32} />
      </div>
    </footer>
  );
}
