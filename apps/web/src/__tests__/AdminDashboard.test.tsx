import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminDashboard from '../components/AdminDashboard';

const mockGetStats = jest.fn();
const mockGetPending = jest.fn();
const mockApprove = jest.fn();
const mockReject = jest.fn();

const stats = {
  totalMechanics: 50,
  pendingVerifications: 3,
  verifiedMechanics: 30,
  totalUsers: 100,
  totalReviews: 200,
};

const pendingMechanics = [
  {
    id: 'mech-1',
    businessName: 'Fix-It Garage',
    phone: '+263771234567',
    verificationStatus: 'PENDING',
    verificationDocs: ['license.pdf'],
    listedBy: { name: 'John', phone: '+263771234567' },
    createdAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'mech-2',
    businessName: 'Truck Masters',
    phone: '+263772345678',
    verificationStatus: 'PENDING',
    verificationDocs: ['cert.pdf', 'id.pdf'],
    listedBy: { name: 'Sarah', phone: '+263772345678' },
    createdAt: '2025-02-01T14:00:00Z',
  },
];

describe('AdminDashboard', () => {
  beforeEach(() => {
    mockGetStats.mockReset();
    mockGetPending.mockReset();
    mockApprove.mockReset();
    mockReject.mockReset();

    mockGetStats.mockResolvedValue(stats);
    mockGetPending.mockResolvedValue(pendingMechanics);
  });

  it('renders stats cards', async () => {
    render(
      <AdminDashboard
        getStats={mockGetStats}
        getPending={mockGetPending}
        onApprove={mockApprove}
        onReject={mockReject}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('50')).toBeInTheDocument(); // totalMechanics
      expect(screen.getByText('3')).toBeInTheDocument();  // pending
      expect(screen.getByText('100')).toBeInTheDocument(); // users
    });
  });

  it('renders pending mechanics list', async () => {
    render(
      <AdminDashboard
        getStats={mockGetStats}
        getPending={mockGetPending}
        onApprove={mockApprove}
        onReject={mockReject}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Fix-It Garage')).toBeInTheDocument();
      expect(screen.getByText('Truck Masters')).toBeInTheDocument();
    });
  });

  it('calls onApprove when approve button clicked', async () => {
    mockApprove.mockResolvedValue({ success: true });

    render(
      <AdminDashboard
        getStats={mockGetStats}
        getPending={mockGetPending}
        onApprove={mockApprove}
        onReject={mockReject}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Fix-It Garage')).toBeInTheDocument();
    });

    const approveButtons = screen.getAllByRole('button', { name: /approve/i });
    await userEvent.click(approveButtons[0]);

    expect(mockApprove).toHaveBeenCalledWith('mech-1');
  });

  it('calls onReject when reject button clicked', async () => {
    mockReject.mockResolvedValue({ success: true });

    render(
      <AdminDashboard
        getStats={mockGetStats}
        getPending={mockGetPending}
        onApprove={mockApprove}
        onReject={mockReject}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Truck Masters')).toBeInTheDocument();
    });

    const rejectButtons = screen.getAllByRole('button', { name: /reject/i });
    await userEvent.click(rejectButtons[1]);

    expect(mockReject).toHaveBeenCalledWith('mech-2');
  });

  it('shows document count for each pending mechanic', async () => {
    render(
      <AdminDashboard
        getStats={mockGetStats}
        getPending={mockGetPending}
        onApprove={mockApprove}
        onReject={mockReject}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/1 document/i)).toBeInTheDocument();
      expect(screen.getByText(/2 documents/i)).toBeInTheDocument();
    });
  });
});
