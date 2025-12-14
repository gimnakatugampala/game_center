import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Game Center",
  description: "Algorithm Learning Games",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-gradient-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#16213e] text-white min-h-screen flex flex-col`}
      >
        <Header />
        <main className="container mx-auto flex-1 p-4 md:p-6">{children}</main>
        <footer className="bg-gradient-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#16213e] backdrop-blur-md shadow-inner mt-auto text-center p-4 text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
          <p>BSc (Hons) Computing - PDSA Coursework | Batch 25.1</p>
          <p>National Institute of Business Management Center. </p>
        </footer>
      </body>
    </html>
  );
}
