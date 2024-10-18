"use client";

import { get, ref } from "firebase/database";
import { database } from "@/firebase/firebase";
import { useEffect } from "react";
import { useParams } from "next/navigation";

export default function Lobby() {
  const params = useParams();

  useEffect(() => {
    const lobbiesRef = ref(database, `/lobbies/${params.lobbyId}`);
    get(lobbiesRef)
      .then((snapshot) => {
        console.log(snapshot.val());
      })
      .catch((err) => {
        console.log(err);
      });
  }, [params.lobbyId]);

  return (
    <>
      <small>{`Lobby ID: ${params.lobbyId}`}</small>
    </>
  );
}
