import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse Car Mechanics',
  description: 'Browse and search for verified car mechanics in Harare. Filter by car type, service, and location.',
  openGraph: {
    title: 'Browse Car Mechanics | Makanika',
    description: 'Browse and search for verified car mechanics in Harare. Filter by car type, service, and location.',
  },
};

export default function MechanicsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
