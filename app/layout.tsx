import type { Metadata } from "next";
import { Manrope, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "@/app/globals.css";
import { cn } from "@/lib/utils";

const fontSans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans"
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  title: "SpecPilot",
  description: "AI-powered planning assistant for technical implementation specs."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(fontSans.variable, fontMono.variable, "min-h-screen font-sans antialiased")}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
