import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-gray-900 text-white min-h-screen flex flex-col`}
      >
        <Header />
        <main className="container mx-auto flex-1 p-4 md:p-6">{children}</main>
        <footer className="bg-gray-800/90 backdrop-blur-md shadow-inner mt-auto text-center p-4 text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Game Center. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
