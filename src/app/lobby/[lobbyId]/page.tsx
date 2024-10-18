"use client";

import { get, ref } from "firebase/database";
import { db } from "@/firebase/firebase";
import { useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";

export default function Lobby() {
  const params = useParams();
  const searchParams = useSearchParams();

  useEffect(() => {
    console.warn(searchParams.get('p2ID'));
    // Load lobby data
    const lobbiesRef = ref(db, `/lobbies/${params.lobbyId}`);
    get(lobbiesRef)
      .then((snapshot) => {
        console.log(snapshot.val());
      })
      .catch((err) => {
        console.log(err);
      });
  }, [params.lobbyId, searchParams]);

  return (
    <>
      <small>{`Lobby ID: ${params.lobbyId}`}</small>
    </>
  );
}
