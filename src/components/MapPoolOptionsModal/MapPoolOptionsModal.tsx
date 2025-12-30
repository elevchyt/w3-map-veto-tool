import React, { useRef } from "react";
import "./MapPoolOptionsModal.scss";
import { MapPoolType, MapType } from "@/types/types";
import shortUUID from "short-uuid";

type PropsType = {
  selectedMapPool: MapPoolType;
  maps: MapType[] | undefined;
  toggleMap: (mapID: number) => void;
};

export default function MapPoolOptionsModal(props: PropsType) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const openModal = () => {
    if (dialogRef.current) dialogRef.current.showModal();
  };

  // Close the dialog
  const closeModal = () => {
    if (dialogRef.current) dialogRef.current.close();
  };

  return (
    <div>
      <div>
        <button className="generic-button" type="button" onClick={openModal}>
          Map Pool Options
        </button>
        {props.selectedMapPool.name.startsWith("GNL") ? (
          <span
            style={{ fontSize: "0.8em", marginLeft: "10px" }}
            className="animation-pulse"
          >
            ← Make sure to remove the starting map before launching the lobby!
          </span>
        ) : null}
      </div>

      <dialog ref={dialogRef}>
        <h2>Map Pool Options</h2>
        <div className="description">
          You may exclude maps from the selected pool in case of a limited map
          pool or a starting map.
        </div>
        {props.maps && props.maps.length ? (
          <div className="maps-list">
            {props.maps.map((map) => (
              <div className="map-entry" key={shortUUID.generate()}>
                <label className="map-entry" key={shortUUID.generate()}>
                  <input
                    type="checkbox"
                    checked={!map.isExcluded}
                    onChange={() => props.toggleMap(map.id)}
                  />
                  {map.name}
                </label>
              </div>
            ))}
          </div>
        ) : null}

        <button type="button" className="ok-button" onClick={closeModal}>
          OK
        </button>
      </dialog>
    </div>
  );
}
