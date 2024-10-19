import { LobbyType } from "@/types/types";

export const getPlayerFromID = (id: string | undefined, lobbyData: LobbyType | undefined) => {
  if (!lobbyData || !id) return;
  return lobbyData.p1.id === id ? lobbyData.p1.name : lobbyData.p2.name;
};
