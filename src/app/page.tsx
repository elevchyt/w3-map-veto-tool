/* eslint-disable @typescript-eslint/no-unused-vars -- we need this */
"use client";

import { isLoadingDataAtom, mapPoolsAtom } from "@/atoms/atoms";
import ErrorHint from "@/components/ErrorHint";
import Loading from "@/components/Loading";
import MapPoolOptionsModal from "@/components/MapPoolOptionsModal/MapPoolOptionsModal";
import { db } from "@/firebase/firebase";
import {
  ActionTypeEnum,
  LobbyType,
  MapPoolType,
  MapType,
  OrderType,
  PickBanModeEnum,
} from "@/types/types";
import { GNLS17MapNames } from "@/utils/customMapPools";
import { w3championsLadderMapsDataURL, w3infoMapsURL } from "@/utils/urls";
import { getMapBestMatchByName } from "@/utils/utils";
import { ref, set } from "firebase/database";
import { useAtom } from "jotai";
import _ from "lodash";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { Tooltip } from "react-tooltip";
import short from "short-uuid";
import stringSimilarity from "string-similarity";
import "./page.scss";

export default function Home() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoadingData, setIsLoadingData] = useAtom(isLoadingDataAtom);
  const [mapPools, setMapPools] = useAtom(mapPoolsAtom);
  const [selectedMapPoolName, setSelectedMapPoolName] = useState("");
  const [selectedPickBanOrder, setSelectedPickBanOrder] = useState(
    PickBanModeEnum.ABBAAB
  );
  const [selectedMapPool, setSelectedMapPool] = useState<MapPoolType>({
    name: "",
    maps: [],
  });

  const pickBanModes = [
    PickBanModeEnum.ABBAAB,
    PickBanModeEnum.Bo3,
    PickBanModeEnum.Bo5,
    PickBanModeEnum.AB,
    PickBanModeEnum.AABB,
  ];

  useEffect(() => {
    setIsLoadingData(true);
    const w3ChampionsDataRequest = fetch(w3championsLadderMapsDataURL)
      .then((res) => res.json())
      .then((data) => {
        return data;
      })
      .catch((err) => {
        console.error(err);
      });
    const w3infoMapDataRequest = fetch(w3infoMapsURL)
      .then((res) => res.json())
      .then((data) => {
        return data;
      });

    Promise.all([w3ChampionsDataRequest, w3infoMapDataRequest])
      .then((res) => {
        console.log("-> All data requests were successful! 😁");
        const w3cRes = res[0];
        const w3infoRes = res[1];

        // Add image url & map short name to each map by using warcraft3.info's map data
        w3cRes.forEach((item: { maps: unknown[] }) => {
          item.maps.forEach((map: unknown) => {
            const mapTyped = map as {
              name: string;
              short?: string;
              image?: ImageData;
            };
            const matchingItem = getMapBestMatchByName(
              mapTyped.name,
              w3infoRes,
              0.7
            );
            if (matchingItem) {
              mapTyped.image = matchingItem.image;
              if (matchingItem.short)
                mapTyped.name = `${mapTyped.name} (${matchingItem.short})`;
            }
          });
        });
        const groupedMaps = _.groupBy(w3cRes, "name"); // Group maps by name
        const mapsPerGameMode = new Map<string, MapPoolType[]>(
          Object.entries(groupedMaps)
        );
        const maps1v1w3c = mapsPerGameMode.get("1 vs 1")?.[0]["maps"] ?? [];
        const maps2v2w3c = mapsPerGameMode.get("2 vs 2")?.[0]["maps"] ?? [];
        const maps4v4w3c = mapsPerGameMode.get("4 vs 4")?.[0]["maps"] ?? [];
        const mapsAllTheRandoms1v1w3c =
          mapsPerGameMode.get("All The Randoms 1vs1")?.[0]["maps"] ?? [];
        const mapsGNLSeason17 =
          createMapPoolByMapNames(mapsPerGameMode, GNLS17MapNames) ?? [];
        const presetMapPools: MapPoolType[] = [
          {
            name: "GNL Season 17",
            maps: mapsGNLSeason17,
          },
          {
            name: "W3Champions (1v1)",
            maps: maps1v1w3c,
          },
          {
            name: "W3Champions (2v2)",
            maps: maps2v2w3c,
          },
          {
            name: "W3Champions (4v4)",
            maps: maps4v4w3c,
          },
          {
            name: "W3Champions (All The Randoms 1v1)",
            maps: mapsAllTheRandoms1v1w3c,
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
        setIsLoadingData(false);
      });
  }, [setIsLoadingData, setMapPools]);

  const createMapPoolByMapNames = (
    mapsPerGameMode: Map<string, MapPoolType[]>,
    mapNamesPool: string[]
  ): MapType[] => {
    const mapsFoundData = new Map<string, boolean>(
      mapNamesPool.map((mapName) => [mapName, false])
    ); // ensures no duplicate maps are inserted
    const maps: MapType[] = [];
    for (const [_key, pool] of Array.from(mapsPerGameMode.entries())) {
      const mapPool = pool[0].maps;
      for (const map of mapPool) {
        for (const mapName of mapNamesPool) {
          const nameSimilarityThreshold = 0.7;
          const bestMatch = stringSimilarity.findBestMatch(
            map.name,
            mapNamesPool
          );
          const isFound = bestMatch.bestMatch.rating >= nameSimilarityThreshold;
          if (isFound && !mapsFoundData.get(mapName)) {
            mapsFoundData.set(mapName, true);
            maps.push(map);
            break;
          }
        }
      }
    }
    if (maps.length !== mapNamesPool.length)
      console.error("[ERROR] Map pool has mistakes! 😥");
    return _.sortBy(maps, "name");
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const newLobbyID = short.generate();
    const p1ID = short.generate();
    const p2ID = short.generate();
    const p1Name = formData.get("p1Name") as string;
    const p2Name = formData.get("p2Name") as string;
    // Use state instead of formData for pickBanMode since disabled fields don't submit
    const pickBanMode = selectedPickBanOrder as PickBanModeEnum;
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
        startTransition(() => {
          router.push(`/lobby/${newLobbyID}?setP1=${p1ID}&p2ID=${p2ID}`);
        });
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
    switch (pickBanMode) {
      case PickBanModeEnum.ABBAAB:
        pickBanOrder = [
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
        break;
      case PickBanModeEnum.Bo3:
        pickBanOrder = [
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
            id: p2ID,
            done: false,
            actionType: ActionTypeEnum.PICK,
          },
          {
            id: p1ID,
            done: false,
            actionType: ActionTypeEnum.PICK,
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
            id: p2ID,
            done: false,
            actionType: ActionTypeEnum.BAN,
          },
          {
            id: p1ID,
            done: false,
            actionType: ActionTypeEnum.BAN,
          },
        ];
        break;
      case PickBanModeEnum.Bo5:
        pickBanOrder = [
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
            id: p2ID,
            done: false,
            actionType: ActionTypeEnum.PICK,
          },
          {
            id: p1ID,
            done: false,
            actionType: ActionTypeEnum.PICK,
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
            id: p2ID,
            done: false,
            actionType: ActionTypeEnum.PICK,
          },
          {
            id: p1ID,
            done: false,
            actionType: ActionTypeEnum.PICK,
          },
        ];
        break;
      case PickBanModeEnum.AABB:
        pickBanOrder = mapPool.maps.map((map, index) => {
          let playerID =
            index === mapPool.maps.length - 2
              ? p1ID
              : index === mapPool.maps.length - 1
                ? p2ID
                : Math.floor(index / 2) % 2 === 0
                  ? p1ID
                  : p2ID;
          if (index === mapPool.maps.length - 1) playerID = p2ID;
          else if (index === mapPool.maps.length - 2) playerID = p1ID;
          return {
            id: playerID,
            done: false,
            actionType:
              index < mapPool.maps.length - 2
                ? ActionTypeEnum.BAN
                : ActionTypeEnum.PICK,
          };
        });
        break;
      case PickBanModeEnum.AB:
        pickBanOrder = mapPool.maps.map((map, index) => {
          const playerID = index % 2 === 0 ? p1ID : p2ID;
          return {
            id: playerID,
            done: false,
            actionType:
              index < mapPool.maps.length - 1
                ? ActionTypeEnum.BAN
                : ActionTypeEnum.PICK,
          };
        });
        break;
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

  if (isLoadingData)
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Loading />
      </div>
    );

  return (
    <>
      <form onSubmit={handleSubmit}>
        {/* Map Pool Selection */}
        <p style={{ fontWeight: "bold" }}>Choose map pool and banning order:</p>
        <div className="map-pool-selection">
          {mapPools.length && !isLoadingData ? (
            <select
              required
              name="mapPool"
              value={selectedMapPoolName}
              onChange={(e) => {
                // If the user selects a GNL map pool, set the pick/ban mode to ABBAAB by default!
                if (e.target.value.startsWith("GNL")) {
                  setSelectedPickBanOrder(PickBanModeEnum.ABBAAB);
                }

                // Update selected map pool state
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
            id="pick-ban-tooltip"
            style={{ backgroundColor: "rgb(255, 255, 255)", color: "#222" }}
          />
          <select
            required
            disabled={selectedMapPool.name.startsWith("GNL")}
            name="pickBanMode"
            value={selectedPickBanOrder}
            onChange={(e) => {
              setSelectedPickBanOrder(e.target.value as PickBanModeEnum);
            }}
            data-tooltip-id="pick-ban-tooltip"
            data-tooltip-content="Banning order"
            data-tooltip-place="top"
          >
            {pickBanModes.map((mode) => (
              <option key={short.generate()} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </div>

        {/* Map Pool Options */}
        <MapPoolOptionsModal
          selectedMapPool={selectedMapPool}
          maps={selectedMapPool?.maps}
          toggleMap={toggleMap}
        />

        {/* Player Names */}
        <div className="flex-column mt-2 mb-1">
          <p style={{ fontWeight: "bold" }}>Player Names (or BattleTags):</p>
          <input
            required
            name="p1Name"
            type="text"
            placeholder="Player 1 Name (Host)"
            autoComplete="off"
          />
          <input
            required
            name="p2Name"
            type="text"
            placeholder="Player 2 Name"
            autoComplete="off"
          />
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <button
            className="generic-button"
            type="submit"
            disabled={isPending || isLoadingData || !mapPools.length}
          >
            Launch Lobby
          </button>
          {isPending ? <Loading /> : null}
        </div>
        {/* Feedback */}
        {!mapPools.length && !isLoadingData ? <ErrorHint /> : null}
      </form>
    </>
  );
}
