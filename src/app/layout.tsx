import type { Metadata } from "next";
import "./globals.css";
import AppToaster from "@/components/toaster";
import PwaRegister from "@/components/pwa-register";

export const metadata: Metadata = {
  title: "Chef Alex",
  applicationName: "Chef Alex",
  description: "My world, My style",
  manifest: "/manifest.webmanifest",
  themeColor: "#ffffff",
  icons: {
    icon: [
      { url: "/pwa/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/pwa/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/pwa/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Chef Alex",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <RegisterSW />
        {children}
      </body>
    </html>
  );
}