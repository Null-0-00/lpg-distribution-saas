import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                LPG Distributor Management
              </h1>
              <p className="text-sm text-gray-600">
                Welcome back, {session.user.name}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Role: {session.user.role}
            </div>
          </div>
        </div>
      </div>
      <main>{children}</main>
    </div>
  );
}
