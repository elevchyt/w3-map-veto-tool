"use client";

import {
  isPendingAtom,
  mapPoolsAtom,
  maps1v1Atom,
  maps2v2Atom,
  maps3v3Atom,
  maps4v4Atom,
  mapsAllTheRandoms1v1Atom,
} from "@/atoms/atoms";
import ErrorHint from "@/components/ErrorHint";
import Loading from "@/components/Loading";
import { useAtom } from "jotai";
import _ from "lodash";
import { useEffect } from "react";

export default function Home() {
  const [isPending, setIsPending] = useAtom(isPendingAtom);
  const [maps1v1, setMaps1v1] = useAtom(maps1v1Atom);
  const [maps2v2, setMaps2v2] = useAtom(maps2v2Atom);
  const [maps3v3, setMaps3v3] = useAtom(maps3v3Atom);
  const [maps4v4, setMaps4v4] = useAtom(maps4v4Atom);
  const [mapsAllTheRandoms1v1, setMapsAllTheRandoms1v1] = useAtom(
    mapsAllTheRandoms1v1Atom
  );
  const [mapPools, setMapPools] = useAtom(mapPoolsAtom);

  const w3championsLadderDataURL =
    "https://website-backend.w3champions.com/api/ladder/active-modes";

  useEffect(() => {
    setIsPending(true);
    fetch(w3championsLadderDataURL)
      .then((res) => res.json())
      .then((data) => {
        const mapsPerGameMode = _.groupBy(data, "name");
        console.log(mapsPerGameMode);
        const maps1v1 = mapsPerGameMode["1 vs 1"][0]["maps"];
        const maps2v2 = mapsPerGameMode["2 vs 2"][0]["maps"];
        const maps3v3 = mapsPerGameMode["3 vs 3"][0]["maps"];
        const maps4v4 = mapsPerGameMode["4 vs 4"][0]["maps"];
        const mapsAllTheRandoms1v1 =
          mapsPerGameMode["All The Randoms 1vs1"][0]["maps"];
        setMaps1v1(maps1v1);
        setMaps2v2(maps2v2);
        setMaps3v3(maps3v3);
        setMaps4v4(maps4v4);
        setMapsAllTheRandoms1v1(mapsAllTheRandoms1v1);

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
  }, [
    setIsPending,
    setMapPools,
    setMaps1v1,
    setMaps2v2,
    setMaps3v3,
    setMaps4v4,
    setMapsAllTheRandoms1v1,
  ]);

  return (
    <>
      <h1>Map Veto Tool</h1>

      {/* Map Pool Selection */}
      <p>Choose a map pool.</p>
      {maps1v1.length && !isPending ? (
        <select>
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
        <input type="text" placeholder="Host name" />
        <input type="text" placeholder="Opponent name" />
      </div>

      {/* Action Buttons */}
      <button>Launch Lobby</button>

      {/* Feedback */}
      {!maps1v1.length && !isPending ? <ErrorHint /> : null}
    </>
  );
}
