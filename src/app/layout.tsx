"use client";

import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <title>AVIS - Work Together. Deliver Faster.</title>
                <meta name="description" content="AVIS is an internal employee collaboration and task management system built for seamless workflow." />
            </head>
            <body className="min-h-screen bg-white antialiased">
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
