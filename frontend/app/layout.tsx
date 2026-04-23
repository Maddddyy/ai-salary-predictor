import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Salary Predictor - Get Your Worth",
  description: "AI-powered salary prediction with 96.56% accuracy using machine learning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
