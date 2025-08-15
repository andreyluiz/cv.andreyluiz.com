import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Header from '../Header';

describe('Header', () => {
  const mockProps = {
    name: 'John Doe',
    title: 'Software Engineer',
    summary: 'Experienced developer with expertise in React and TypeScript.',
    qualities: ['Problem Solver', 'Team Player', 'Innovation Focused']
  };

  it('should render both ProfileImage and HeaderContent', () => {
    render(<Header {...mockProps} />);
    
    // Check ProfileImage is rendered
    const image = screen.getByRole('img', { name: /profile picture/i });
    expect(image).toBeInTheDocument();
    
    // Check HeaderContent is rendered
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('John Doe');
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText(mockProps.summary)).toBeInTheDocument();
  });

  it('should maintain the original header layout structure', () => {
    const { container } = render(<Header {...mockProps} />);
    
    const header = container.querySelector('header');
    expect(header).toHaveClass('flex', 'items-center', 'justify-between', 'gap-8');
  });

  it('should render all qualities', () => {
    render(<Header {...mockProps} />);
    
    mockProps.qualities.forEach(quality => {
      expect(screen.getByText(quality)).toBeInTheDocument();
    });
  });
});