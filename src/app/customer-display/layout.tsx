import type {Metadata} from 'next';

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
        <body className="font-body antialiased">{children}</body>
    </html>
  );
}
