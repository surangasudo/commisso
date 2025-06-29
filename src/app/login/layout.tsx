import type {Metadata} from 'next';

export const metadata: Metadata = {
  title: 'Login - Crimson ERP',
  description: 'Login to access your dashboard.',
};

export default function LoginLayout({
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
