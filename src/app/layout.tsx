import type { Metadata } from "next";
import Header from '@/components/header'
import "./globals.css";


export const metadata: Metadata = {
  title: "Lynk",
  description: "Task Manager App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) 
{
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
