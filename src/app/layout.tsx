import type { Metadata } from "next";
import "./globals.css";

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
        <h1>Map Veto Tool</h1>
        {children}
      </body>
    </html>
  );
}
