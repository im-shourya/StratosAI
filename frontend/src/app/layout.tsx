import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
});

const interBody = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-code",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StratosAI - AI Strategy & Assessment Engine",
  description:
    "Automated AI strategy consulting for enterprises. Evaluate AI readiness, forecast ROI, assess risk, and build board-ready roadmaps.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "StratosAI - AI Strategy & Assessment Engine",
    description: "Automated AI strategy consulting for enterprises. Evaluate AI readiness, forecast ROI, assess risk, and build board-ready roadmaps.",
    url: "https://stratosai.com",
    siteName: "StratosAI",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "StratosAI Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StratosAI - AI Strategy & Assessment Engine",
    description: "Automated AI strategy consulting for enterprises.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${interBody.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
