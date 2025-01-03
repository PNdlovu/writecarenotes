import { Metadata } from 'next';
import { MarketingNavbar } from '@/components/marketing/Navbar';

// Generate metadata for SEO
export const metadata: Metadata = {
  title: 'Blog - Write Care Notes',
  description: 'Latest updates on care home regulations, best practices, and industry news',
  openGraph: {
    title: 'Blog - Write Care Notes',
    description: 'Latest updates on care home regulations, best practices, and industry news',
    type: 'website',
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MarketingNavbar />
      {children}
    </>
  );
} 
