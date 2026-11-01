import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CoverTopBar, PageCoverHeader } from "@/components/layout/CoverBanner";
import { getUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DialogProvider } from "@/components/ui/DialogProvider";
import PwaInstallPrompt from "@/components/common/PwaInstallPrompt";

const solaimanLipi = localFont({
  src: "../../SolaimanLipi-Normal.ttf",
  variable: "--font-solaiman-lipi",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#095738",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://nooraniprokation.com"),
  title: {
    default: "নূরানী প্রকাশন | নূরানী বোর্ড খুলনা",
    template: "%s | নূরানী বোর্ড খুলনা",
  },
  description: "নূরানী প্রকাশন ও নূরানী বোর্ড খুলনা এর অফিসিয়াল ওয়েবসাইট। নূরানী প্রকাশনীর যাবতীয় বই, শিক্ষা উপকরণ ও নূরানী শিক্ষা বোর্ডের সেবা।",
  keywords: [
    "নূরানী প্রকাশন",
    "নূরানী বোর্ড খুলনা",
    "নূরানী প্রকাশনী",
    "noorani prokation",
    "noorani prokashon",
    "nooraniprokation.com",
    "noorani board khulna"
  ],
  openGraph: {
    title: "নূরানী প্রকাশন | নূরানী বোর্ড খুলনা",
    description: "নূরানী প্রকাশন ও নূরানী বোর্ড খুলনার অফিসিয়াল ওয়েবসাইট।",
    url: "https://nooraniprokation.com",
    siteName: "নূরানী প্রকাশন | নূরানী বোর্ড খুলনা",
    locale: "bn_BD",
    type: "website",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    statusBarStyle: "default",
    title: "নূরানী প্রকাশন",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUserSession();
  
  let initialSettings = null;
  try {
    const dbSettings = await prisma.boardSettings.findFirst();
    if (dbSettings) {
      initialSettings = {
        name: dbSettings.name || undefined,
        address: dbSettings.address || undefined,
        logoUrl: dbSettings.logoUrl || undefined,
      };
    }
  } catch (e) {
    console.error("Error fetching initial settings:", e);
  }

  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${solaimanLipi.variable} font-sans`}>
        <DialogProvider>
          <div className="min-h-screen flex flex-col bg-slate-50">
            {/* Navbar (sticky) */}
            <div className="sticky top-0 z-50">
              <Navbar user={user} initialSettings={initialSettings} />
            </div>

            {/* Main Content */}
            <main className="flex-grow flex flex-col min-h-0">
              {/* Sliding page header cover (conditionally shown from settings) */}
              <PageCoverHeader />
              {children}
            </main>

            <Footer />

            {/* PWA Install Modal Prompt (Auto detects Mobile vs Desktop) */}
            <PwaInstallPrompt />
          </div>
        </DialogProvider>
      </body>
    </html>
  );
}
