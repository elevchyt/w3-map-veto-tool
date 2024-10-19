import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import "react-tippy/dist/tippy.css";
import Footer from "@/components/Footer/Footer";
import NavLinks from "@/components/NavLinks";

export const metadata: Metadata = {
  title: "W3 Map Veto Tool",
  description: "Created by biskuit",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Toaster />
        <div className="app-header">
          <h1>Map Veto Tool</h1>
          <NavLinks />
        </div>
        {children}
        <Footer />
      </body>
    </html>
  );
}
