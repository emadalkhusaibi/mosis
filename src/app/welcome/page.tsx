import type { Metadata } from "next";
import { Welcome } from "@/components/welcome/welcome";

export const metadata: Metadata = {
  title: "Moasis · Practise the business before you risk the money",
  description: "A bilingual founder practice studio for Oman: plan, practice wallet, forecast and CEO scenarios.",
};

export default function Page() {
  return <Welcome />;
}
