"use client";

import { isPendingAtom, mapPoolsAtom } from "@/atoms/atoms";
import ErrorHint from "@/components/ErrorHint";
import Loading from "@/components/Loading";
import { useAtom } from "jotai";
import _ from "lodash";
import { FormEvent, useEffect } from "react";
import toast from "react-hot-toast";

export default function Home() {
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

  const launchLobby = (e: FormEvent) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    console.log(formData.get("mapPool"));
    console.log(formData.get("hostName"));
    console.log(formData.get("opponentName"));

    toast.promise(createLobby(), {
      loading: "Creating your lobby...",
      success: <b>Lobby created successfully!</b>,
      error: <b>Error creating lobby 😥</b>,
    });
  };

  const createLobby = () => {
    // Fake temporary promise!
    return new Promise((resolve, reject) => {
      // Simulate a network request delay
      setTimeout(() => {
        const success = Math.random() > 0.5; // Randomly decide if it succeeds or fails
        if (success) {
          resolve("Lobby created successfully!");
        } else {
          reject("Error creating the lobby. 😥");
        }
      }, 1000); // 1-second delay for simulation
    });
  };

  return (
    <form onSubmit={launchLobby}>
      {/* Map Pool Selection */}
      <p>Choose a map pool:</p>
      {mapPools.length && !isPending ? (
        <select required name="mapPool">
          {mapPools.map((map: unknown) => (
            <option key={map.id} value={map.name}>
              {map.name}
            </option>
          ))}
        </select>
      ) : null}
      {isPending ? <Loading /> : null}

      {/* Player Names */}
      <div className="flex-column mt-2 mb-1">
        <p>Player Names (or BattleTags):</p>
        <input required name="hostName" type="text" placeholder="Host name" />
        <input
          required
          name="opponentName"
          type="text"
          placeholder="Opponent name"
        />
      </div>

      {/* Action Buttons */}
      <button
        className="generic-button"
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
