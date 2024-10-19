export enum ActionTypeEnum {
  BAN = "Banning",
  PICK = "Picking",
}

export enum PickBanModeEnum {
  AB = "A-B",
  AABB = "A-A-B-B",
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

export type OrderType = {
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
