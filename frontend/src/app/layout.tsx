import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mini Design Canvas',
  description: 'Production-ready vector design canvas built with Next.js, React Konva, Express, and MongoDB.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#f6f8fa] text-[#1f2328] antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
