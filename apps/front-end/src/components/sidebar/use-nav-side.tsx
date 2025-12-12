import { useContext } from "react";
import { NavSideContext } from "./nav-side";

export function useNavSide() {
  const ctx = useContext(NavSideContext);

  if (!ctx) {
    throw new Error("useNavSide must be used within a NavSideProvider");
  }

  return ctx;
}
