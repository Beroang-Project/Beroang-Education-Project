import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';

import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

export const metadata: Metadata = {
  title: {
    default: 'GreenPath — AI Teaching & P5 OS',
    template: '%s | GreenPath',
  },
  description:
    'Platform AI Teaching & P5 Operating System untuk guru Kurikulum Merdeka. Rencanakan, ajarkan, nilai, dan kelola proyek P5 dalam satu alur kerja terintegrasi.',
  keywords: ['AI Teaching', 'P5', 'Kurikulum Merdeka', 'GreenPath', 'Platform Guru'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning className={`${GeistSans.variable}`}>
      <body suppressHydrationWarning className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider delayDuration={300}>
            {children}
            <Toaster richColors position="bottom-right" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
