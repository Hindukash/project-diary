import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { AppLayout } from '@/components/layout/app-layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Project Diary',
  description: 'A web-based diary for your projects and studies.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppLayout>{children}</AppLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}

