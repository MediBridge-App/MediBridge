import { useContext } from "react";
import { InboxContext } from "../context/InboxContext";

export function useInbox() {
  const ctx = useContext(InboxContext);
  if (!ctx) throw new Error("useInbox must be used inside InboxProvider");
  return ctx;
}
