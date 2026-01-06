import type { Metadata } from "next";
import "./globals.css";
import AppToaster from "@/components/toaster";
import PwaRegister from "@/components/pwa-register";

export const metadata: Metadata = {
  title: "Chef Alex",
  description: "Chef Alex — My world, My style",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PwaRegister />
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
