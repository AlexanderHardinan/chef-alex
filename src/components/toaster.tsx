"use client";

import { Toaster } from "sonner";

export default function AppToaster() {
  return (
    <Toaster
      richColors
      position="top-right"
      toastOptions={{
        style: {
          borderRadius: "16px",
        },
      }}
    />
  );
}
