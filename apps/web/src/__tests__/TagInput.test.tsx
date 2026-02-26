import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TagInput from '../components/TagInput';

const mockOnChange = jest.fn();

describe('TagInput', () => {
  beforeEach(() => {
    mockOnChange.mockReset();
  });

  it('renders label, input, and Add button', () => {
    render(<TagInput label="Services" tags={[]} onChange={mockOnChange} id="services" />);

    expect(screen.getByLabelText('Services')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  it('adds a tag on button click', async () => {
    render(<TagInput label="Services" tags={[]} onChange={mockOnChange} id="services" />);

    await userEvent.type(screen.getByLabelText('Services'), 'Engine Repair');
    await userEvent.click(screen.getByRole('button', { name: /add/i }));

    expect(mockOnChange).toHaveBeenCalledWith(['Engine Repair']);
  });

  it('adds a tag on Enter key', async () => {
    render(<TagInput label="Services" tags={[]} onChange={mockOnChange} id="services" />);

    await userEvent.type(screen.getByLabelText('Services'), 'Brakes{Enter}');

    expect(mockOnChange).toHaveBeenCalledWith(['Brakes']);
  });

  it('removes a tag on x button click', async () => {
    render(
      <TagInput
        label="Services"
        tags={['Engine', 'Brakes']}
        onChange={mockOnChange}
        id="services"
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /remove engine/i }));

    expect(mockOnChange).toHaveBeenCalledWith(['Brakes']);
  });

  it('does not add duplicate tags', async () => {
    render(
      <TagInput
        label="Services"
        tags={['Engine']}
        onChange={mockOnChange}
        id="services"
      />
    );

    await userEvent.type(screen.getByLabelText('Services'), 'Engine');
    await userEvent.click(screen.getByRole('button', { name: /add/i }));

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('does not add empty tags', async () => {
    render(<TagInput label="Services" tags={[]} onChange={mockOnChange} id="services" />);

    await userEvent.click(screen.getByRole('button', { name: /add/i }));

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('renders existing tags', () => {
    render(
      <TagInput
        label="Services"
        tags={['Engine', 'Brakes', 'Electrical']}
        onChange={mockOnChange}
        id="services"
      />
    );

    expect(screen.getByText('Engine')).toBeInTheDocument();
    expect(screen.getByText('Brakes')).toBeInTheDocument();
    expect(screen.getByText('Electrical')).toBeInTheDocument();
  });
});
