import type { Metadata } from "next";
import { headers } from "next/headers";
import { Manrope, Newsreader } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ variable: "--font-sans", subsets: ["latin"] });
const newsreader = Newsreader({ variable: "--font-display", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "namo-jan-connect.sites.openai.com";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const title = "NAMO Jan Connect — Every concern, clearly tracked";
  const description = "File a civic complaint, follow every update, and see how departments are delivering for citizens.";
  return {
    metadataBase: new URL(origin), title, description,
    openGraph: { title, description, type: "website", url: origin, images: [{ url: `${origin}/og.png`, width: 1200, height: 630, alt: "NAMO Jan Connect — Every concern. Clearly tracked." }] },
    twitter: { card: "summary_large_image", title, description, images: [`${origin}/og.png`] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${manrope.variable} ${newsreader.variable}`}>{children}</body></html>;
}
