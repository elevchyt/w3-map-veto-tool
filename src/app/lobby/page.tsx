"use client";

import { get, ref } from "firebase/database";
import { database } from "@/firebase/firebase";
import { useEffect } from "react";

export default function Lobby() {
  useEffect(() => {
    const lobbiesRef = ref(database, "lobbies/1");
    get(lobbiesRef).then((snapshot) => {
      console.log(snapshot.val());
    });
  }, []);

  return (
    <>
      <h1>lobby</h1>
    </>
  );
}
