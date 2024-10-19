import React from "react";
import "./Card.scss";
import { MapType } from "@/types/types";

type PropsType = MapType & {
  enableBanAction?: boolean;
  enablePickAction?: boolean;
};

export default function Card(props: PropsType) {
  return (
    <div className={`card-container ${props.isBannedBy ? "banned" : ""}`}>
      <p>{props.name}</p>

      {props.isBannedBy ? <small>Banned by: {props.isBannedBy}</small> : null}
      {props.isPickedBy ? <small>Picked by: {props.isPickedBy}</small> : null}

      {/* MAP IMAGE GOES HERE */}

      {/* Actions */}
      {!props.isBannedBy && !props.isPickedBy ? (
        <>
          {props.enableBanAction ? (
            <button className="action-button">Ban</button>
          ) : null}
          {props.enablePickAction ? (
            <button className="action-button">Pick</button>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
