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
    const isWebsiteBusiness = pathname.startsWith('/WebsiteBusiness');

    return (
        <html lang="en">
            <body>
                {!isWebsiteBusiness && (
                    pathname.startsWith('/BadmintonShop') ? <HeaderShop /> 
                    : pathname !== '/BadmintonCourt/login' && pathname !== '/BadmintonCourt/register' && <Header />
                )}
                <main>{children}</main>
            </body>
        </html>
    );
}