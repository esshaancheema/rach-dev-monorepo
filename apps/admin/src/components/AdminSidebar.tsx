'use client';

import { 
  HomeIcon, 
  UsersIcon, 
  ServerIcon, 
  ChartBarIcon, 
  CogIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Users', href: '/admin/users', icon: UsersIcon },
  { name: 'System', href: '/admin/system', icon: ServerIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Alerts', href: '/admin/alerts', icon: ExclamationTriangleIcon },
  { name: 'Logs', href: '/admin/logs', icon: DocumentTextIcon },
  { name: 'Security', href: '/admin/security', icon: ShieldCheckIcon },
  { name: 'Settings', href: '/admin/settings', icon: CogIcon },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 overflow-y-auto admin-sidebar">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-4 mb-8">
          <Link href="/admin" className="text-xl font-bold text-white">
            Zoptal Admin
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-grow flex flex-col">
          <nav className="flex-1 px-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`admin-sidebar-item ${
                    isActive ? 'admin-sidebar-item-active' : 'admin-sidebar-item-inactive'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Admin Info */}
        <div className="flex-shrink-0 p-4 border-t border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">A</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Admin User</p>
              <p className="text-xs text-gray-300">System Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}