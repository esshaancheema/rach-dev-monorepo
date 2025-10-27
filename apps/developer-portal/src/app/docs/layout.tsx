import DocsNavigation from '@/components/DocsNavigation';
import DocsHeader from '@/components/DocsHeader';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <DocsHeader />
      <div className="flex">
        {/* Sidebar Navigation */}
        <DocsNavigation />
        
        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="docs-content">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}