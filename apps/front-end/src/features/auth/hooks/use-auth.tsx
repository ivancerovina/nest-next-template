import { useAtomValue } from "jotai";
import { authAtom } from "../atoms";

export function useAuth() {
  return useAtomValue(authAtom);
}
