import { Geist, Geist_Mono, Syne, DM_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const syne = Syne({ subsets: ["latin"], weight: ["600", "700", "800"], display: "swap", variable: "--font-syne" });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "700"], display: "swap", variable: "--font-dm" });

export const metadata = {
  title: "ForgeByte Intelli",
  description: "Advanced Retrieval-Augmented Generation (RAG) and AI Document Analysis Platform.",
  icons: {
    icon: "/Icon_White (1).png",
  },
};

import WakeupSpinner from "@/components/WakeupSpinner";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} ${dmSans.variable} antialiased`}
      >
        <WakeupSpinner />
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
