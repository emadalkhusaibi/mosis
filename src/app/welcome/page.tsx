import type { Metadata } from "next";
import { Welcome } from "@/components/welcome/welcome";

export const metadata: Metadata = {
  title: { absolute: "Moasis · Practise the business before you risk the money" },
  description: "A bilingual founder practice studio for Oman. Write a plan, spend practice money, forecast twelve months and rehearse decisions before committing real savings. An educational simulation.",
  alternates: { canonical: "/welcome" },
  openGraph: {
    title: "Moasis · مؤسس",
    description: "Practise the business before you risk the money. A bilingual founder practice studio for Oman.",
    type: "website",
  },
};

export default function Page() {
  return <Welcome />;
}
