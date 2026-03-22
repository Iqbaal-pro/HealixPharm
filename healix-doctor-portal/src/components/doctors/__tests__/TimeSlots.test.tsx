import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TimeSlots from '../TimeSlots';

const mockSlots = [
  { id: 1, time: '09:00 AM', booked: false, date: '2023-12-01' },
  { id: 2, time: '09:30 AM', booked: true, date: '2023-12-01' },
];

describe('TimeSlots', () => {
  it('renders loading state', () => {
    const { container } = render(
      <TimeSlots 
        slots={[]} loading={true} error="" selected="" 
        onSelect={vi.fn()} onBook={vi.fn()} hospital="Test Hosp" 
        hours="9-5" date="2023-01-01" 
      />
    );
    // Loading state shows empty div blocks
    expect(container.querySelectorAll('.animate-fade-up-2').length).toBeGreaterThan(0);
  });

  it('renders error state', () => {
    render(
      <TimeSlots 
        slots={[]} loading={false} error="Failed to load slots" selected="" 
        onSelect={vi.fn()} onBook={vi.fn()} hospital="Test Hosp" 
        hours="9-5" date="2023-01-01" 
      />
    );
    expect(screen.getByText('Failed to load slots')).toBeInTheDocument();
  });

  it('renders "no slots available"', () => {
    render(
      <TimeSlots 
        slots={[]} loading={false} error="" selected="" 
        onSelect={vi.fn()} onBook={vi.fn()} hospital="Test Hosp" 
        hours="9-5" date="2023-01-01" 
      />
    );
    expect(screen.getByText('No slots available')).toBeInTheDocument();
  });

  it('renders slots correctly', () => {
    render(
      <TimeSlots 
        slots={mockSlots} loading={false} error="" selected="" 
        onSelect={vi.fn()} onBook={vi.fn()} hospital="Test Hosp" 
        hours="9-5" date="2023-01-01" 
      />
    );
    
    const availableBtn = screen.getByRole('button', { name: '09:00 AM' });
    const bookedBtn = screen.getByRole('button', { name: '09:30 AM' });
    
    expect(availableBtn).toBeInTheDocument();
    expect(availableBtn).not.toBeDisabled();
    
    expect(bookedBtn).toBeInTheDocument();
    expect(bookedBtn).toBeDisabled();
  });

  it('calls onSelect when an available slot is clicked', () => {
    const handleSelect = vi.fn();
    render(
      <TimeSlots 
        slots={mockSlots} loading={false} error="" selected="" 
        onSelect={handleSelect} onBook={vi.fn()} hospital="Test Hosp" 
        hours="9-5" date="2023-01-01" 
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: '09:00 AM' }));
    expect(handleSelect).toHaveBeenCalledWith('09:00 AM', 1);
  });

  it('shows Book Now section when a slot is selected', () => {
    const handleBook = vi.fn();
    render(
      <TimeSlots 
        slots={mockSlots} loading={false} error="" selected="09:00 AM" 
        onSelect={vi.fn()} onBook={handleBook} hospital="Test Hosp" 
        hours="9-5" date="2023-01-01" 
      />
    );
    
    expect(screen.getByText('Your Selected Time')).toBeInTheDocument();
    expect(screen.getByText('09:00 AM', { selector: 'p' })).toBeInTheDocument();
    
    const bookBtn = screen.getByRole('button', { name: /book now/i });
    fireEvent.click(bookBtn);
    expect(handleBook).toHaveBeenCalled();
  });
});
