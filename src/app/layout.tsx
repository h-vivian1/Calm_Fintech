import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LedgerProvider } from "@/context/LedgerContext";
import { Navigation } from "@/components/ui/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Calm Fintech",
  description: "Dashboard de Gestão de Patrimônio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pt-16 md:pt-20">
        <LedgerProvider>
          <Navigation />
          {children}
        </LedgerProvider>
      </body>
    </html>
  );
}
