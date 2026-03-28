import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DoctorCard from '../DoctorCard';
import { Doctor } from '../../../types';

const mockDoctor: Doctor = {
  id: 1,
  name: 'Dr. John Doe',
  initials: 'JD',
  specialization: 'Cardiologist',
  hospital: 'General Hospital',
  fee: 2500,
  serviceFee: 300,
  available: true,
  otherHospitals: [],
};

describe('DoctorCard', () => {
  it('renders doctor information correctly', () => {
    render(<DoctorCard doctor={mockDoctor} onChannel={vi.fn()} />);
    
    expect(screen.getByText('Dr. John Doe')).toBeInTheDocument();
    expect(screen.getByText('Cardiologist')).toBeInTheDocument();
    expect(screen.getByText('General Hospital')).toBeInTheDocument();
    expect(screen.getByText('Rs. 2,500')).toBeInTheDocument(); 
    // We can just query by text content if formatCurrency uses a specific format,
    // let's look for part of it
    expect(screen.getByText(/2,500/i)).toBeInTheDocument();
  });

  it('renders Channel button when doctor is available', () => {
    render(<DoctorCard doctor={mockDoctor} onChannel={vi.fn()} />);
    const button = screen.getByRole('button', { name: /channel/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('renders Fully Booked button when doctor is not available', () => {
    const unavailableDoc = { ...mockDoctor, available: false };
    render(<DoctorCard doctor={unavailableDoc} onChannel={vi.fn()} />);
    const button = screen.getByRole('button', { name: /fully booked/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it('calls onChannel when Channel button is clicked', () => {
    const handleChannel = vi.fn();
    render(<DoctorCard doctor={mockDoctor} onChannel={handleChannel} />);
    fireEvent.click(screen.getByRole('button', { name: /channel/i }));
    expect(handleChannel).toHaveBeenCalledWith(mockDoctor);
  });
});
