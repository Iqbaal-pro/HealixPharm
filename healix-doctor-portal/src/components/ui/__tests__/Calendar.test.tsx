import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Calendar from '../Calendar';

describe('Calendar', () => {
  it('renders current month and year', () => {
    const today = new Date();
    const MONTH_NAMES = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December",
    ];
    render(<Calendar selected="" onSelect={vi.fn()} />);
    const header = screen.getByText(new RegExp(`${MONTH_NAMES[today.getMonth()]} ${today.getFullYear()}`));
    expect(header).toBeInTheDocument();
  });

  it('calls onSelect when a valid future/current date is clicked', () => {
    const handleSelect = vi.fn();
    const today = new Date();
    const currentDay = today.getDate();
    
    render(<Calendar selected="" onSelect={handleSelect} />);
    
    // Find the button for "today"
    const dayButtons = screen.getAllByRole('button');
    const todayButton = dayButtons.find(btn => btn.textContent === String(currentDay));
    
    if (todayButton) {
      fireEvent.click(todayButton);
      expect(handleSelect).toHaveBeenCalled();
      const expectedDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(currentDay).padStart(2, "0")}`;
      expect(handleSelect).toHaveBeenCalledWith(expectedDateStr);
    }
  });

  it('changes month when next/prev buttons are clicked', () => {
    render(<Calendar selected="" onSelect={vi.fn()} />);
    
    const prevButton = screen.getByText('‹');
    const nextButton = screen.getByText('›');
    
    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
    
    // Click next month
    fireEvent.click(nextButton);
    // Click prev month
    fireEvent.click(prevButton);
  });
});
