import type { Metadata, Viewport } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import "./globals.css";

const display = localFont({
  src: "./fonts/BricolageGrotesque.woff2",
  variable: "--font-bricolage",
  weight: "200 800",
  display: "swap",
});

const sans = localFont({
  src: "./fonts/InstrumentSans.woff2",
  variable: "--font-instrument",
  weight: "400 700",
  display: "swap",
});

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.alfasolution.net").replace(/\/+$/, "");
const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
// Google Search Console → Settings → Ownership verification → "HTML tag" content code
const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

const defaultTitle = "Website & App Development Company in India | Alfa Solution";
const defaultDescription =
  "Alfa Solution builds fast, SEO-ready websites, ecommerce stores, web applications and mobile apps for businesses across India. Fixed pricing, GST invoices and ongoing support.";

// Fallback metadata. Every public page sets its own title, description and
// canonical URL from Admin → SEO, which takes priority over these values.
// No title template: pages already add "| Alfa Solution" themselves.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: defaultTitle },
  description: defaultDescription,
  applicationName: "Alfa Solution",
  authors: [{ name: "Alfa Solution", url: siteUrl }],
  creator: "Alfa Solution",
  publisher: "Alfa Solution",
  category: "technology",
  keywords: [
    "website development company in India",
    "web design company in India",
    "ecommerce website development India",
    "web application development company India",
    "mobile app development company India",
    "custom software development India",
    "UI UX design agency India",
    "SEO services India",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Alfa Solution",
    url: siteUrl,
    title: defaultTitle,
    description: defaultDescription,
    images: [{ url: "/images/og-image.jpg", width: 1200, height: 630, alt: "Alfa Solution" }],
  },
  twitter: { card: "summary_large_image", title: defaultTitle, description: defaultDescription, images: ["/images/og-image.jpg"] },
  ...(googleVerification ? { verification: { google: googleVerification } } : {}),
  icons: { icon: "/icon.png", shortcut: "/icon.png", apple: "/icon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#191D27",
};

// Tells Google the site's name and that it serves all of India.
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Alfa Solution",
  url: siteUrl,
  inLanguage: "en-IN",
  publisher: {
    "@type": "Organization",
    name: "Alfa Solution",
    url: siteUrl,
    logo: `${siteUrl}/images/logo-black.png`,
    areaServed: { "@type": "Country", name: "India" },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={`${display.variable} ${sans.variable}`}>
      <body className="antialiased">
        {gtmId && /^GTM-[A-Z0-9]+$/.test(gtmId) ? (
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
        ) : null}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema).replace(/</g, "\\u003c") }}
        />
        {children}
      </body>
    </html>
  );
}
