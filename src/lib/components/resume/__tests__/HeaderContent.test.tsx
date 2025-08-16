import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HeaderContent from '../HeaderContent';

describe('HeaderContent', () => {
  const mockProps = {
    name: 'John Doe',
    title: 'Software Engineer',
    summary: 'Experienced developer with expertise in React and TypeScript.',
    qualities: ['Problem Solver', 'Team Player', 'Innovation Focused']
  };

  it('should render name and title correctly', () => {
    render(<HeaderContent {...mockProps} />);
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('John Doe');
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
  });

  it('should render summary text', () => {
    render(<HeaderContent {...mockProps} />);
    
    expect(screen.getByText(mockProps.summary)).toBeInTheDocument();
  });

  it('should render all qualities as list items', () => {
    render(<HeaderContent {...mockProps} />);
    
    mockProps.qualities.forEach(quality => {
      expect(screen.getByText(quality)).toBeInTheDocument();
    });
  });

  it('should render qualities in a list', () => {
    render(<HeaderContent {...mockProps} />);
    
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
    
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(mockProps.qualities.length);
  });

  it('should apply correct CSS classes for layout', () => {
    const { container } = render(<HeaderContent {...mockProps} />);
    
    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass('flex-1');
  });

  it('should apply responsive alignment classes', () => {
    const { container } = render(<HeaderContent {...mockProps} />);
    
    const headerContainer = container.querySelector('.flex.items-baseline');
    expect(headerContainer).toHaveClass('justify-center', 'md:justify-start');
  });

  it('should apply responsive text sizing classes', () => {
    render(<HeaderContent {...mockProps} />);
    
    const nameHeading = screen.getByRole('heading', { level: 1 });
    expect(nameHeading).toHaveClass('text-2xl', 'md:text-3xl');
    
    const titleHeading = screen.getByText('Software Engineer');
    expect(titleHeading).toHaveClass('text-xl', 'md:text-2xl');
  });
});