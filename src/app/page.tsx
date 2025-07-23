import Link from "next/link";
import { APP_CONFIG } from "@/lib/utils/constants";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            {APP_CONFIG.name}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {APP_CONFIG.description}
          </p>
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Link
              href="/auth/login"
              className="block w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="block w-full sm:w-auto bg-white hover:bg-muted/50 text-gray-900 font-medium py-3 px-6 rounded-lg border border-gray-300 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transition-colors">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sales Management
            </h3>
            <p className="text-gray-600">
              Track daily sales, manage drivers, and monitor performance with real-time updates.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transition-colors">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Inventory Control
            </h3>
            <p className="text-gray-600">
              Automated inventory calculations for full and empty cylinders with exact formulas.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transition-colors">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Financial Reports
            </h3>
            <p className="text-gray-600">
              Comprehensive financial reporting with income statements and balance sheets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
