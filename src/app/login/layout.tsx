import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Crimson POS',
  description: 'Login to access your dashboard.',
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
    </>
  );
}
