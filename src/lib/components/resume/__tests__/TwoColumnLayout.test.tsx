import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import type { Variant } from "@/lib/types";
import TwoColumnLayout from "../TwoColumnLayout";

const mockMessages = {
  resume: {
    contactInfo: {
      title: "Contact Info",
    },
    languages: {
      title: "Languages",
    },
    generalSkills: {
      title: "Main Skills",
    },
    experience: {
      title: "Professional Experience",
      tech_stack: "Tech Stack",
      hideBullets: "Hide details",
    },
    skills: {
      title: "Technical Skills",
    },
    education: {
      title: "Education & Certifications",
    },
    projects: {
      title: "Projects",
      tech_stack: "Tech Stack",
    },
    publications: {
      title: "Publications",
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
  title: "Software Engineer",
  contactInfo: {
    email: "john@example.com",
    phone: "+1234567890",
    location: "New York, NY",
    website: "https://johndoe.com",
    linkedin: "https://linkedin.com/in/johndoe",
    github: "https://github.com/johndoe",
    age: "30",
    nationality: "American",
  },
  summary: "Experienced developer with expertise in React and TypeScript.",
  qualities: ["Problem Solver", "Team Player", "Innovation Focused"],
  generalSkills: ["React", "TypeScript", "Node.js"],
  skills: [
    {
      domain: "Frontend",
      skills: ["React", "TypeScript", "CSS"],
    },
  ],
  experience: [
    {
      title: "Senior Developer",
      company: "Tech Corp",
      location: "New York, NY",
      period: { start: "2020", end: "2024" },
      achievements: ["Built scalable applications"],
      techStack: ["React", "TypeScript"],
    },
  ],
  projects: [
    {
      name: "Project Alpha",
      description: "A web application",
      techStack: ["React", "Node.js"],
      period: { start: "2023", end: "2024" },
    },
  ],
  education: [
    {
      degree: "BS Computer Science",
      institution: "University of Tech",
      year: "2018",
      location: "New York, NY",
    },
  ],
  certifications: [
    {
      degree: "AWS Certified",
      institution: "Amazon",
      year: "2022",
      location: "Online",
    },
  ],
  languages: [
    { name: "English", level: "Native" },
    { name: "Spanish", level: "Intermediate" },
  ],
  publications: [
    {
      title: "Modern Web Development",
      location: "Tech Journal",
      url: "https://example.com/article",
    },
  ],
  personalityTraits: ["Analytical", "Creative"],
};

describe("TwoColumnLayout", () => {
  it("should render with proper grid structure", () => {
    const { container } = renderWithIntl(
      <TwoColumnLayout resumeData={mockResumeData} />,
    );

    // Check that the main container has the correct grid classes
    const gridContainer = container.firstChild as HTMLElement;
    expect(gridContainer).toHaveClass("grid");
    expect(gridContainer).toHaveClass("grid-cols-1");
    expect(gridContainer).toHaveClass("md:grid-cols-[minmax(200px,1fr)_2fr]");
    expect(gridContainer).toHaveClass("gap-6");
    expect(gridContainer).toHaveClass("md:gap-8");
    expect(gridContainer).toHaveClass("items-start");
  });

  it("should render left column components", () => {
    renderWithIntl(<TwoColumnLayout resumeData={mockResumeData} />);

    // Check for contact info in left column
    expect(screen.getByText("john@example.com")).toBeInTheDocument();

    // Check for languages in left column
    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("Spanish")).toBeInTheDocument();
  });

  it("should render right column components", () => {
    renderWithIntl(<TwoColumnLayout resumeData={mockResumeData} />);

    // Check for header content in right column
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();

    // Check for experience in right column
    expect(screen.getByText("Senior Developer")).toBeInTheDocument();
    // Use a more flexible text matcher for company name
    expect(screen.getByText(/Tech Corp/)).toBeInTheDocument();
  });

  it("should include print-specific classes", () => {
    const { container } = renderWithIntl(
      <TwoColumnLayout resumeData={mockResumeData} />,
    );

    const gridContainer = container.firstChild as HTMLElement;
    expect(gridContainer).toHaveClass("print:grid-cols-[1fr_2fr]");
    expect(gridContainer).toHaveClass("print:gap-4");
  });

  it("should include touch-friendly classes for mobile", () => {
    const { container } = renderWithIntl(
      <TwoColumnLayout resumeData={mockResumeData} />,
    );

    const gridContainer = container.firstChild as HTMLElement;
    expect(gridContainer).toHaveClass("touch-pan-y");
  });

  it("should have proper responsive column structure", () => {
    const { container } = renderWithIntl(
      <TwoColumnLayout resumeData={mockResumeData} />,
    );

    const gridContainer = container.firstChild as HTMLElement;
    // Should be single column on mobile (default)
    expect(gridContainer).toHaveClass("grid-cols-1");
    // Should be two columns on medium screens and up
    expect(gridContainer).toHaveClass("md:grid-cols-[minmax(200px,1fr)_2fr]");
  });

  it("should prevent content overflow with min-width classes", () => {
    const { container } = renderWithIntl(
      <TwoColumnLayout resumeData={mockResumeData} />,
    );

    // Get the main grid container
    const gridContainer = container.firstChild as HTMLElement;

    // Get the direct children of the grid (the two main columns)
    const columns = gridContainer.querySelectorAll(":scope > .flex.flex-col");
    expect(columns).toHaveLength(2);

    // Both columns should have min-w-0 to prevent overflow
    columns.forEach((column) => {
      expect(column).toHaveClass("min-w-0");
    });
  });
});
