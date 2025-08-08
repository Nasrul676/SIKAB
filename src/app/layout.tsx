import { Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import type { Metadata, Viewport } from "next"
import { cookies } from "next/headers"

import { ThemeProvider } from "@/components/theme-provider"

import "./globals.css"
import { cn } from "@/lib/utils"
import { ActiveThemeProvider } from "@/components/active-theme"
import { fontVariables } from "@/lib/fonts"

const META_THEME_COLORS = {
  light: "#ffffff",
  dark: "#09090b",
}

export const viewport: Viewport = {
  themeColor: META_THEME_COLORS.light,
}

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PKP",
  description: "PT. Pradha Karya Perkasa",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies()
    const activeThemeValue = cookieStore.get("active_theme")?.value
    const isScaled = activeThemeValue?.endsWith("-scaled")
  return (
    <html lang="en" suppressHydrationWarning>
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

        <body className={cn(
                  "bg-background overscroll-none font-sans antialiased",
                  activeThemeValue ? `theme-${activeThemeValue}` : "",
                  isScaled ? "theme-scaled" : "",
                  fontVariables
                )}>
                  <ThemeProvider
                            attribute="class"
                            defaultTheme="system"
                            enableSystem
                            disableTransitionOnChange
                            enableColorScheme
                          >
                            <ActiveThemeProvider initialTheme={activeThemeValue}>

          {children} <ToastContainer position="bottom-right" theme="dark" />
          </ActiveThemeProvider>
                  </ThemeProvider>
        </body>

      </html>
  );
}
