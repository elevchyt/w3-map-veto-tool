import { LobbyType } from "@/types/types";
import stringSimilarity from "string-similarity";

export const getPlayerFromID = (
  id: string | undefined,
  lobbyData: LobbyType | undefined
) => {
  if (!lobbyData || !id) return;
  return lobbyData.p1.id === id ? lobbyData.p1.name : lobbyData.p2.name;
};

export function getStringBestMatch(
  name: string,
  candidates: { name: string }[],
  threshold: number = 0.9
) {
  const matches = stringSimilarity.findBestMatch(
    name,
    candidates.map((candidate) => candidate.name)
  );

  // Check if the best match is above the threshold
  if (matches.bestMatch.rating >= threshold) {
    const bestMatchName = matches.bestMatch.target;
    return candidates.find((candidate) => candidate.name === bestMatchName);
  }
  return null;
}
