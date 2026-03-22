import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Navbar from '../Navbar';

// Mock Next.js navigation and Link
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode, href: string }) => (
    <a href={href}>{children}</a>
  )
}));

describe('Navbar', () => {
  it('renders the branding logo and name', () => {
    render(<Navbar />);
    expect(screen.getByText('HealixPharm')).toBeInTheDocument();
    expect(screen.getByText('eChannelling')).toBeInTheDocument();
    expect(screen.getByAltText('HealixPharm')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Navbar />);
    const homeLink = screen.getByText('Home');
    const bookLink = screen.getByText('Book Doctor');
    
    expect(homeLink).toBeInTheDocument();
    expect(homeLink.closest('a')).toHaveAttribute('href', '/');
    
    expect(bookLink).toBeInTheDocument();
    expect(bookLink.closest('a')).toHaveAttribute('href', '/channel');
  });
});
