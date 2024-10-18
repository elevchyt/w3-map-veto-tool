import React from "react";
import "./Card.scss";
import { MapType } from "@/types/types";

export default function Card(props: MapType) {
  return (
    <div className={`card-container ${props.isBannedBy ? "banned" : ""}`}>
      <p>{props.name}</p>

      {props.isBannedBy ? <small>Banned by: {props.isBannedBy}</small> : null}
      {props.isPickedBy ? <small>Picked by: {props.isPickedBy}</small> : null}

      {/* MAP IMAGE GOES HERE */}

      {/* Actions */}
      <button className="action-button">Ban</button>
      <button className="action-button">Pick</button>
    </div>
  );
}
