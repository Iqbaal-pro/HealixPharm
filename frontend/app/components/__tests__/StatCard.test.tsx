import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import StatCard from '../StatCard';

describe('StatCard Component', () => {
  it('renders title and value properly', () => {
    render(<StatCard title="Total Patients" value="1,234" color="bg-blue-500" />);
    
    expect(screen.getByText('Total Patients')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('applies the correct color class to the icon container', () => {
    const { container } = render(<StatCard title="Revenue" value="$5,000" color="bg-green-500" />);
    
    // The second div in the StatCard should have the color class
    const iconDiv = container.querySelector('.bg-green-500');
    expect(iconDiv).toBeInTheDocument();
  });
});
