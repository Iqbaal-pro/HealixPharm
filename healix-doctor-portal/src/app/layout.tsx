import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

export const metadata: Metadata = {
  title: "Healix — eChannelling",
  description: "Book doctor appointments through Healix Smart Pharmacy",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: "#060d1a" }}>
        {/* Aurora — sits behind everything */}
        <div className="aurora-bg">
          <div className="aurora-mid" />
          <div className="aurora-extra" />
        </div>

        {/* All content sits above aurora */}
        <div style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          background: "transparent",
        }}>
          <Navbar />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}