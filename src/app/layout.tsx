"use client";
import '../styles/globals.css';
import Header from './BadmintonCourt/components/Header';
import { usePathname } from 'next/navigation';

import HeaderShop from './BadmintonShop/components/Header';
export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <html lang="en">
            <body>
                {pathname !== '/BadmintonCourt/login' && pathname !== '/BadmintonCourt/register' && <Header />}
            {pathname.includes("/BadmintonShop") ? <HeaderShop /> : <Header />}
                <main>{children}</main>
            </body>
        </html>
    );
}
