import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Poker Night",
  description:
    "Track buy-ins and cash-outs for your home poker game and settle up in the fewest payments.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Poker Night",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <StoreProvider>
            <div className="shell">
              <div className="app">{children}</div>
            </div>
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
