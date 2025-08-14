import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("Locale-specific Date Formatting", () => {
  beforeEach(() => {
    // Mock the current date to have consistent test results
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T10:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should format dates correctly for English locale", () => {
    const currentDate = new Date();
    const formattedDate = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
    }).format(currentDate);

    expect(formattedDate).toBe("January 2024");
  });

  it("should format dates correctly for French locale", () => {
    const currentDate = new Date();
    const formattedDate = new Intl.DateTimeFormat("fr", {
      year: "numeric",
      month: "long",
    }).format(currentDate);

    expect(formattedDate).toBe("janvier 2024");
  });

  it("should format dates correctly for Portuguese locale", () => {
    const currentDate = new Date();
    const formattedDate = new Intl.DateTimeFormat("pt", {
      year: "numeric",
      month: "long",
    }).format(currentDate);

    expect(formattedDate).toBe("janeiro de 2024");
  });

  it("should handle locale mapping correctly", () => {
    const currentDate = new Date();
    
    // Test English locale mapping
    const englishDate = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
    }).format(currentDate);

    // Test direct locale usage for non-English languages
    const frenchDate = new Intl.DateTimeFormat("fr", {
      year: "numeric",
      month: "long",
    }).format(currentDate);

    const portugueseDate = new Intl.DateTimeFormat("pt", {
      year: "numeric",
      month: "long",
    }).format(currentDate);

    expect(englishDate).toBe("January 2024");
    expect(frenchDate).toBe("janvier 2024");
    expect(portugueseDate).toBe("janeiro de 2024");
  });

  it("should format dates differently across locales for the same date", () => {
    const currentDate = new Date();

    const formats = {
      en: new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
      }).format(currentDate),
      fr: new Intl.DateTimeFormat("fr", {
        year: "numeric",
        month: "long",
      }).format(currentDate),
      pt: new Intl.DateTimeFormat("pt", {
        year: "numeric",
        month: "long",
      }).format(currentDate),
    };

    // All should be different (locale-specific)
    expect(formats.en).not.toBe(formats.fr);
    expect(formats.en).not.toBe(formats.pt);
    expect(formats.fr).not.toBe(formats.pt);

    // Verify specific formats
    expect(formats.en).toBe("January 2024");
    expect(formats.fr).toBe("janvier 2024");
    expect(formats.pt).toBe("janeiro de 2024");
  });

  it("should handle edge cases for different months", () => {
    // Test with different months
    const testCases = [
      { date: new Date("2024-03-15"), expected: { en: "March 2024", fr: "mars 2024", pt: "março de 2024" } },
      { date: new Date("2024-07-15"), expected: { en: "July 2024", fr: "juillet 2024", pt: "julho de 2024" } },
      { date: new Date("2024-12-15"), expected: { en: "December 2024", fr: "décembre 2024", pt: "dezembro de 2024" } }
    ];

    testCases.forEach(({ date, expected }) => {
      const enFormat = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
      }).format(date);

      const frFormat = new Intl.DateTimeFormat("fr", {
        year: "numeric",
        month: "long",
      }).format(date);

      const ptFormat = new Intl.DateTimeFormat("pt", {
        year: "numeric",
        month: "long",
      }).format(date);

      expect(enFormat).toBe(expected.en);
      expect(frFormat).toBe(expected.fr);
      expect(ptFormat).toBe(expected.pt);
    });
  });
});