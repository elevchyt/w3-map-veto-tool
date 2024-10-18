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

export type LobbyType = {
  p1: string;
  p2: string;
  activePlayer: string;
  isBanning?: boolean;
  maps: MapType[];
};
