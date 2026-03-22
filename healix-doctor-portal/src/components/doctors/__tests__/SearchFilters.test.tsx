import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SearchFilters from '../SearchFilters';

vi.mock('../../../lib/api', () => ({
  fetchFilterOptions: vi.fn().mockResolvedValue({
    specializations: ['Cardiologist', 'Dermatologist'],
    hospitals: ['General Hospital', 'City Clinic']
  })
}));

describe('SearchFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all filter fields', () => {
    render(<SearchFilters onSearch={vi.fn()} />);
    expect(screen.getByText('Specialization')).toBeInTheDocument();
    expect(screen.getByText('Hospital')).toBeInTheDocument();
    expect(screen.getByText('Preferred Date')).toBeInTheDocument();
    expect(screen.getByText('Doctor Name')).toBeInTheDocument();
  });

  it('loads and displays filter options', async () => {
    render(<SearchFilters onSearch={vi.fn()} />);
    
    // Check loading text initially
    expect(screen.queryAllByText('Loading...').length).toBeGreaterThan(0);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Opening specialization dropdown
    fireEvent.click(screen.getByText('All Specializations'));
    expect(screen.getByText('Cardiologist')).toBeInTheDocument();
  });

  it('triggers onSearch with correct filters when search button is clicked', async () => {
    const handleSearch = vi.fn();
    render(<SearchFilters onSearch={handleSearch} />);
    
    // Type a doctor's name
    const input = screen.getByPlaceholderText('e.g. Dr. Perera...');
    fireEvent.change(input, { target: { value: 'Dr. Smith' } });
    
    // Click Search button
    fireEvent.click(screen.getByRole('button', { name: /search doctors/i }));
    
    expect(handleSearch).toHaveBeenCalledWith({
      specialization: '',
      hospital: '',
      date: '',
      doctorName: 'Dr. Smith'
    });
  });
});
