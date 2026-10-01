import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AppLayout } from "@/components/layout/AppLayout";

export const metadata: Metadata = {
  title: "Couturier - Gestion d'Atelier",
  description:
    "Application mobile-first de gestion d'atelier de couture (clients, mensurations, commandes, rendez-vous, paiements en FCFA)",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Couturier",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#c85a32",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <body className="min-h-full antialiased font-sans bg-background text-foreground">
        <Providers>
          <AppLayout>{children}</AppLayout>
        </Providers>
      </body>
    </html>
  );
}
