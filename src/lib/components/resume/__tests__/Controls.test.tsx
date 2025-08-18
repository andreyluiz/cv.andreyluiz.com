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

// Mock the server actions
vi.mock("@/lib/server/actions", () => ({
  ingestCV: vi.fn(),
}));

// Mock the resume data files
vi.mock("@/lib/server/resume-en.json", () => ({
  default: { name: "Test User", title: "Test Title" },
}));

vi.mock("@/lib/server/resume-fr.json", () => ({
  default: { name: "Test User", title: "Test Title" },
}));

vi.mock("@/lib/server/resume-pt.json", () => ({
  default: { name: "Test User", title: "Test Title" },
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
  cvManagement: {
    button: {
      myCVs: "My CVs",
    },
    modal: {
      title: "My CVs",
      ingestNew: "Ingest New CV",
      defaultCV: "Default CV",
      noIngestedCVs: "No ingested CVs yet",
    },
    form: {
      title: "CV Title",
      titlePlaceholder: "Enter a name for this CV",
      rawText: "Raw CV Text",
      rawTextPlaceholder: "Paste your CV text here...",
      submit: "Process CV",
      cancel: "Cancel",
      processing: "Processing CV...",
      ingestTitle: "Ingest New CV",
      editTitle: "Edit CV",
      processingDescription: "Please wait while we format your CV using AI.",
    },
    actions: {
      load: "Load CV",
      edit: "Edit CV",
      delete: "Delete CV",
      confirmDelete: "Are you sure you want to delete this CV?",
      confirmDeleteTitle: "Delete CV",
      confirmDeleteMessage: "This action cannot be undone.",
      confirmDeleteButton: "Delete",
      cancelDelete: "Cancel",
    },
    errors: {
      titleRequired: "CV title is required",
      titleTooLong: "CV title must be less than 100 characters",
      rawTextRequired: "CV text is required",
      rawTextTooShort: "CV text must be at least 50 characters",
      rawTextTooLong: "CV text must be less than 50,000 characters",
      processingFailed: "Failed to process CV",
      storageError: "Failed to save CV",
      apiKeyRequired: "API key is required",
    },
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
      ingestedCVs: [],
      selectedModel: "test-model",
      addIngestedCV: vi.fn(),
      updateIngestedCV: vi.fn(),
      deleteIngestedCV: vi.fn(),
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
    expect(screen.getByRole("button", { name: /my cvs/i })).toBeInTheDocument();
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
    );
  });
});
