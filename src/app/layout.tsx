import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PSU OJT Monitoring System",
  description: "Pangasinan State University OJT time monitoring for interns and supervisors.",
  icons: {
    icon: "/images/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body
        className="min-h-full flex flex-col"
        style={{
          fontFamily:
            '"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  );
}
