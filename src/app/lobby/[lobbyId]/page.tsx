"use client";

import { get, ref } from "firebase/database";
import { db } from "@/firebase/firebase";
import { useEffect, useState } from "react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { LobbyType } from "@/types/types";
import "./page.scss";
import Card from "@/components/Card/Card";
import { isPendingAtom } from "@/atoms/atoms";
import { useAtom } from "jotai";
import ErrorHint from "@/components/ErrorHint";
import Loading from "@/components/Loading";
import { MdContentCopy } from "react-icons/md";
import { Tooltip } from "react-tippy";
import toast from "react-hot-toast";

export default function Lobby() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [lobbyData, setLobbyData] = useState<LobbyType>();
  const [isPending, setIsPending] = useAtom(isPendingAtom);
  const [playerID, setPlayerID] = useState<string>("");
  const [p2URL, setP2URL] = useState<string>("");

  useEffect(() => {
    // Set setP1 as the current player if p1ID exists in the search params
    const setP1 = searchParams.get("setP1");
    if (setP1) setPlayerID(setP1);

    // If P2 ID exists in search params with key "p2ID", set copy link's setP2 id as that
    const p2ID = searchParams.get("p2ID");
    if (p2ID) setP2URL(`${window.location.hostname}/lobby/${params.lobbyId}?setP2=${p2ID}`);

    // If P2 ID exists in search params with the key "setP2", set current player's sessions as P2
    const setP2 = searchParams.get("setP2");
    if (setP2) setPlayerID(setP2);

    // Load lobby data
    const lobbiesRef = ref(db, `/lobbies/${params.lobbyId}`);
    get(lobbiesRef)
      .then((snapshot) => {
        console.log(snapshot.val());
        setLobbyData(snapshot.val());
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => setIsPending(false));
  }, [params.lobbyId, searchParams, setIsPending]);

  const copyP2URL = () => {
    navigator.clipboard.writeText(p2URL);
    toast.success("Copied to clipboard!");
  };

  const getPlayerFromID = (id: string) => {
    if (!lobbyData) return;
    return lobbyData.p1.id === id ? lobbyData.p1.name : lobbyData.p2.name;
  };

  return (
    <>
      <div className="copy-link-container">
        <small>{`Lobby ID: ${params.lobbyId}`}</small>
        <Tooltip
          title="COPY"
          position="bottom"
          trigger="mouseenter"
          theme="light"
        >
          <MdContentCopy
            cursor="pointer"
            onClick={() => {
              copyP2URL();
            }}
          />
        </Tooltip>
      </div>

      {/* Lobby State */}
      <small className="mt-3">Viewing as: <b>{getPlayerFromID(playerID)}</b></small>
      <p className="mt-3">Banning: PLAYER</p>

      {/* Maps Grid */}
      <div id="maps-grid">
        {lobbyData?.maps.map((map) => (
          <Card
            key={map.id}
            id={map.id}
            name={map.name}
            isBannedBy={map.isBannedBy}
            isPickedBy={map.isPickedBy}
          />
        ))}
        {isPending ? <Loading /> : null}

        {/* Feedback */}
        {!lobbyData?.maps && !isPending ? <ErrorHint /> : null}
      </div>
    </>
  );
}
