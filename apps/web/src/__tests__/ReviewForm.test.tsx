import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReviewForm from '../components/ReviewForm';

const mockOnSubmit = jest.fn();

describe('ReviewForm', () => {
  beforeEach(() => {
    mockOnSubmit.mockReset();
  });

  it('renders rating stars and comment input', () => {
    render(<ReviewForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/rating/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/comment/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('submits with rating and comment', async () => {
    mockOnSubmit.mockResolvedValue({ success: true });

    render(<ReviewForm onSubmit={mockOnSubmit} />);

    const ratingSelect = screen.getByLabelText(/rating/i);
    await userEvent.selectOptions(ratingSelect, '5');

    const commentInput = screen.getByPlaceholderText(/comment/i);
    await userEvent.type(commentInput, 'Great service!');

    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      rating: 5,
      comment: 'Great service!',
    });
  });

  it('requires rating before submit', async () => {
    render(<ReviewForm onSubmit={mockOnSubmit} />);

    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(mockOnSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/rating is required/i)).toBeInTheDocument();
  });

  it('shows success message after submit', async () => {
    mockOnSubmit.mockResolvedValue({ success: true });

    render(<ReviewForm onSubmit={mockOnSubmit} />);

    await userEvent.selectOptions(screen.getByLabelText(/rating/i), '4');
    await userEvent.type(
      screen.getByPlaceholderText(/comment/i),
      'Good work'
    );
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/thank you/i)).toBeInTheDocument();
    });
  });

  it('shows error message on failure', async () => {
    mockOnSubmit.mockResolvedValue({
      success: false,
      error: 'You have already reviewed this mechanic',
    });

    render(<ReviewForm onSubmit={mockOnSubmit} />);

    await userEvent.selectOptions(screen.getByLabelText(/rating/i), '3');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/already reviewed/i)).toBeInTheDocument();
    });
  });
});
