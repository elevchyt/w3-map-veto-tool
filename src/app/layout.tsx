import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Footer from "@/components/Footer/Footer";
import NavLinks from "@/components/NavLinks";
import Image from "next/image";
import logo from "../app/logo.webp";
import "./page.scss";

const frizQuadrata = localFont({
  src: "../../public/fonts/Friz Quadrata TT Regular.ttf",
  variable: "--font-friz-quadrata",
  display: "swap",
});

export const metadata: Metadata = {
  title: "W3 Map Veto Tool",
  description:
    "Streamlined ban/pick map process for Warcraft 3 leagues and tournaments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={frizQuadrata.variable}>
        <Toaster />
        <div className="app-header">
          <div className="title-container">
            <Image
              src={logo}
              alt="logo"
              priority
              width={60}
              draggable={false}
            />
            <h1>Warcraft 3 Map Veto Tool</h1>
          </div>
          <NavLinks />
        </div>
        {children}
        <Footer />
      </body>
    </html>
  );
}
