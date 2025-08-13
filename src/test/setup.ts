import "@testing-library/jest-dom";
import React from "react";
import { vi } from "vitest";

// Make React available globally
global.React = React;

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock environment variables
process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
