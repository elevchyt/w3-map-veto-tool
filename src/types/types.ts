export enum ActionTypeEnum {
  BAN = "Banning",
  PICK = "Picking",
}

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
};

type OrderType = {
  id: string;
  done: boolean;
  actionType: ActionTypeEnum;
};

export type LobbyType = {
  p1: PlayerType;
  p2: PlayerType;
  maps: MapType[];
  order: OrderType[];
};
