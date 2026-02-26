import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchFilters from '../components/SearchFilters';

const mockOnFilter = jest.fn();

describe('SearchFilters', () => {
  beforeEach(() => {
    mockOnFilter.mockReset();
  });

  it('renders vehicle type selector', () => {
    render(<SearchFilters onFilter={mockOnFilter} />);
    expect(screen.getByLabelText(/vehicle type/i)).toBeInTheDocument();
  });

  it('renders price range selector', () => {
    render(<SearchFilters onFilter={mockOnFilter} />);
    expect(screen.getByLabelText(/price range/i)).toBeInTheDocument();
  });

  it('renders verified only checkbox', () => {
    render(<SearchFilters onFilter={mockOnFilter} />);
    expect(screen.getByLabelText(/verified only/i)).toBeInTheDocument();
  });

  it('calls onFilter with selected vehicle type', async () => {
    render(<SearchFilters onFilter={mockOnFilter} />);

    await userEvent.selectOptions(screen.getByLabelText(/vehicle type/i), 'CAR');
    await userEvent.click(screen.getByRole('button', { name: /apply/i }));

    expect(mockOnFilter).toHaveBeenCalledWith(
      expect.objectContaining({ vehicleType: 'CAR' })
    );
  });

  it('calls onFilter with verified only checked', async () => {
    render(<SearchFilters onFilter={mockOnFilter} />);

    await userEvent.click(screen.getByLabelText(/verified only/i));
    await userEvent.click(screen.getByRole('button', { name: /apply/i }));

    expect(mockOnFilter).toHaveBeenCalledWith(
      expect.objectContaining({ verifiedOnly: true })
    );
  });

  it('calls onFilter with combined filters', async () => {
    render(<SearchFilters onFilter={mockOnFilter} />);

    await userEvent.selectOptions(screen.getByLabelText(/vehicle type/i), 'SUV');
    await userEvent.selectOptions(screen.getByLabelText(/price range/i), 'PREMIUM');
    await userEvent.click(screen.getByLabelText(/verified only/i));
    await userEvent.click(screen.getByRole('button', { name: /apply/i }));

    expect(mockOnFilter).toHaveBeenCalledWith({
      vehicleType: 'SUV',
      priceRange: 'PREMIUM',
      verifiedOnly: true,
    });
  });

  it('resets filters when clear button clicked', async () => {
    render(<SearchFilters onFilter={mockOnFilter} />);

    await userEvent.selectOptions(screen.getByLabelText(/vehicle type/i), 'CAR');
    await userEvent.click(screen.getByRole('button', { name: /clear/i }));

    expect(
      (screen.getByLabelText(/vehicle type/i) as HTMLSelectElement).value
    ).toBe('');
  });
});
