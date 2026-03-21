import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from '../Navbar';

describe('Navbar Component', () => {
  it('renders the search input with placeholder', () => {
    render(<Navbar onToggleSidebar={jest.fn()} />);
    
    const searchInput = screen.getByPlaceholderText('Search medicines, patients, orders...');
    expect(searchInput).toBeInTheDocument();
  });

  it('calls onToggleSidebar when the hamburger menu is clicked', () => {
    const mockOnToggleSidebar = jest.fn();
    const { container } = render(<Navbar onToggleSidebar={mockOnToggleSidebar} />);
    
    // Find the hamburger button (it's the first icon-btn)
    const hamburgerBtn = container.querySelectorAll('.icon-btn')[0];
    fireEvent.click(hamburgerBtn);
    
    expect(mockOnToggleSidebar).toHaveBeenCalledTimes(1);
  });

  it('updates the search input value when typed into', () => {
    render(<Navbar onToggleSidebar={jest.fn()} />);
    
    const searchInput = screen.getByPlaceholderText('Search medicines, patients, orders...') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'paracetamol' } });
    
    expect(searchInput.value).toBe('paracetamol');
  });
});
