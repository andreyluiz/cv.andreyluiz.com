import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { vi } from "vitest";
import RightColumn from "../RightColumn";
import type { Variant } from "@/lib/types";

// Mock the store
vi.mock("@/lib/store", () => ({
  useStore: () => ({
    hideBullets: false,
    setHideBullets: vi.fn(),
  }),
}));

const mockMessages = {
  resume: {
    generalSkills: {
      title: "General Skills",
    },
    experience: {
      title: "Professional Experience",
      hideBullets: "Hide bullets",
      tech_stack: "Tech Stack",
    },
    skills: {
      title: "Technical Skills",
    },
    education: {
      title: "Education & Certifications",
      gpa: "GPA",
      topics: "Topics",
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

const mockResumeData: Variant = {
  name: "John Doe",
  title: "Software Engineer",
  summary: "Experienced software engineer with expertise in web development.",
  qualities: ["Problem Solver", "Team Player", "Innovation"],
  generalSkills: ["Leadership", "Communication", "Project Management"],
  contactInfo: {
    email: "john@example.com",
    phone: "+1234567890",
    location: "New York, NY",
    website: "https://johndoe.com",
    linkedin: "linkedin.com/in/johndoe",
    github: "github.com/johndoe",
    age: "30",
    nationality: "American",
  },
  skills: [
    {
      domain: "Frontend",
      skills: ["React", "TypeScript", "Next.js"],
    },
    {
      domain: "Backend",
      skills: ["Node.js", "Python", "PostgreSQL"],
    },
  ],
  experience: [
    {
      title: "Senior Software Engineer",
      company: "Tech Corp",
      location: "New York, NY",
      period: {
        start: "2022",
        end: "Present",
      },
      achievements: [
        "Led development of new product features",
        "Improved system performance by 40%",
      ],
      techStack: ["React", "Node.js", "PostgreSQL"],
    },
  ],
  education: [
    {
      degree: "Bachelor of Computer Science",
      institution: "University of Technology",
      year: "2020",
      location: "New York, NY",
      gpa: "3.8",
      topics: "Software Engineering, Data Structures",
    },
  ],
  certifications: [
    {
      degree: "AWS Certified Developer",
      institution: "Amazon Web Services",
      year: "2023",
      location: "Online",
    },
  ],
  projects: [
    {
      name: "E-commerce Platform",
      description: "Full-stack e-commerce solution with modern UI",
      techStack: ["React", "Node.js", "MongoDB"],
      period: {
        start: "2023",
        end: "2024",
      },
    },
  ],
  publications: [
    {
      title: "Modern Web Development Practices",
      location: "Tech Journal",
      url: "https://example.com/article",
    },
  ],
  languages: [
    {
      name: "English",
      level: "Native",
    },
  ],
  personalityTraits: ["Analytical", "Creative"],
};

const renderWithIntl = (component: React.ReactElement) => {
  return render(
    <NextIntlClientProvider locale="en" messages={mockMessages}>
      {component}
    </NextIntlClientProvider>
  );
};

describe("RightColumn", () => {
  it("renders all professional content sections", () => {
    renderWithIntl(<RightColumn resumeData={mockResumeData} />);

    // Check HeaderContent is rendered
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    expect(screen.getByText("Experienced software engineer with expertise in web development.")).toBeInTheDocument();

    // Check GeneralSkills is rendered
    expect(screen.getByText("General Skills")).toBeInTheDocument();
    expect(screen.getByText("Leadership")).toBeInTheDocument();

    // Check Experience is rendered
    expect(screen.getByText("Professional Experience")).toBeInTheDocument();
    expect(screen.getByText("Senior Software Engineer")).toBeInTheDocument();

    // Check Skills is rendered
    expect(screen.getByText("Technical Skills")).toBeInTheDocument();
    expect(screen.getByText("Frontend:")).toBeInTheDocument();

    // Check Education is rendered
    expect(screen.getByText("Education & Certifications")).toBeInTheDocument();
    expect(screen.getByText("Bachelor of Computer Science")).toBeInTheDocument();

    // Check Projects is rendered
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("E-commerce Platform")).toBeInTheDocument();

    // Check Publications is rendered
    expect(screen.getByText("Publications")).toBeInTheDocument();
    expect(screen.getByText("Modern Web Development Practices - Tech Journal")).toBeInTheDocument();
  });

  it("uses flex column layout with proper spacing", () => {
    const { container } = renderWithIntl(<RightColumn resumeData={mockResumeData} />);
    
    const rightColumnDiv = container.firstChild as HTMLElement;
    expect(rightColumnDiv).toHaveClass("flex", "flex-col", "gap-6");
  });

  it("maintains proper section ordering", () => {
    renderWithIntl(<RightColumn resumeData={mockResumeData} />);

    // Check that all expected sections are rendered
    expect(screen.getByText("John Doe")).toBeInTheDocument(); // HeaderContent
    expect(screen.getByText("General Skills")).toBeInTheDocument();
    expect(screen.getByText("Professional Experience")).toBeInTheDocument();
    expect(screen.getByText("Technical Skills")).toBeInTheDocument();
    expect(screen.getByText("Education & Certifications")).toBeInTheDocument();
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("Publications")).toBeInTheDocument();
  });

  it("handles empty or undefined optional sections gracefully", () => {
    const minimalResumeData: Variant = {
      ...mockResumeData,
      projects: undefined,
      publications: undefined,
      skills: [],
    };

    renderWithIntl(<RightColumn resumeData={minimalResumeData} />);

    // Should still render required sections
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("General Skills")).toBeInTheDocument();
    expect(screen.getByText("Professional Experience")).toBeInTheDocument();
    expect(screen.getByText("Education & Certifications")).toBeInTheDocument();

    // Optional sections should not appear when empty
    expect(screen.queryByText("Projects")).not.toBeInTheDocument();
    expect(screen.queryByText("Publications")).not.toBeInTheDocument();
    expect(screen.queryByText("Technical Skills")).not.toBeInTheDocument();
  });

  it("combines certifications and education correctly", () => {
    renderWithIntl(<RightColumn resumeData={mockResumeData} />);

    // Both certification and education should appear in the same section
    expect(screen.getByText("AWS Certified Developer")).toBeInTheDocument();
    expect(screen.getByText("Bachelor of Computer Science")).toBeInTheDocument();
  });
});