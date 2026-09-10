import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CoverTopBar, PageCoverHeader } from "@/components/layout/CoverBanner";
import { getUserSession } from "@/lib/auth";
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
  title: "খুলনা নূরানী বোর্ড | পেশাদার ইসলামি শিক্ষা",
  description: "খুলনা নূরানী বোর্ডের অফিসিয়াল ওয়েবসাইট। বিশুদ্ধ ইসলামি শিক্ষা এবং প্রশাসন প্রদান।",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "নূরানী বোর্ড",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUserSession();

  return (
    <html lang="en">
      <body className={`${solaimanLipi.variable} font-sans`}>
        <DialogProvider>
          <div className="min-h-screen flex flex-col bg-slate-50">
            {/* Cover Banner (normal flow) */}
            <CoverTopBar />

            {/* Navbar (sticky) */}
            <div className="sticky top-0 z-50">
              <Navbar user={user} />
            </div>

            {/* Main Content */}
            <main className="flex-grow">
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
