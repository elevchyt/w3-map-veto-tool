"use client";

import { isPendingAtom, mapPoolsAtom } from "@/atoms/atoms";
import ErrorHint from "@/components/ErrorHint";
import Loading from "@/components/Loading";
import { db } from "@/firebase/firebase";
import { ActionTypeEnum, LobbyType, MapPoolType } from "@/types/types";
import { ref, set } from "firebase/database";
import { useAtom } from "jotai";
import _ from "lodash";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect } from "react";
import toast from "react-hot-toast";
import short from "short-uuid";

export default function Home() {
  const router = useRouter();
  const [isPending, setIsPending] = useAtom(isPendingAtom);
  const [mapPools, setMapPools] = useAtom(mapPoolsAtom);

  const w3championsLadderDataURL =
    "https://website-backend.w3champions.com/api/ladder/active-modes";

  useEffect(() => {
    setIsPending(true);
    fetch(w3championsLadderDataURL)
      .then((res) => res.json())
      .then((data) => {
        const mapsPerGameMode = _.groupBy(data, "name");
        const maps1v1 = mapsPerGameMode["1 vs 1"][0]["maps"];
        const maps2v2 = mapsPerGameMode["2 vs 2"][0]["maps"];
        const maps3v3 = mapsPerGameMode["3 vs 3"][0]["maps"];
        const maps4v4 = mapsPerGameMode["4 vs 4"][0]["maps"];
        const mapsAllTheRandoms1v1 =
          mapsPerGameMode["All The Randoms 1vs1"][0]["maps"];

        const newMapPools = [
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

        setMapPools(newMapPools);
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
    const mapPoolName = formData.get("mapPool") as string;
    let mapPool = mapPools.find((pool) => pool.name === mapPoolName);
    mapPool = setupMapPool(mapPool);
    if (!mapPool) return;

    const gnlOrder = [
      {
        id: p1ID,
        done: false,
        actionType: ActionTypeEnum.BAN,
      },
      {
        id: p2ID,
        done: false,
        actionType: ActionTypeEnum.BAN,
      },
      {
        id: p1ID,
        done: false,
        actionType: ActionTypeEnum.BAN,
      },
      {
        id: p2ID,
        done: false,
        actionType: ActionTypeEnum.BAN,
      },
      {
        id: p1ID,
        done: false,
        actionType: ActionTypeEnum.BAN,
      },
      {
        id: p2ID,
        done: false,
        actionType: ActionTypeEnum.BAN,
      },
      {
        id: p1ID,
        done: false,
        actionType: ActionTypeEnum.PICK,
      },
      {
        id: p2ID,
        done: false,
        actionType: ActionTypeEnum.PICK,
      },
    ];

    const newLobbyPayload: LobbyType = {
      p1: {
        id: p1ID,
        name: p1Name,
      },
      p2: {
        id: p2ID,
        name: p2Name,
      },
      maps: mapPool.maps,
      order: gnlOrder,
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
    mapPool.maps = mapPool.maps.map((map) => ({
      ...map,
      isBannedBy: "",
      isPickedBy: "",
    }));
    return mapPool;
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Map Pool Selection */}
      <p>Choose a map pool:</p>
      {mapPools.length && !isPending ? (
        <select required name="mapPool">
          {mapPools.map((map) => (
            <option key={short.generate()} value={map.name}>
              {map.name}
            </option>
          ))}
        </select>
      ) : null}
      {isPending ? <Loading /> : null}

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
