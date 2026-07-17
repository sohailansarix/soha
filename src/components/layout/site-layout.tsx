import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
