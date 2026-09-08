import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "دليل وتوصيات مطاعم السعودية 🇸🇦",
  description:
    "استبيان ذكي يسألك عن المأكولات، الحساسية، الميزانية والمكان ليرشح لك أفضل المطاعم في السعودية بالأطباق الأكثر طلباً.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}

