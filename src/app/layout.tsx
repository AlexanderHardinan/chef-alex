import type { Metadata } from "next";
import "./globals.css";
import AppToaster from "@/components/toaster";

export const metadata: Metadata = {
  title: "Chef Alex",
  description: "Chef Alex — My world, My style",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
