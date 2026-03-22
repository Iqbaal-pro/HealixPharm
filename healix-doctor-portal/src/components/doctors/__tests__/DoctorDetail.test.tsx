import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DoctorDetail from '../DoctorDetail';
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
  otherHospitals: [
    { name: 'City Clinic', days: 'Mon, Wed', hours: '4 PM - 7 PM' }
  ],
  qualifications: 'MBBS, MD',
  experience: '10 Years'
};

vi.mock('../../../lib/api', () => ({
  fetchSlots: vi.fn().mockResolvedValue([
    { id: 101, time: '09:00 AM', booked: false, date: '2023-12-01' },
    { id: 102, time: '09:30 AM', booked: true, date: '2023-12-01' },
  ]),
}));

describe('DoctorDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders doctor details correctly', () => {
    render(
      <DoctorDetail 
        doctor={mockDoctor} selectedSlot="" selectedSlotId={null} selectedDate="2023-12-01"
        onSelectSlot={vi.fn()} selectedHospital="General Hospital" onSelectHospital={vi.fn()}
        onBook={vi.fn()} onBack={vi.fn()}
      />
    );
    
    expect(screen.getByText('Dr. John Doe')).toBeInTheDocument();
    expect(screen.getByText('MBBS, MD')).toBeInTheDocument();
    expect(screen.getByText('10 Years')).toBeInTheDocument();
    expect(screen.getByText('City Clinic')).toBeInTheDocument();
  });

  it('fetches and renders time slots automatically', async () => {
    render(
      <DoctorDetail 
        doctor={mockDoctor} selectedSlot="" selectedSlotId={null} selectedDate="2023-12-01"
        onSelectSlot={vi.fn()} selectedHospital="General Hospital" onSelectHospital={vi.fn()}
        onBook={vi.fn()} onBack={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('09:00 AM')).toBeInTheDocument();
      expect(screen.getByText('09:30 AM')).toBeInTheDocument();
    });
  });

  it('allows changing hospital location', async () => {
    const handleSelectHospital = vi.fn();
    render(
      <DoctorDetail 
        doctor={mockDoctor} selectedSlot="" selectedSlotId={null} selectedDate="2023-12-01"
        onSelectSlot={vi.fn()} selectedHospital="General Hospital" onSelectHospital={handleSelectHospital}
        onBook={vi.fn()} onBack={vi.fn()}
      />
    );

    const otherClinicBtn = screen.getByText('City Clinic').closest('button');
    fireEvent.click(otherClinicBtn!);
    
    expect(handleSelectHospital).toHaveBeenCalledWith('City Clinic');
  });
});
