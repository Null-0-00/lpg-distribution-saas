import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Sign in or create an account for LPG Distributor SaaS',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
