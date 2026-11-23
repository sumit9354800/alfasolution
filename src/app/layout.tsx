
import type { Metadata, Viewport } from "next";
import { DM_Sans, Manrope } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingContact from "@/components/layout/FloatingContact";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const siteUrl = "https://www.alfasolution.net";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "Alfa Solution | Website & App Development Company",
    template: "%s | Alfa Solution",
  },

  description:
    "Alfa Solution provides professional website development, web application development, SEO services, B2B portal development and mobile app development services to help businesses grow digitally.",

  keywords: [
    "Alfa Solution",
    "website development company",
    "website development services",
    "web development company",
    "custom website development",
    "business website development",
    "web application development",
    "mobile app development",
    "Android app development",
    "iOS app development",
    "ecommerce website development",
    "responsive website development",
    "custom web applications",

    // Website Design Keywords
    "Best Website Design Company in India",
    "Best Website Design Company in Mumbai",

    // SEO Service Keywords
    "Best SEO Service in New Delhi",
    "Best SEO Service in Jaipur",
    "Best SEO Service in Tamil Nadu",

    // B2B Portal Keywords
    "Best B2B Portal in India",
    "Best B2B Portal in Maharashtra",
    "Best B2B Service in Rajkot",

    // App Development Keywords
    "Best Android App Development in Gurugram",
  ],

  applicationName: "Alfa Solution",

  authors: [{ name: "Alfa Solution" }],
  creator: "Alfa Solution",
  publisher: "Alfa Solution",

  alternates: {
    canonical: "/",
    languages: {
      "en-IN": "/",
    },
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Alfa Solution",
    title: "Alfa Solution | Website & App Development Company",
    description:
      "We build modern websites, web applications, SEO solutions, B2B portals and mobile apps for businesses looking to grow their digital presence.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Alfa Solution - Website and App Development",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Alfa Solution | Website & App Development",
    description:
      "Professional website development, SEO services, B2B portal development and mobile application development solutions.",
    images: ["/images/og-image.jpg"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F4F1EA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN">
      <body
        className={`${dmSans.variable} ${manrope.variable} antialiased`}
      >
        <Navbar />
        <main>{children}</main>
        <Footer />
        <FloatingContact />
      </body>
    </html>
  );
}
