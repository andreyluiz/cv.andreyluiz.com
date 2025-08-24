import { describe, expect, test, beforeEach, afterEach } from 'bun:test';
import { screen, render, within, cleanup } from "@testing-library/react";
import { IntlProvider } from "next-intl";
import ContactInfo from './ContactInfo';

describe('Simple ContactInfo', () => {
    beforeEach(() => {
        const contactInfo = {
            email: "test@example.com",
            phone: "+1234567890",
            location: "New York, NY",
            website: "https://example.com",
            linkedin: "@example",
            github: "example",
            age: "30",
            nationality: "American",
        };

        render(
            <IntlProvider locale="en" messages={{ resume: { contactInfo: { title: "Contact" } } }}>
                <ContactInfo contactInfo={contactInfo} />
            </IntlProvider>
        );
    });

    afterEach(() => cleanup());

    test('renders contact information correctly', () => {
        const contactInfoRendered = screen.getByRole('region', { name: /Contact/i });
        expect(contactInfoRendered).toBeInTheDocument();
    });

    test('correctly render email link', () => {
        const contactInfoRendered = screen.getByRole('region', { name: /Contact/i });
        const emailLink = within(contactInfoRendered).getByRole('link', { name: 'test@example.com' });
        expect(emailLink).toHaveAttribute('href', 'mailto:test@example.com');
    });

    test('correctly render phone link', () => {
        const contactInfoRendered = screen.getByRole('region', { name: /Contact/i });
        const phoneLink = within(contactInfoRendered).getByRole('link', { name: '+1234567890' });
        expect(phoneLink).toHaveAttribute('href', 'tel:+1234567890');
    });

    test('correctly render location link', () => {
        const contactInfoRendered = screen.getByRole('region', { name: /Contact/i });
        const locationLink = within(contactInfoRendered).getByRole('link', { name: 'New York, NY' });
        expect(locationLink).toHaveAttribute('href', 'https://www.google.com/maps/search/?api=1&query=New%20York%2C%20NY');
    });

    test('correctly render website link', () => {
        const contactInfoRendered = screen.getByRole('region', { name: /Contact/i });
        const websiteLink = within(contactInfoRendered).getByRole('link', { name: 'https://example.com' });
        expect(websiteLink).toHaveAttribute('href', 'https://example.com/');
    });

    test('correctly render LinkedIn link', () => {
        const contactInfoRendered = screen.getByRole('region', { name: /Contact/i });
        const linkedinLink = within(contactInfoRendered).getByRole('link', { name: '@example' });
        expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com/in/example');
    });

    test('correctly render GitHub link', () => {
        const contactInfoRendered = screen.getByRole('region', { name: /Contact/i });
        const githubLink = within(contactInfoRendered).getByRole('link', { name: 'example' });
        expect(githubLink).toHaveAttribute('href', 'https://github.com/example');
    });

    test('correctly render age', () => {
        const contactInfoRendered = screen.getByRole('region', { name: /Contact/i });
        const ageItem = within(contactInfoRendered).getByText('30');
        expect(ageItem).toBeInTheDocument();
    });

    test('correctly render nationality', () => {
        const contactInfoRendered = screen.getByRole('region', { name: /Contact/i });
        const nationalityItem = within(contactInfoRendered).getByText('American');
        expect(nationalityItem).toBeInTheDocument();
    });
});

describe("Edge cases", () => {
    beforeEach(() => {
        const contactInfo = {
            linkedin: "linkedin.com/in/example",
            github: "github.com/example",
        };

        render(
            <IntlProvider locale="en" messages={{ resume: { contactInfo: { title: "Contact" } } }}>
                <ContactInfo contactInfo={contactInfo} />
            </IntlProvider>
        );
    });

    afterEach(() => cleanup());

    test('correctly render LinkedIn link', () => {
        const contactInfoRendered = screen.getByRole('region', { name: /Contact/i });
        const linkedinLink = within(contactInfoRendered).getByRole('link', { name: 'linkedin.com/in/example' });
        expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com/in/example');
    });

    test('correctly render GitHub link', () => {
        const contactInfoRendered = screen.getByRole('region', { name: /Contact/i });
        const githubLink = within(contactInfoRendered).getByRole('link', { name: 'github.com/example' });
        expect(githubLink).toHaveAttribute('href', 'https://github.com/example');
    });
});
