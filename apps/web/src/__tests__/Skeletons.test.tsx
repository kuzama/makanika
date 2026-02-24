import React from 'react';
import { render, screen } from '@testing-library/react';
import MechanicCardSkeleton from '../components/MechanicCardSkeleton';
import MechanicDetailSkeleton from '../components/MechanicDetailSkeleton';

describe('MechanicCardSkeleton', () => {
  it('renders skeleton with aria-hidden', () => {
    const { container } = render(<MechanicCardSkeleton />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
  });

  it('has animate-pulse class for loading animation', () => {
    const { container } = render(<MechanicCardSkeleton />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton.className).toContain('animate-pulse');
  });
});

describe('MechanicDetailSkeleton', () => {
  it('renders skeleton with aria-hidden', () => {
    const { container } = render(<MechanicDetailSkeleton />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
  });

  it('has animate-pulse class for loading animation', () => {
    const { container } = render(<MechanicDetailSkeleton />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton.className).toContain('animate-pulse');
  });
});
