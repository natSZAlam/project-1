import type { Metadata, Viewport } from "next";
import { Playfair_Display_SC, Karla, Caveat } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const playfair = Playfair_Display_SC({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Tonight's Menu",
  description: "A shared decision-making tool for what to eat tonight.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#9a3412",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${karla.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <main className="flex-1 pb-24">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
