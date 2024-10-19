import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import "react-tippy/dist/tippy.css";
import Footer from "@/components/Footer/Footer";

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
        <h1>Map Veto Tool</h1>
        {children}
        <Footer />
      </body>
    </html>
  );
}
