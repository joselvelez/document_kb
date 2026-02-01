import type { Metadata } from "next";
import { Inter } from "next/font/google";
import {
  ClerkProvider,
  SignedIn,
  UserButton,
} from "@clerk/nextjs";
import "./globals.css";
import { appName } from "@/lib/constants";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: appName,
  description: "AI-powered document knowledge base",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <SignedIn>
            <header className="border-b bg-background px-4 py-3">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="">
                  <h1 className="text-lg font-semibold">{appName}</h1>
                  <p className="text-muted-foreground">
                    Powered by AI - Upload documents and get AI answers with citations
                  </p>
                </div>
                <UserButton />
              </div>
            </header>
          </SignedIn>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
