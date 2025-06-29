import type {Metadata} from 'next';
import '../globals.css';
import { SettingsProvider } from '@/hooks/use-settings';
import { ThemeProvider } from '@/components/theme-provider';


export const metadata: Metadata = {
  title: 'Customer Display - Crimson POS',
  description: 'Customer facing display screen.',
};

export default function CustomerDisplayLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
        <body className="font-body antialiased">
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem={false}
              disableTransitionOnChange
            >
              <SettingsProvider>
                  {children}
              </SettingsProvider>
            </ThemeProvider>
        </body>
    </html>
  );
}
