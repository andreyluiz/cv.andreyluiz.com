import { render, screen } from "@testing-library/react";
import { useParams } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useStore } from "@/lib/store";
import type { Variant } from "@/lib/types";
import Controls from "../Controls";

// Mock the navigation hooks
vi.mock("next/navigation", () => ({
  useParams: vi.fn(),
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({
    replace: vi.fn(),
  }),
}));

// Mock the store
vi.mock("@/lib/store", () => ({
  useStore: vi.fn(),
}));

// Mock child components that use translations
vi.mock("../ResumeTailor", () => ({
  default: () => <div data-testid="resume-tailor">Resume Tailor</div>,
}));

const mockUseParams = vi.mocked(useParams);
const mockUseStore = vi.mocked(useStore);

const mockMessages = {
  // Add minimal messages needed for the test
  common: {
    loading: "Loading...",
  },
};

const renderWithIntl = (component: React.ReactElement) => {
  return render(
    <NextIntlClientProvider locale="en" messages={mockMessages} timeZone="UTC">
      {component}
    </NextIntlClientProvider>,
  );
};

const mockResumeData: Variant = {
  name: "John Doe",
  title: "Software Developer",
  summary: "Experienced developer",
  qualities: ["Quality 1", "Quality 2"],
  contactInfo: {
    email: "john@example.com",
    phone: "+1234567890",
    location: "City, Country",
    linkedin: "linkedin.com/in/johndoe",
    github: "github.com/johndoe",
    website: "https://johndoe.dev",
    age: "30",
    nationality: "American",
  },
  languages: [{ name: "English", level: "Native" }],
  generalSkills: ["Skill 1", "Skill 2"],
  experience: [],
  skills: [],
  education: [],
  projects: [],
  publications: [],
  certifications: [],
  personalityTraits: [],
};

describe("Controls", () => {
  beforeEach(() => {
    mockUseParams.mockReturnValue({ locale: "en" });
    mockUseStore.mockReturnValue({
      apiKey: "test-key",
      layoutMode: "single",
      setLayoutMode: vi.fn(),
    });
  });

  it("renders LayoutToggle component", () => {
    renderWithIntl(
      <Controls currentResume={mockResumeData} setCurrentResume={vi.fn()} />,
    );

    // Check that the layout toggle button is present
    const layoutToggle = screen.getByRole("button", {
      name: /switch to two column layout/i,
    });
    expect(layoutToggle).toBeInTheDocument();
  });

  it("renders all control components together", () => {
    renderWithIntl(
      <Controls currentResume={mockResumeData} setCurrentResume={vi.fn()} />,
    );

    // Check that all main controls are present
    expect(screen.getByTestId("resume-tailor")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /switch to two column layout/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument(); // Language selector
    expect(
      screen.getByRole("button", { name: /toggle theme/i }),
    ).toBeInTheDocument();
  });

  it("positions LayoutToggle correctly in the control layout", () => {
    renderWithIntl(
      <Controls currentResume={mockResumeData} setCurrentResume={vi.fn()} />,
    );

    const layoutToggle = screen.getByRole("button", {
      name: /switch to two column layout/i,
    });
    const controlsContainer = layoutToggle.closest("div");
    expect(controlsContainer).toHaveClass(
      "flex",
      "items-center",
      "justify-center",
      "gap-2",
    );
  });
});
