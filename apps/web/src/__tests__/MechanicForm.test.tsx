import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MechanicForm from '../components/MechanicForm';

const mockOnSubmit = jest.fn();

describe('MechanicForm', () => {
  beforeEach(() => {
    mockOnSubmit.mockReset();
  });

  it('renders all form fields', () => {
    render(<MechanicForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/business name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/latitude/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/longitude/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/price range/i)).toBeInTheDocument();
    expect(screen.getByText(/vehicle types/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create listing/i })).toBeInTheDocument();
  });

  it('shows validation error for missing business name', async () => {
    render(<MechanicForm onSubmit={mockOnSubmit} />);

    // Fill phone and coords but skip business name
    await userEvent.type(screen.getByLabelText(/phone number/i), '0771234567');
    await userEvent.type(screen.getByLabelText(/latitude/i), '-17.83');
    await userEvent.type(screen.getByLabelText(/longitude/i), '31.05');

    await userEvent.click(screen.getByRole('button', { name: /create listing/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/business name/i);
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('shows validation error for missing phone', async () => {
    render(<MechanicForm onSubmit={mockOnSubmit} />);

    await userEvent.type(screen.getByLabelText(/business name/i), 'Test Garage');
    await userEvent.type(screen.getByLabelText(/latitude/i), '-17.83');
    await userEvent.type(screen.getByLabelText(/longitude/i), '31.05');

    await userEvent.click(screen.getByRole('button', { name: /create listing/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/phone/i);
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('shows validation error for out-of-bounds coordinates', async () => {
    render(<MechanicForm onSubmit={mockOnSubmit} />);

    await userEvent.type(screen.getByLabelText(/business name/i), 'Test Garage');
    await userEvent.type(screen.getByLabelText(/phone number/i), '0771234567');
    await userEvent.type(screen.getByLabelText(/latitude/i), '50');
    await userEvent.type(screen.getByLabelText(/longitude/i), '31.05');

    await userEvent.click(screen.getByRole('button', { name: /create listing/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/latitude/i);
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with correct data', async () => {
    mockOnSubmit.mockResolvedValue(undefined);

    render(<MechanicForm onSubmit={mockOnSubmit} />);

    await userEvent.type(screen.getByLabelText(/business name/i), 'Kwame Auto');
    await userEvent.type(screen.getByLabelText(/phone number/i), '0771234567');
    await userEvent.type(screen.getByLabelText(/latitude/i), '-17.83');
    await userEvent.type(screen.getByLabelText(/longitude/i), '31.05');
    await userEvent.type(screen.getByLabelText(/address/i), '45 Main Street');

    // Select a vehicle type
    await userEvent.click(screen.getByLabelText('Car'));

    await userEvent.click(screen.getByRole('button', { name: /create listing/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          businessName: 'Kwame Auto',
          phone: '0771234567',
          latitude: -17.83,
          longitude: 31.05,
          address: '45 Main Street',
          priceRange: 'MODERATE',
          vehicleTypes: ['CAR'],
        })
      );
    });
  });

  it('shows loading state while submitting', () => {
    render(<MechanicForm onSubmit={mockOnSubmit} loading={true} />);

    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
  });

  it('pre-fills values when initialValues provided', () => {
    render(
      <MechanicForm
        onSubmit={mockOnSubmit}
        initialValues={{
          businessName: 'Existing Garage',
          phone: '0779999999',
          latitude: -17.85,
          longitude: 31.03,
          priceRange: 'PREMIUM',
        }}
        submitLabel="Save Changes"
      />
    );

    expect(screen.getByLabelText(/business name/i)).toHaveValue('Existing Garage');
    expect(screen.getByLabelText(/phone number/i)).toHaveValue('0779999999');
    expect(screen.getByLabelText(/price range/i)).toHaveValue('PREMIUM');
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });

  it('shows custom submit label', () => {
    render(
      <MechanicForm onSubmit={mockOnSubmit} submitLabel="Update Listing" />
    );

    expect(screen.getByRole('button', { name: /update listing/i })).toBeInTheDocument();
  });
});
