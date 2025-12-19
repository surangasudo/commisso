import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/theme-provider';
import { SettingsProvider } from '@/hooks/use-settings';
import { AuthProvider } from '@/hooks/use-auth';

export const metadata: Metadata = {
  title: 'Crimson POS - Advanced POS Solution',
  description: 'An advanced Point of Sale and ERP system for modern businesses.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SettingsProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </SettingsProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
