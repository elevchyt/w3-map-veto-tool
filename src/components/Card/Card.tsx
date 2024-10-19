"use client";

import React from "react";
import "./Card.scss";
import { MapType } from "@/types/types";

type PropsType = MapType & {
  enableBanAction?: boolean;
  enablePickAction?: boolean;
  handleBan: (mapID: number) => void;
  handlePick: (mapID: number) => void;
};

export default function Card(props: PropsType) {
  return (
    <div className={`card-container ${props.isBannedBy ? "banned" : ""}  ${props.isPickedBy ? "picked" : ""}`}>
      <p>{props.name}</p>

      {props.isBannedBy ? <small>Banned by: {props.isBannedBy}</small> : null}
      {props.isPickedBy ? <small>Picked by: {props.isPickedBy}</small> : null}

      {/* MAP IMAGE GOES HERE */}

      {/* Actions */}
      {!props.isBannedBy && !props.isPickedBy ? (
        <>
          {props.enableBanAction ? (
            <button
              className="action-button"
              onClick={() => {
                props.handleBan(props.id);
              }}
            >
              Ban
            </button>
          ) : null}
          {props.enablePickAction ? (
            <button
              className="action-button"
              onClick={() => {
                props.handlePick(props.id);
              }}
            >
              Pick
            </button>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
