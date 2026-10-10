"use client";
import { useWorkspace } from "./workspace";
import { tailored } from "@/content/tailor";

/** Plan, practice and lesson content in the words of the founder's own business. */
export function useContent() {
  const { state } = useWorkspace();
  return tailored(state.venture.sector);
}
