import type { Metadata } from "next";
import { Source_Serif_4, Source_Sans_3, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sourceSerif4 = Source_Serif_4({
  variable: "--font-serif-4",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const sourceSans3 = Source_Sans_3({
  variable: "--font-sans-3",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono-jb",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Security Cost Optimizer — SME Edition",
  description: "AI-powered security stack rationalization for SMEs",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${sourceSerif4.variable} ${sourceSans3.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
