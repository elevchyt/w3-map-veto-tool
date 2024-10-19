"use client";

import { isPendingAtom, mapPoolsAtom } from "@/atoms/atoms";
import ErrorHint from "@/components/ErrorHint";
import Loading from "@/components/Loading";
import { db } from "@/firebase/firebase";
import {
  ActionTypeEnum,
  LobbyType,
  MapPoolType,
  OrderType,
  PickBanModeEnum,
} from "@/types/types";
import { ref, set } from "firebase/database";
import { useAtom } from "jotai";
import _ from "lodash";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import short from "short-uuid";
import "./page.scss";
import MapPoolOptionsModal from "@/components/MapPoolOptionsModal/MapPoolOptionsModal";
import { Tooltip } from "react-tippy";

export default function Home() {
  const router = useRouter();
  const [isPending, setIsPending] = useAtom(isPendingAtom);
  const [mapPools, setMapPools] = useAtom(mapPoolsAtom);
  const [selectedMapPoolName, setSelectedMapPoolName] = useState("");
  const [selectedMapPool, setSelectedMapPool] = useState<MapPoolType>({
    name: "",
    maps: [],
  });

  const pickBanModes = [PickBanModeEnum.AB, PickBanModeEnum.AABB];

  const w3championsLadderMapsDataURL =
    "https://website-backend.w3champions.com/api/ladder/active-modes";

  useEffect(() => {
    setIsPending(true);
    fetch(w3championsLadderMapsDataURL)
      .then((res) => res.json())
      .then((data) => {
        const mapsPerGameMode = _.groupBy(data, "name");
        const maps1v1 = mapsPerGameMode["1 vs 1"][0]["maps"];
        const maps2v2 = mapsPerGameMode["2 vs 2"][0]["maps"];
        const maps3v3 = mapsPerGameMode["3 vs 3"][0]["maps"];
        const maps4v4 = mapsPerGameMode["4 vs 4"][0]["maps"];
        const mapsAllTheRandoms1v1 =
          mapsPerGameMode["All The Randoms 1vs1"][0]["maps"];

        const presetMapPools = [
          {
            name: "W3Champions (1v1)",
            maps: maps1v1,
          },
          {
            name: "W3Champions (2v2)",
            maps: maps2v2,
          },
          {
            name: "W3Champions (3v3)",
            maps: maps3v3,
          },
          {
            name: "W3Champions (4v4)",
            maps: maps4v4,
          },
          {
            name: "W3Champions (All The Randoms 1v1)",
            maps: mapsAllTheRandoms1v1,
          },
        ];

        setMapPools(presetMapPools);
        setSelectedMapPoolName(presetMapPools[0].name);
        setSelectedMapPool(presetMapPools[0]);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setIsPending(false);
      });
  }, [setIsPending, setMapPools]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const newLobbyID = short.generate();
    const p1ID = short.generate();
    const p2ID = short.generate();
    const p1Name = formData.get("p1Name") as string;
    const p2Name = formData.get("p2Name") as string;
    const pickBanMode = formData.get("pickBanMode") as PickBanModeEnum;
    const finalMapPool = setupMapPool(selectedMapPool);
    if (!finalMapPool) return;

    const pickBanOrder = getPickBanModeOrder(
      pickBanMode,
      finalMapPool,
      p1ID,
      p2ID
    );

    const newLobbyPayload: LobbyType = {
      p1: {
        id: p1ID,
        name: p1Name,
      },
      p2: {
        id: p2ID,
        name: p2Name,
      },
      maps: finalMapPool.maps,
      order: pickBanOrder,
    };

    toast
      .promise(createLobby(newLobbyID, newLobbyPayload), {
        loading: "Creating your lobby...",
        success: <b>Lobby created successfully!</b>,
        error: <b>Error creating lobby 😥</b>,
      })
      .then(() => {
        router.push(`/lobby/${newLobbyID}?setP1=${p1ID}&p2ID=${p2ID}`);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const createLobby = (newLobbyID: string, payload: LobbyType) => {
    return set(ref(db, `/lobbies/${newLobbyID}`), payload);
  };

  // Mutate the selected map pool so that each map entry has isBannedBy & isPickedBy properties
  const setupMapPool = (mapPool: MapPoolType | undefined) => {
    if (!mapPool) return;
    mapPool.maps = mapPool.maps
      .filter((map) => !map.isExcluded)
      .map((map) => ({
        ...map,
        isBannedBy: "",
        isPickedBy: "",
      }));
    return mapPool;
  };

  const getPickBanModeOrder = (
    pickBanMode: PickBanModeEnum,
    mapPool: MapPoolType,
    p1ID: string,
    p2ID: string
  ): OrderType[] => {
    let pickBanOrder: OrderType[] = [];
    if (pickBanMode === PickBanModeEnum.AB) {
      pickBanOrder = mapPool.maps.map((map, index) => {
        const playerID = index % 2 === 0 ? p1ID : p2ID;
        return {
          id: playerID,
          done: false,
          actionType:
            index < mapPool.maps.length - 2
              ? ActionTypeEnum.BAN
              : ActionTypeEnum.PICK,
        };
      });
    } else if (pickBanMode === PickBanModeEnum.AABB) {
      pickBanOrder = mapPool.maps.map((map, index) => {
        const playerID =
          index === mapPool.maps.length - 2
            ? p1ID
            : index === mapPool.maps.length - 1
            ? p2ID
            : Math.floor(index / 2) % 2 === 0
            ? p1ID
            : p2ID;
        return {
          id: playerID,
          done: false,
          actionType:
            index < mapPool.maps.length - 2
              ? ActionTypeEnum.BAN
              : ActionTypeEnum.PICK,
        };
      });
    }
    return pickBanOrder;
  };

  const toggleMap = (mapID: number) => {
    const newMapPool: MapPoolType = _.cloneDeep(selectedMapPool);
    if (!newMapPool.maps || !newMapPool.maps.length) return;
    newMapPool.maps = newMapPool.maps.map((map) => {
      if (map.id === mapID) return { ...map, isExcluded: !map.isExcluded };
      return map;
    });
    setSelectedMapPool(newMapPool);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Map Pool Selection */}
      <p>Choose a map pool:</p>
      <div className="map-pool-selection">
        {mapPools.length && !isPending ? (
          <select
            required
            name="mapPool"
            value={selectedMapPoolName}
            onChange={(e) => {
              setSelectedMapPoolName(e.target.value);
              const selectedPool = mapPools.find(
                (pool) => pool.name === e.target.value
              );
              if (selectedPool) setSelectedMapPool(selectedPool);
            }}
          >
            {mapPools.map((map) => (
              <option key={short.generate()} value={map.name}>
                {map.name}
              </option>
            ))}
          </select>
        ) : null}

        {/* Pick/Ban Mode */}
        <Tooltip
          title="Banning Order"
          position="top"
          trigger="mouseenter"
          theme="light"
        >
          <select required name="pickBanMode">
            {pickBanModes.map((mode) => (
              <option key={short.generate()} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </Tooltip>
        {isPending ? <Loading /> : null}
      </div>

      {/* Map Pool Options */}
      <MapPoolOptionsModal maps={selectedMapPool?.maps} toggleMap={toggleMap} />

      {/* Player Names */}
      <div className="flex-column mt-2 mb-1">
        <p>Player Names (or BattleTags):</p>
        <input
          required
          name="p1Name"
          type="text"
          placeholder="Player 1 Name (Host)"
        />
        <input required name="p2Name" type="text" placeholder="Player 2 Name" />
      </div>

      {/* Action Buttons */}
      <button
        className="submit-button"
        type="submit"
        disabled={isPending || !mapPools.length}
      >
        Launch Lobby
      </button>

      {/* Feedback */}
      {!mapPools.length && !isPending ? <ErrorHint /> : null}
    </form>
  );
}
