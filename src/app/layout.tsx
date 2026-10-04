import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";
import { WishlistProvider } from "@/context/WishlistContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { LocationProvider } from "@/context/LocationContext";
import { AuthProvider } from "@/context/AuthContext";
import { TripProvider } from "@/context/TripContext";
import WishlistDrawer from "@/components/WishlistDrawer";
import BottomTabBar from "@/components/BottomTabBar";
import GoogleTranslator from "@/components/GoogleTranslator";
import PWARegister from "@/components/PWARegister";
import CustomerChatWidget from "@/components/CustomerChatWidget";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import AdSenseScript from "@/components/AdSenseScript";
import FloatingAIButton from "@/components/FloatingAIButton";

export const viewport: Viewport = {
  themeColor: "#F5FAFF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "UncoverCeylon — Discover the Hidden Beauty of Sri Lanka",
  description:
    "Explore breathtaking places, hidden gems, ancient wonders, and untouched shores across all 9 provinces of Sri Lanka. Curated guides, live distance calculations, multi-currency fees, and 100% offline PWA support by Serandib Co.",
  keywords: [
    "Sri Lanka",
    "Ceylon",
    "Sri Lanka travel guide",
    "hidden gems Sri Lanka",
    "Sigiriya",
    "Ella",
    "Sri Lanka beaches",
    "Sri Lanka waterfalls",
    "Ceylon travel",
  ],
  authors: [{ name: "UncoverCeylon" }],
  creator: "UncoverCeylon",
  publisher: "UncoverCeylon",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://uncoverceylon.com"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "UncoverCeylon — Discover the Hidden Beauty of Sri Lanka",
    description:
      "Explore breathtaking places, hidden gems, ancient wonders, and untouched shores across Sri Lanka. Your premier island travel guide by Serandib Co.",
    url: "/",
    siteName: "UncoverCeylon",
    images: [
      {
        url: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=1200&h=630&fit=crop&q=85",
        width: 1200,
        height: 630,
        alt: "UncoverCeylon - Discover Sri Lanka",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UncoverCeylon — Discover the Hidden Beauty of Sri Lanka",
    description:
      "Explore breathtaking places, hidden gems, ancient wonders, and untouched shores across Sri Lanka.",
    images: [
      "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=1200&h=630&fit=crop&q=85",
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="min-h-screen bg-[#F5FAFF] text-[#0F2A3D] antialiased selection:bg-[#38A9F0]/20 selection:text-[#0F2A3D]">
        <AuthProvider>
          <LanguageProvider>
            <CurrencyProvider>
              <LocationProvider>
                <WishlistProvider>
                  <TripProvider>
                    <Navbar />
                    <main className="pb-16 md:pb-0">{children}</main>
                    <WishlistDrawer />
                    <FloatingAIButton />
                    <CustomerChatWidget />
                    <CookieConsentBanner />
                    <AdSenseScript />
                    <GoogleTranslator />
                    <PWARegister />
                    <Footer />
                    <BottomTabBar />
                    <Toaster
                      position="bottom-right"
                      toastOptions={{
                        style: {
                          background: "#FFFFFF",
                          color: "#0F2A3D",
                          border: "1px solid #DCE8F2",
                          boxShadow: "0 12px 28px -6px rgba(15, 42, 61, 0.09)",
                          borderRadius: "14px",
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 600,
                          fontSize: "13.5px",
                          padding: "12px 18px",
                        },
                      }}
                    />
                  </TripProvider>
                </WishlistProvider>
              </LocationProvider>
            </CurrencyProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
