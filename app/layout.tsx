import "./globals.css";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "@/components/ui/sonner"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Yeko",
  description: "Yeko est une plateforme éducative le suivie de la vie scolaire des élèves par leur parent",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={poppins.className}>
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
