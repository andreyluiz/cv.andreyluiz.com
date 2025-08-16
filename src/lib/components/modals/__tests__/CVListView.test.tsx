import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IngestedCV, Variant } from "@/lib/types";
import CVListView from "../CVListView";

// Mock translations
const messages = {
  cvManagement: {
    modal: {
      title: "My CVs",
      ingestNew: "Ingest New CV",
      defaultCV: "Default CV",
      noIngestedCVs: "No ingested CVs yet",
    },
    actions: {
      load: "Load CV",
      edit: "Edit CV",
      delete: "Delete CV",
      confirmDelete: "Are you sure you want to delete this CV?",
      confirmDeleteTitle: "Delete CV",
      confirmDeleteMessage:
        "This action cannot be undone. The CV will be permanently removed from your collection.",
      confirmDeleteButton: "Delete",
      cancelDelete: "Cancel",
    },
  },
};

const mockDefaultCV: Variant = {
  name: "John Doe",
  title: "Software Engineer",
  contactInfo: {
    email: "john@example.com",
    phone: "+1234567890",
    location: "New York, NY",
    website: "johndoe.com",
    linkedin: "linkedin.com/in/johndoe",
    github: "github.com/johndoe",
    age: "30",
    nationality: "American",
  },
  summary: "Experienced software engineer",
  qualities: ["Problem solver"],
  generalSkills: ["JavaScript", "React"],
  skills: [
    {
      domain: "Frontend",
      skills: ["React", "TypeScript"],
    },
  ],
  experience: [
    {
      title: "Senior Developer",
      company: "Tech Corp",
      location: "New York, NY",
      period: { start: "2020-01", end: "2024-01" },
      achievements: ["Built amazing apps"],
      techStack: ["React", "Node.js"],
    },
  ],
  education: [
    {
      degree: "BS Computer Science",
      institution: "University",
      year: "2018",
      location: "New York, NY",
    },
  ],
  certifications: [],
  languages: [{ name: "English", level: "Native" }],
  personalityTraits: ["Creative"],
};

const mockIngestedCV: IngestedCV = {
  id: "test-cv-1",
  title: "My Custom CV",
  rawText: "Raw CV text here...",
  formattedCV: {
    ...mockDefaultCV,
    name: "Jane Smith",
    title: "Senior Developer",
  },
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

const renderWithIntl = (component: React.ReactElement) => {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {component}
    </NextIntlClientProvider>,
  );
};

// No longer using window.confirm - using custom confirmation dialog

describe("CVListView", () => {
  const mockProps = {
    cvs: [],
    defaultCV: mockDefaultCV,
    onLoadCV: vi.fn(),
    onEditCV: vi.fn(),
    onDeleteCV: vi.fn(),
    onIngestNew: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the component with title and ingest button", () => {
    renderWithIntl(<CVListView {...mockProps} />);

    expect(screen.getByText("My CVs")).toBeInTheDocument();
    expect(screen.getByText("Ingest New CV")).toBeInTheDocument();
  });

  it("displays the default CV as first item", () => {
    renderWithIntl(<CVListView {...mockProps} />);

    expect(
      screen.getByText("John Doe - Software Engineer"),
    ).toBeInTheDocument();
    expect(screen.getByText("Default CV")).toBeInTheDocument();
  });

  it("shows no ingested CVs message when list is empty", () => {
    renderWithIntl(<CVListView {...mockProps} />);

    expect(screen.getByText("No ingested CVs yet")).toBeInTheDocument();
  });

  it("displays ingested CVs when available", () => {
    const propsWithCVs = {
      ...mockProps,
      cvs: [mockIngestedCV],
    };

    renderWithIntl(<CVListView {...propsWithCVs} />);

    expect(screen.getByText("My Custom CV")).toBeInTheDocument();
    expect(screen.queryByText("No ingested CVs yet")).not.toBeInTheDocument();
  });

  it("calls onLoadCV when load button is clicked for default CV", () => {
    renderWithIntl(<CVListView {...mockProps} />);

    const loadButton = screen.getAllByLabelText(/Load CV:/)[0];
    fireEvent.click(loadButton);

    expect(mockProps.onLoadCV).toHaveBeenCalledWith(mockDefaultCV);
  });

  it("calls onLoadCV when load button is clicked for ingested CV", () => {
    const propsWithCVs = {
      ...mockProps,
      cvs: [mockIngestedCV],
    };

    renderWithIntl(<CVListView {...propsWithCVs} />);

    const loadButtons = screen.getAllByLabelText(/Load CV:/);
    const ingestedCVLoadButton = loadButtons[1]; // Second button (first is default CV)
    fireEvent.click(ingestedCVLoadButton);

    expect(mockProps.onLoadCV).toHaveBeenCalledWith(mockIngestedCV.formattedCV);
  });

  it("calls onEditCV when edit button is clicked", () => {
    const propsWithCVs = {
      ...mockProps,
      cvs: [mockIngestedCV],
    };

    renderWithIntl(<CVListView {...propsWithCVs} />);

    const editButton = screen.getByLabelText("Edit CV: My Custom CV");
    fireEvent.click(editButton);

    expect(mockProps.onEditCV).toHaveBeenCalledWith(mockIngestedCV);
  });

  it("calls onDeleteCV when delete is confirmed", () => {
    const propsWithCVs = {
      ...mockProps,
      cvs: [mockIngestedCV],
    };

    renderWithIntl(<CVListView {...propsWithCVs} />);

    const deleteButton = screen.getByLabelText("Delete CV: My Custom CV");
    fireEvent.click(deleteButton);

    // Check that confirmation dialog appears
    expect(screen.getByText("Delete CV")).toBeInTheDocument();
    expect(
      screen.getByText(/This action cannot be undone/),
    ).toBeInTheDocument();

    // Click the confirm button
    const confirmButton = screen.getByText("Delete");
    fireEvent.click(confirmButton);

    expect(mockProps.onDeleteCV).toHaveBeenCalledWith("test-cv-1");
  });

  it("does not call onDeleteCV when delete is cancelled", () => {
    const propsWithCVs = {
      ...mockProps,
      cvs: [mockIngestedCV],
    };

    renderWithIntl(<CVListView {...propsWithCVs} />);

    const deleteButton = screen.getByLabelText("Delete CV: My Custom CV");
    fireEvent.click(deleteButton);

    // Check that confirmation dialog appears
    expect(screen.getByText("Delete CV")).toBeInTheDocument();
    expect(
      screen.getByText(/This action cannot be undone/),
    ).toBeInTheDocument();

    // Click the cancel button
    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    expect(mockProps.onDeleteCV).not.toHaveBeenCalled();
  });

  it("calls onIngestNew when ingest button is clicked", () => {
    renderWithIntl(<CVListView {...mockProps} />);

    const ingestButton = screen.getByText("Ingest New CV");
    fireEvent.click(ingestButton);

    expect(mockProps.onIngestNew).toHaveBeenCalled();
  });

  it("does not show edit and delete buttons for default CV", () => {
    renderWithIntl(<CVListView {...mockProps} />);

    // Should only have one load button (for default CV)
    const loadButtons = screen.getAllByLabelText(/Load CV:/);
    expect(loadButtons).toHaveLength(1);

    // Should not have edit or delete buttons for default CV
    expect(screen.queryByLabelText(/Edit CV:/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Delete CV:/)).not.toBeInTheDocument();
  });

  it("shows edit and delete buttons for ingested CVs", () => {
    const propsWithCVs = {
      ...mockProps,
      cvs: [mockIngestedCV],
    };

    renderWithIntl(<CVListView {...propsWithCVs} />);

    expect(screen.getByLabelText("Edit CV: My Custom CV")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Delete CV: My Custom CV"),
    ).toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    const propsWithCVs = {
      ...mockProps,
      cvs: [mockIngestedCV],
    };

    renderWithIntl(<CVListView {...propsWithCVs} />);

    // Check that buttons have proper aria-labels
    expect(
      screen.getByLabelText("Load CV: John Doe - Software Engineer"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Load CV: My Custom CV")).toBeInTheDocument();
    expect(screen.getByLabelText("Edit CV: My Custom CV")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Delete CV: My Custom CV"),
    ).toBeInTheDocument();

    // Check that buttons have proper titles (tooltips)
    const loadButton = screen.getByLabelText("Load CV: My Custom CV");
    expect(loadButton).toHaveAttribute("title", "Load CV");
  });
});
