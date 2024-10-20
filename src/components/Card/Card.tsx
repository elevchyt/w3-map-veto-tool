"use client";

import React from "react";
import "./Card.scss";
import { MapType } from "@/types/types";
import { w3infoMapImagesURL } from "@/utils/urls";
import Image from "next/image";

type PropsType = MapType & {
  enableBanAction?: boolean;
  enablePickAction?: boolean;
  handleBan: (mapID: number) => void;
  handlePick: (mapID: number) => void;
};

export default function Card(props: PropsType) {
  return (
    <div
      className={`card-container ${props.isBannedBy ? "banned" : ""}  ${
        props.isPickedBy ? "picked" : ""
      }`}
    >
      <p className="map-name">{props.name}</p>

      {props.isBannedBy ? <small>Banned by: {props.isBannedBy}</small> : null}
      {props.isPickedBy ? <small>Picked by: {props.isPickedBy}</small> : null}
      {!props.isBannedBy && !props.isPickedBy ? <small>-</small> : null}

      <div className="map-image-container">
        <Image
          className="map-image"
          src={`${w3infoMapImagesURL}/${props.image?.file_name}`}
          width={128}
          height={128}
          alt={props.name}
        />
      </div>

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
              BAN
            </button>
          ) : null}
          {props.enablePickAction ? (
            <button
              className="action-button"
              onClick={() => {
                props.handlePick(props.id);
              }}
            >
              PICK
            </button>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
