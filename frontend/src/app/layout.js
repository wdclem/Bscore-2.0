import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@theme/contexts/ThemeContext";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "BetterScore",
  description: "Sports scores and league information",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}