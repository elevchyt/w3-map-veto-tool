"use client";

import { get, onValue, ref, set } from "firebase/database";
import { db } from "@/firebase/firebase";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ActionTypeEnum, LobbyType } from "@/types/types";
import "./page.scss";
import Card from "@/components/Card/Card";
import ErrorHint from "@/components/ErrorHint";
import Loading from "@/components/Loading";
import toast from "react-hot-toast";
import { getPlayerFromID } from "@/utils/utils";
import _ from "lodash";

export default function Lobby() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [lobbyData, setLobbyData] = useState<LobbyType>();
  const [isPending, setIsPending] = useState<boolean>(true);
  const [playerID, setPlayerID] = useState<string>("");
  const [p2URL, setP2URL] = useState<string>("");
  const [validationError, setValidationError] = useState<string>("");

  // Validate lobby data structure
  const validateLobbyData = (data: any): boolean => {
    if (!data) {
      setValidationError("Lobby data is missing");
      return false;
    }
    if (!data.p1 || !data.p1.id || !data.p1.name) {
      setValidationError("Player 1 data is missing or incomplete");
      return false;
    }
    if (!data.p2 || !data.p2.id || !data.p2.name) {
      setValidationError("Player 2 data is missing or incomplete");
      return false;
    }
    if (!Array.isArray(data.maps) || data.maps.length === 0) {
      setValidationError("Maps data is missing or invalid");
      return false;
    }
    if (!Array.isArray(data.order) || data.order.length === 0) {
      setValidationError(
        "Order data is missing or invalid. This lobby may have been created with an error."
      );
      return false;
    }
    setValidationError("");
    return true;
  };

  useEffect(() => {
    // Set setP1 as the current player if p1ID exists in the search params
    const setP1 = searchParams.get("setP1");
    if (setP1) setPlayerID(setP1);

    // If P2 ID exists in search params with key "p2ID", set copy link's setP2 id as that
    const p2ID = searchParams.get("p2ID");
    if (p2ID)
      setP2URL(
        `https://${window.location.hostname}/lobby/${params.lobbyId}?setP2=${p2ID}`
      );

    // If P2 ID exists in search params with the key "setP2", set current player's sessions as P2
    const setP2 = searchParams.get("setP2");
    if (setP2) setPlayerID(setP2);

    // Load lobby data
    setIsPending(true);
    const lobbiesRef = ref(db, `/lobbies/${params.lobbyId}`);
    get(lobbiesRef)
      .then((snapshot) => {
        const data = snapshot.val();
        if (validateLobbyData(data)) {
          setLobbyData(data);
        }
      })
      .catch((err) => {
        console.log(err);
        setValidationError("Error loading lobby data");
      })
      .finally(() => setIsPending(false));

    // Establish realtime connection with lobby & get realtime updates
    const unsubscribe = onValue(lobbiesRef, (snapshot) => {
      const updatedLobbyData = snapshot.val();
      if (validateLobbyData(updatedLobbyData)) {
        setLobbyData(updatedLobbyData);
      }
    });
    return () => unsubscribe();
  }, [params.lobbyId, searchParams, setIsPending]);

  const copyP2URL = () => {
    navigator.clipboard.writeText(p2URL);
    toast.success("Copied to clipboard!");
  };

  // Gets the first order data that isn't done
  const getOrderData = () => {
    if (!lobbyData || !lobbyData.order) return;
    return lobbyData.order.find((order) => order.done === false);
  };

  const getCurrentPlayerAction = () => {
    if (!lobbyData) return;
    const orderData = getOrderData();
    if (playerID === orderData?.id) return orderData?.actionType;
  };

  const handleBan = (mapID: number) => {
    if (!lobbyData) return;

    const currentOrderDataIndex = _.findIndex(lobbyData.order, {
      id: playerID,
      done: false,
    });
    const updatedOrderData = lobbyData.order.map((order, index) => {
      if (index === currentOrderDataIndex) return { ...order, done: true };
      return order;
    });
    const payload = {
      ...lobbyData,
      order: updatedOrderData,
      maps: lobbyData?.maps.map((map) => {
        if (map.id === mapID) {
          return { ...map, isBannedBy: playerID };
        }
        return map;
      }),
    };
    return set(ref(db, `/lobbies/${params.lobbyId}`), payload);
  };

  const handlePick = (mapID: number) => {
    if (!lobbyData) return;

    const currentOrderDataIndex = _.findIndex(lobbyData.order, {
      id: playerID,
      done: false,
    });
    const updatedOrderData = lobbyData.order.map((order, index) => {
      if (index === currentOrderDataIndex) return { ...order, done: true };
      return order;
    });
    // Find the highest pickNumber value among the maps and assign that
    const highestPickNumber = Math.max(
      0,
      ...lobbyData.maps.map((map) => map.pickNumber || 0)
    );
    const pickNumber = highestPickNumber + 1;
    const payload = {
      ...lobbyData,
      order: updatedOrderData,
      maps: lobbyData?.maps.map((map) => {
        if (map.id === mapID) {
          return { ...map, pickNumber, isPickedBy: playerID };
        }
        return map;
      }),
    };
    return set(ref(db, `/lobbies/${params.lobbyId}`), payload);
  };

  // Show loading state until data is fetched
  if (isPending) {
    return <Loading />;
  }

  // Show error if lobby doesn't exist or validation failed
  if (!lobbyData || validationError) {
    return (
      <div>
        <ErrorHint />
        {validationError && (
          <p style={{ color: "red", marginTop: "1rem", textAlign: "center" }}>
            {validationError}
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="copy-link-container">
        <small>{`Lobby ID: ${params.lobbyId}`}</small>
        {p2URL ? (
          <button
            className="generic-button"
            onClick={() => {
              copyP2URL();
            }}
          >
            Copy Opponent&apos;s URL
          </button>
        ) : null}
        <span
          style={{ fontSize: "0.8em", marginLeft: "10px" }}
          className="animation-pulse"
        >
          ← Click this button and send the link to your opponent!
        </span>
      </div>

      {/* Lobby State */}
      <small className="mt-3">
        Viewing as: <b>{getPlayerFromID(playerID, lobbyData)}</b>
      </small>
      <p className="mt-3">
        {getOrderData()?.id ? (
          <>
            {getOrderData()?.actionType}:{" "}
            <b>{getPlayerFromID(getOrderData()?.id, lobbyData)}</b>
          </>
        ) : null}
      </p>

      {/* Maps Grid */}
      <div id="maps-grid">
        {lobbyData.maps?.map((map) => (
          <Card
            key={map.id}
            id={map.id}
            name={map.name}
            image={map.image}
            pickNumber={map.pickNumber}
            isBannedBy={getPlayerFromID(map.isBannedBy, lobbyData)}
            isPickedBy={getPlayerFromID(map.isPickedBy, lobbyData)}
            enableBanAction={getCurrentPlayerAction() === ActionTypeEnum.BAN}
            enablePickAction={getCurrentPlayerAction() === ActionTypeEnum.PICK}
            handleBan={handleBan}
            handlePick={handlePick}
          />
        ))}

        {/* Feedback */}
        {!lobbyData.maps ? <ErrorHint /> : null}
      </div>
    </>
  );
}
