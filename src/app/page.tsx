import Link from 'next/link';
import { APP_CONFIG } from '@/lib/utils/constants';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect('/dashboard');
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="mb-6 text-4xl font-bold text-gray-900">
            {APP_CONFIG.name}
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
            {APP_CONFIG.description}
          </p>
          <div className="space-y-4 sm:flex sm:justify-center sm:space-x-4 sm:space-y-0">
            <Link
              href="/auth/login"
              className="block w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 sm:w-auto"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="hover:bg-muted/50 block w-full rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-900 transition-colors sm:w-auto"
            >
              Get Started
            </Link>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-colors">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Sales Management
            </h3>
            <p className="text-gray-600">
              Track daily sales, manage drivers, and monitor performance with
              real-time updates.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-colors">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Inventory Control
            </h3>
            <p className="text-gray-600">
              Automated inventory calculations for full and empty cylinders with
              exact formulas.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-colors">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Financial Reports
            </h3>
            <p className="text-gray-600">
              Comprehensive financial reporting with income statements and
              balance sheets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
