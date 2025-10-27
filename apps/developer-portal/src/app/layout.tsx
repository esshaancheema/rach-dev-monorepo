import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });
const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Zoptal Developer Portal - API Documentation & Tools',
  description: 'Comprehensive API documentation, developer tools, and resources for building with the Zoptal platform.',
  keywords: ['API documentation', 'developer tools', 'REST API', 'SDK', 'integration'],
  authors: [{ name: 'Zoptal Developer Team' }],
  openGraph: {
    title: 'Zoptal Developer Portal',
    description: 'API documentation and developer tools for the Zoptal platform.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${jetbrainsMono.variable}`}>
        {children}
      </body>
    </html>
  );
}