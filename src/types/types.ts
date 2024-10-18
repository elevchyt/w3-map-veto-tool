export type MapType = {
  id: number;
  name: string;
  isBannedBy?: string;
  isPickedBy?: string;
};

export type MapPoolType = {
  name: string;
  maps: MapType[];
};

type PlayerType = {
  id: string;
  name: string;
  isBanning: boolean;
  isPicking: boolean;
};
export type LobbyType = {
  p1: PlayerType;
  p2: PlayerType;
  maps: MapType[];
};
