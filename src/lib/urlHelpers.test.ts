import { describe, expect, test } from 'bun:test';
import { buildHref } from './urlHelpers';

describe('buildHref', () => {
    describe('email', () => {
        test('should build a valid mailto:', () => {
            const href = buildHref("email", "test@example.com")
            expect(href).toBe('mailto:test@example.com')
        });

        test('should not duplicate the mailto: scheme', () => {
            const href = buildHref("email", "mailto:test@example.com")
            expect(href).toBe('mailto:test@example.com')
        });
    });

    describe('github', () => {
        test('should build a valid github URL given username/repo', () => {
            const href = buildHref("github", "username/repo")
            expect(href).toBe('https://github.com/username/repo')
        });

        test('should build a valid github URL given username', () => {
            const href = buildHref("github", "username")
            expect(href).toBe('https://github.com/username')
        });

        test('should build a valid github URL given invalid input', () => {
            const href = buildHref("github", "invalid-input")
            expect(href).toBe('https://github.com/invalid-input')
        });

        test('should build a valid github URL given a full URL', () => {
            const href = buildHref("github", "https://github.com/username")
            expect(href).toBe('https://github.com/username')
        });

        test('should build a valid github URL given a partial URL', () => {
            const href = buildHref("github", "github.com/username")
            expect(href).toBe('https://github.com/username')
        });

        test('should trim trailing slashes', () => {
            const href = buildHref("github", "https://github.com/username/")
            expect(href).toBe('https://github.com/username')
        });
    });

    describe('location', () => {
        test('should build a valid location URL', () => {
            const href = buildHref("location", "1600 Amphitheatre Parkway, Mountain View, CA")
            expect(href).toBe('https://maps.google.com/?q=1600%20Amphitheatre%20Parkway%2C%20Mountain%20View%2C%20CA')
        });
    });

    describe('phone', () => {
        test('should build a valid tel:', () => {
            const href = buildHref("phone", "+1234567890")
            expect(href).toBe('tel:+1234567890')
        });

        test('should not duplicate the tel: scheme', () => {
            const href = buildHref("phone", "tel:+1234567890")
            expect(href).toBe('tel:+1234567890')
        });
    });

    describe('website', () => {
        test('should build a valid website URL', () => {
            const href = buildHref("website", "example.com")
            expect(href).toBe('https://example.com')
        });
    });
});
