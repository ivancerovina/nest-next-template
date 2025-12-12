import { atom } from "jotai";
import type { TAuthAtom } from "./types";

export const authAtom = atom<TAuthAtom>({
  loading: true,
  user: undefined,
});
