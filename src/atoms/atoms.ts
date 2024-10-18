import { atom } from "jotai";

type MapPoolType = {
    name: string;
    maps: unknown[];
};

export const maps1v1Atom = atom<unknown[]>([]);
export const maps2v2Atom = atom<unknown[]>([]);
export const maps3v3Atom = atom<unknown[]>([]);
export const maps4v4Atom = atom<unknown[]>([]);
export const mapsAllTheRandoms1v1Atom = atom<unknown[]>([]);
export const mapPoolsAtom = atom<MapPoolType[]>([]);
export const isPendingAtom = atom(true);