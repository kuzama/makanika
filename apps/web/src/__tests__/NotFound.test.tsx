import React from 'react';
import { render, screen } from '@testing-library/react';
import NotFound from '../app/not-found';

describe('Not Found Page', () => {
  it('renders 404 heading', () => {
    render(<NotFound />);
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('renders page not found message', () => {
    render(<NotFound />);
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
  });

  it('renders Go Home link', () => {
    render(<NotFound />);
    expect(screen.getByRole('link', { name: /go home/i })).toHaveAttribute('href', '/');
  });

  it('renders Browse Mechanics link', () => {
    render(<NotFound />);
    expect(screen.getByRole('link', { name: /browse mechanics/i })).toHaveAttribute('href', '/mechanics');
  });
});
