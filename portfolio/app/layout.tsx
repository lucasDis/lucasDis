import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Lucas Ruiz Díaz — Portfolio",
    template: "%s · Lucas Ruiz Díaz",
  },
  description:
    "Diseñador UX/UI tucumano con experiencia en 3D, branding y producto. Conocé mis proyectos y cómo trabajar conmigo.",
  metadataBase: new URL("http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-canvas text-ink font-body">
        {children}
      </body>
    </html>
  );
}
