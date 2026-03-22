import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Badge from '../Badge';

describe('Badge', () => {
  it('renders with default blue variant', () => {
    render(<Badge>Default Badge</Badge>);
    const badge = screen.getByText('Default Badge');
    expect(badge).toBeInTheDocument();
    expect(badge.tagName.toLowerCase()).toBe('span');
  });

  it('renders with green variant', () => {
    render(<Badge variant="green">Green Badge</Badge>);
    expect(screen.getByText('Green Badge')).toBeInTheDocument();
  });

  it('renders with red variant', () => {
    render(<Badge variant="red">Red Badge</Badge>);
    expect(screen.getByText('Red Badge')).toBeInTheDocument();
  });
});
