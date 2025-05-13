"use client";
import '../styles/globals.css';
import Header from './components/Header';
import HeaderShop from './BadmintonShop/components/Header';
import { usePathname } from 'next/navigation';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // จะไม่แสดง Header ใน 3 path นี้
  const noHeaderPaths = [
    '/BadmintonCourt/login',
    '/BadmintonCourt/register',
    '/BadmintonShop/register',
  ];
  const shouldShowHeader = !pathname.startsWith('/WebsiteBusiness') 
    && !noHeaderPaths.includes(pathname);

  return (
    <html lang="en">
      <body>
        {shouldShowHeader && (
          pathname.startsWith('/BadmintonShop')
            ? <HeaderShop />
            : <Header />
        )}
        <main>{children}</main>
      </body>
    </html>
  );
}