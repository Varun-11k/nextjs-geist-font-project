import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Remote Classroom - Rural Education Platform",
  description: "Low-bandwidth optimized remote learning platform for rural students and diploma colleges",
  manifest: "/manifest.json",
  themeColor: "#1976d2",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1976d2" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Remote Classroom" />
        <link rel="apple-touch-icon" href="/next.svg" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
