import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProviderWrapper } from "@/components/ui/use-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SITE } from "@/lib/constants";
import { Providers } from "@/components/providers";
import { auth } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Premium Shopping, Elegantly Delivered`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: ["ecommerce", "shopping", "premium", "SOHA", "online store"],
  authors: [{ name: SITE.name }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE.url,
    siteName: SITE.name,
    title: SITE.name,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export function headers(): Record<string, string> {
  return {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Content-Security-Policy":
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const initialCurrency = session?.user?.currency ?? undefined;
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Providers initialCurrency={initialCurrency}>
          <TooltipProvider delayDuration={200}>
            <ToastProviderWrapper>{children}</ToastProviderWrapper>
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
