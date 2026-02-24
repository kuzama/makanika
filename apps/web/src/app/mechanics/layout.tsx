import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse Mechanics',
  description: 'Browse and search for verified mechanics in Harare. Filter by vehicle type, service, and location.',
  openGraph: {
    title: 'Browse Mechanics | Harare Mechanic Finder',
    description: 'Browse and search for verified mechanics in Harare. Filter by vehicle type, service, and location.',
  },
};

export default function MechanicsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
