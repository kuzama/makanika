import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterPanel from '../components/FilterPanel';

const mockOnFilterChange = jest.fn();

// Mock next/navigation
const mockReplace = jest.fn();
const mockSearchParams = new URLSearchParams();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => '/mechanics',
}));

describe('FilterPanel', () => {
  beforeEach(() => {
    mockOnFilterChange.mockReset();
    mockReplace.mockReset();
  });

  it('renders vehicle type checkboxes', () => {
    render(<FilterPanel onFilterChange={mockOnFilterChange} />);
    expect(screen.getByLabelText(/car/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/truck/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/motorcycle/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/heavy plant/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bus/i)).toBeInTheDocument();
  });

  it('renders price range selector', () => {
    render(<FilterPanel onFilterChange={mockOnFilterChange} />);
    expect(screen.getByLabelText(/price range/i)).toBeInTheDocument();
    expect(screen.getByText(/budget/i)).toBeInTheDocument();
    expect(screen.getByText(/moderate/i)).toBeInTheDocument();
    expect(screen.getByText(/premium/i)).toBeInTheDocument();
  });

  it('renders verification status filter', () => {
    render(<FilterPanel onFilterChange={mockOnFilterChange} />);
    expect(screen.getByLabelText(/verified only/i)).toBeInTheDocument();
  });

  it('renders service checkboxes', () => {
    render(<FilterPanel onFilterChange={mockOnFilterChange} />);
    expect(screen.getByLabelText(/engine repair/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/electrical/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/body work/i)).toBeInTheDocument();
  });

  it('calls onFilterChange when a vehicle type is selected', async () => {
    const user = userEvent.setup();
    render(<FilterPanel onFilterChange={mockOnFilterChange} />);

    await user.click(screen.getByLabelText(/car/i));

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        vehicleTypes: expect.arrayContaining(['CAR']),
      })
    );
  });

  it('calls onFilterChange when multiple vehicle types selected', async () => {
    const user = userEvent.setup();
    render(<FilterPanel onFilterChange={mockOnFilterChange} />);

    await user.click(screen.getByLabelText(/car/i));
    await user.click(screen.getByLabelText(/truck/i));

    // Last call should have both
    const lastCall = mockOnFilterChange.mock.calls[mockOnFilterChange.mock.calls.length - 1][0];
    expect(lastCall.vehicleTypes).toContain('CAR');
    expect(lastCall.vehicleTypes).toContain('TRUCK');
  });

  it('calls onFilterChange when price range selected', async () => {
    const user = userEvent.setup();
    render(<FilterPanel onFilterChange={mockOnFilterChange} />);

    await user.selectOptions(screen.getByLabelText(/price range/i), 'BUDGET');

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ priceRange: 'BUDGET' })
    );
  });

  it('calls onFilterChange when verified only toggled', async () => {
    const user = userEvent.setup();
    render(<FilterPanel onFilterChange={mockOnFilterChange} />);

    await user.click(screen.getByLabelText(/verified only/i));

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ verifiedOnly: true })
    );
  });

  it('updates URL params when filters change', async () => {
    const user = userEvent.setup();
    render(<FilterPanel onFilterChange={mockOnFilterChange} />);

    await user.click(screen.getByLabelText(/car/i));

    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringContaining('vehicleTypes=CAR')
    );
  });

  it('clears all filters when clear button clicked', async () => {
    const user = userEvent.setup();
    render(<FilterPanel onFilterChange={mockOnFilterChange} />);

    await user.click(screen.getByLabelText(/car/i));
    await user.click(screen.getByLabelText(/verified only/i));

    await user.click(screen.getByRole('button', { name: /clear all/i }));

    const lastCall = mockOnFilterChange.mock.calls[mockOnFilterChange.mock.calls.length - 1][0];
    expect(lastCall.vehicleTypes).toEqual([]);
    expect(lastCall.verifiedOnly).toBe(false);
    expect(lastCall.priceRange).toBe('');
    expect(lastCall.services).toEqual([]);
  });
});
