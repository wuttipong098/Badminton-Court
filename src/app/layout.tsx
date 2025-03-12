"use client";
import '../styles/globals.css';
import Header from './BadmintonCourt/components/Header';
import { usePathname } from 'next/navigation';
export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <html lang="en">
            <body>
                {pathname !== '/BadmintonCourt/login' && <Header />}
                <main>{children}</main>
            </body>
        </html>
    );
}