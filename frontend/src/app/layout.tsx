import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'FormCraft',
    template: '%s | FormCraft',
  },
  description: 'Build beautiful forms, collect responses, and analyze results.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster
            richColors
            position="top-right"
            toastOptions={{
              classNames: {
                toast: 'rounded-xl shadow-lg',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
