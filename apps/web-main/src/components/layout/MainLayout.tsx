import { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function MainLayout({ 
  children, 
  className = ''
}: MainLayoutProps) {
  return (
    <div className={`flex-1 ${className}`}>
      {children}
    </div>
  );
}