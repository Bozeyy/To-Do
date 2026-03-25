import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import AuthContext from "@/components/AuthContext";
import SWRegistration from "@/components/SWRegistration";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "To-Doux List PWA",
  description: "Une application To-Doux simple, claire et premium.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "To-Doux PWA",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans selection:bg-brand/10 selection:text-brand">
        <AuthContext>
          <SWRegistration />
          {children}
        </AuthContext>
      </body>
    </html>
  );
}
