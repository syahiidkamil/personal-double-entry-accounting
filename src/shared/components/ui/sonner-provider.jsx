import { Toaster } from "sonner";

export function SonnerProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className: "border-0",
        style: {
          // These are already handled by Sonner's built-in styling
        },
      }}
      richColors // Enable rich colors
      closeButton // Add a close button to each toast
    />
  );
}
