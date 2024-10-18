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

export type LobbyStateType = {
  isBanning?: boolean;
  activePlayerName: string;
  maps: MapType[];
};
