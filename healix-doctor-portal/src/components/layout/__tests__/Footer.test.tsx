import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Footer from '../Footer';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode, href: string }) => (
    <a href={href}>{children}</a>
  )
}));

describe('Footer', () => {
  it('renders branding and tagline', () => {
    render(<Footer />);
    expect(screen.getAllByText('HealixPharm')[0]).toBeInTheDocument();
    expect(screen.getByText('eCHANNELLING')).toBeInTheDocument();
    expect(screen.getByText(/Sri Lanka's smart pharmacy platform/i)).toBeInTheDocument();
  });

  it('renders contact information', () => {
    render(<Footer />);
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('Colombo 03, Sri Lanka')).toBeInTheDocument();
    expect(screen.getByText('+94 11 234 5678')).toBeInTheDocument();
    expect(screen.getByText('healixpharm@gmail.com')).toBeInTheDocument();
    expect(screen.getByText('WhatsApp: +94 77 000 0000')).toBeInTheDocument();
  });

  it('renders social media links', () => {
    render(<Footer />);
    expect(screen.getByText('Follow Us')).toBeInTheDocument();
    expect(screen.getByTitle('Twitter')).toBeInTheDocument();
    expect(screen.getByTitle('LinkedIn')).toBeInTheDocument();
    expect(screen.getByTitle('Facebook')).toBeInTheDocument();
    expect(screen.getByTitle('Instagram')).toBeInTheDocument();
  });

  it('renders copyright and terms links', () => {
    render(<Footer />);
    expect(screen.getByText(/Healix Smart Pharmacy. All rights reserved/i)).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
  });
});
