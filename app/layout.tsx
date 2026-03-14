import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/context";

const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "March Madness 2026 — Command Center",
  description: "Monte Carlo bracket optimizer with Champion Profile model",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${mono.variable} font-mono bg-gray-950 text-gray-100 min-h-screen`}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
