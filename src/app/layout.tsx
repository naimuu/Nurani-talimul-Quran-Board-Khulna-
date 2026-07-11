import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getUserSession } from "@/lib/auth";
import { DialogProvider } from "@/components/ui/DialogProvider";

const solaimanLipi = localFont({
  src: "../../SolaimanLipi-Normal.ttf",
  variable: "--font-solaiman-lipi",
  display: "swap",
});

export const metadata: Metadata = {
  title: "খুলনা নূরানী বোর্ড | পেশাদার ইসলামি শিক্ষা",
  description: "খুলনা নূরানী বোর্ডের অফিসিয়াল ওয়েবসাইট। বিশুদ্ধ ইসলামি শিক্ষা এবং প্রশাসন প্রদান।",
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
            <Navbar user={user} />

            {/* Main Content */}
            <main className="flex-grow">
              {children}
            </main>

            <Footer />
          </div>
        </DialogProvider>
      </body>
    </html>
  );
}
