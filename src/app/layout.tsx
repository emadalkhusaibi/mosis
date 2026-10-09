import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "@fontsource-variable/geist/wght.css";
import "@fontsource-variable/noto-sans-arabic/wght.css";
import "./globals.css";
import { Providers } from "./providers";
import { LANG_COOKIE } from "@/lib/lang-cookie";

export const metadata: Metadata = {
  title: { default: "moasis · مؤسس", template: "%s · moasis" },
  description: "Practise your business before you commit your money. A bilingual founder workspace, made in Oman.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eceff2" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1114" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = (await cookies()).get(LANG_COOKIE)?.value === "ar" ? "ar" : "en";
  return (
    <html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"} suppressHydrationWarning>
      <body>
        <div className="environment" aria-hidden="true" />
        <Providers lang={lang}>{children}</Providers>
      </body>
    </html>
  );
}
