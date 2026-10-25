import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { accountsEnabled } from "@/lib/features";

/** Account pages exist only while accounts are switched on. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  if (!accountsEnabled) redirect("/");
  return children;
}
