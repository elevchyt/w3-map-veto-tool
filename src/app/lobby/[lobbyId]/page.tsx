"use client";

import { get, onValue, ref } from "firebase/database";
import { db } from "@/firebase/firebase";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ActionTypeEnum, LobbyType } from "@/types/types";
import "./page.scss";
import Card from "@/components/Card/Card";
import { isPendingAtom } from "@/atoms/atoms";
import { useAtom } from "jotai";
import ErrorHint from "@/components/ErrorHint";
import Loading from "@/components/Loading";
import { MdContentCopy } from "react-icons/md";
import { Tooltip } from "react-tippy";
import toast from "react-hot-toast";
import { getPlayerFromID } from "@/utils/utils";

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
    if (p2ID)
      setP2URL(
        `${window.location.hostname}/lobby/${params.lobbyId}?setP2=${p2ID}`
      );

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

    // Establish realtime connection with lobby & get realtime updates
    const unsubscribe = onValue(lobbiesRef, (snapshot) => {
      const updatedLobbyData = snapshot.val();
      console.log("Lobby data updated in real-time:", updatedLobbyData);
      setLobbyData(updatedLobbyData);
    });
    return () => unsubscribe();
  }, [params.lobbyId, searchParams, setIsPending]);

  const copyP2URL = () => {
    navigator.clipboard.writeText(p2URL);
    toast.success("Copied to clipboard!");
  };

  // Gets the first order data that isn't done
  const getOrderData = () => {
    if (!lobbyData) return;
    return lobbyData.order.find((order) => order.done === false);
  };

  const getCurrentPlayerAction = () => {
    if (!lobbyData) return;
    const orderData = getOrderData();
    if (playerID === orderData?.id) return orderData?.actionType;
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
      <small className="mt-3">
        Viewing as: <b>{getPlayerFromID(playerID, lobbyData)}</b>
      </small>
      <p className="mt-3">
        {getOrderData()?.actionType}:{" "}
        <b>{getPlayerFromID(getOrderData()?.id, lobbyData)}</b>
      </p>

      {/* Maps Grid */}
      <div id="maps-grid">
        {lobbyData?.maps.map((map) => (
          <Card
            key={map.id}
            id={map.id}
            name={map.name}
            isBannedBy={getPlayerFromID(map.isBannedBy, lobbyData)}
            isPickedBy={getPlayerFromID(map.isPickedBy, lobbyData)}
            enableBanAction={getCurrentPlayerAction() === ActionTypeEnum.BAN}
            enablePickAction={getCurrentPlayerAction() === ActionTypeEnum.PICK}
          />
        ))}
        {isPending ? <Loading /> : null}

        {/* Feedback */}
        {!lobbyData?.maps && !isPending ? <ErrorHint /> : null}
      </div>
    </>
  );
}
