import { Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";

import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ActiveThemeProvider } from "@/components/active-theme";
import { fontVariables } from "@/lib/fonts";

const META_THEME_COLORS = {
  light: "#ffffff",
  dark: "#09090b",
} as const;

export const viewport: Viewport = {
  themeColor: META_THEME_COLORS.light,
};

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SIKAB - PT. Pradha Karya Perkasa",
  description: "Sistem Informasi Kedatangan Bahan Baku - PT. Pradha Karya Perkasa",
  keywords: "SIKAB, bahan baku, inventory, management system",
  authors: [{ name: "PT. Pradha Karya Perkasa" }],
  creator: "PT. Pradha Karya Perkasa",
  publisher: "PT. Pradha Karya Perkasa",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "SIKAB - PT. Pradha Karya Perkasa",
    description: "Sistem Informasi Kedatangan Bahan Baku",
    type: "website",
    locale: "id_ID",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const activeThemeValue = cookieStore.get("active_theme")?.value;
  const isScaled = activeThemeValue?.endsWith("-scaled");

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.querySelector('meta[name="theme-color"]').setAttribute('content', '${META_THEME_COLORS.dark}')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>

      <body 
        className={cn(
          // Base styles
          "bg-background overscroll-none font-sans antialiased",
          // Inter font fallback jika fontVariables tidak ada
          inter.className,
          // Theme classes
          activeThemeValue ? `theme-${activeThemeValue}` : "",
          isScaled ? "theme-scaled" : "",
          // Font variables jika tersedia
          fontVariables
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          enableColorScheme
        >
          <ActiveThemeProvider initialTheme={activeThemeValue}>
              {children}
              <ToastContainer 
                position="bottom-right" 
                theme="colored"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                className="z-50"
                toastClassName="text-sm"
              />
          </ActiveThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}