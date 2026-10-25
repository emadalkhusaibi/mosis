import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { persistentStorage } from "@/server/db";
export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";
export default function Page() { return <AuthForm mode="sign-in" temporary={!persistentStorage} />; }
