import type { Metadata } from "next";
import { Partners } from "@/components/partners/partners";

export const metadata: Metadata = {
  title: { absolute: "Partner with Moasis · Meet Oman's next founders" },
  description: "Offer internships, jobs or a one-to-one hour to founders in Oman who arrive with a record of what they've proven.",
  alternates: { canonical: "/partners" },
};

export default function Page() {
  return <Partners />;
}
