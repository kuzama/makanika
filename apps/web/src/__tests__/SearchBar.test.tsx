import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '../components/SearchBar';

// Mock the api module
jest.mock('../lib/api', () => ({
  api: {
    searchMechanics: jest.fn(),
  },
}));

import { api } from '../lib/api';

const mockOnSearch = jest.fn();
const mockSearchMechanics = api.searchMechanics as jest.Mock;

describe('SearchBar', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockOnSearch.mockReset();
    mockSearchMechanics.mockReset();
    mockSearchMechanics.mockResolvedValue({
      mechanics: [],
      total: 0,
      page: 1,
      limit: 5,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders search input', () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    expect(screen.getByPlaceholderText(/search mechanics/i)).toBeInTheDocument();
  });

  it('debounces input (300ms)', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText(/search mechanics/i);
    await user.type(input, 'eng');

    // Should NOT call API before 300ms
    expect(mockSearchMechanics).not.toHaveBeenCalled();

    // Advance timers to trigger debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(mockSearchMechanics).toHaveBeenCalledWith(
        expect.objectContaining({ query: 'eng' })
      );
    });
  });

  it('calls API with search query after debounce', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    mockSearchMechanics.mockResolvedValue({
      mechanics: [
        { id: '1', businessName: 'Engine Masters', phone: '+263771000001' },
      ],
      total: 1,
      page: 1,
      limit: 5,
    });

    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText(/search mechanics/i);
    await user.type(input, 'engine');

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(mockSearchMechanics).toHaveBeenCalledWith(
        expect.objectContaining({ query: 'engine' })
      );
    });
  });

  it('shows results dropdown after search', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    mockSearchMechanics.mockResolvedValue({
      mechanics: [
        { id: '1', businessName: 'Engine Masters', phone: '+263771000001' },
        { id: '2', businessName: 'Brake Experts', phone: '+263771000002' },
      ],
      total: 2,
      page: 1,
      limit: 5,
    });

    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText(/search mechanics/i);
    await user.type(input, 'mech');

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.getByText('Engine Masters')).toBeInTheDocument();
      expect(screen.getByText('Brake Experts')).toBeInTheDocument();
    });
  });

  it('calls onSearch when a result is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    mockSearchMechanics.mockResolvedValue({
      mechanics: [
        { id: '1', businessName: 'Engine Masters', phone: '+263771000001' },
      ],
      total: 1,
      page: 1,
      limit: 5,
    });

    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText(/search mechanics/i);
    await user.type(input, 'engine');

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.getByText('Engine Masters')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Engine Masters'));
    expect(mockOnSearch).toHaveBeenCalledWith('1');
  });

  it('clear button resets search', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText(/search mechanics/i);
    await user.type(input, 'test');

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /clear/i }));

    expect(input).toHaveValue('');
  });

  it('shows no results message when search returns empty', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    mockSearchMechanics.mockResolvedValue({
      mechanics: [],
      total: 0,
      page: 1,
      limit: 5,
    });

    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText(/search mechanics/i);
    await user.type(input, 'xyznonexistent');

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.getByText(/no results/i)).toBeInTheDocument();
    });
  });
});
