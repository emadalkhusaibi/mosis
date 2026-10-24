import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/recovery-form";
import { mailConfigured } from "@/server/mail";
export const metadata: Metadata = { title: "Reset password" };
export const dynamic = "force-dynamic";
export default function Page() { return <ForgotPasswordForm mailReady={mailConfigured} />; }
