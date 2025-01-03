import { MarketingFooter } from '@/components/marketing/Footer';
import { BlogSearch } from '@/features/blog/components/BlogSearch';

const categories = [
  'Care Standards',
  'Best Practices',
  'Compliance',
  'Staff Training',
  'Care Planning',
  'Medication Management'
];

const regions = [
  'England',
  'Wales',
  'Scotland',
  'Northern Ireland',
  'Republic of Ireland'
];

const regulatoryBodies = [
  'CQC',
  'CIW',
  'Care Inspectorate',
  'RQIA',
  'HIQA'
];

export default function BlogPage() {
  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-white to-blue-50/20 pb-16">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Care Home Blog</h1>
          <p className="text-xl text-gray-600 mb-12">
            Stay updated with the latest care home regulations, best practices, and industry insights.
          </p>
          
          <BlogSearch 
            categories={categories}
            regions={regions}
            regulatoryBodies={regulatoryBodies}
          />
        </div>
      </main>
      <MarketingFooter />
    </>
  );
} 
