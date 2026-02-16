import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { ThemeProvider } from "@/lib/ThemeContext";

export const metadata: Metadata = {
  title: "Anime Story Writer",
  description: "Write your anime story with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-gray-900 transition-colors">
        <ThemeProvider>
          <Navigation />
          <main className="max-w-7xl mx-auto px-4 py-8">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
