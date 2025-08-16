import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import type { Variant } from "@/lib/types";
import LeftColumn from "../LeftColumn";

// Mock the ProfileImage component since it uses Next.js Image
vi.mock("../ProfileImage", () => ({
  default: function MockProfileImage() {
    return <div data-testid="profile-image">Profile Image</div>;
  },
}));

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
  summary: "Experienced software engineer",
  qualities: ["Problem solver", "Team player"],
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
      period: {
        start: "2020",
        end: "Present",
      },
      achievements: ["Built scalable applications"],
      techStack: ["React", "Node.js"],
    },
  ],
  education: [
    {
      degree: "Computer Science",
      institution: "University",
      year: "2018",
      location: "New York, NY",
    },
  ],
  certifications: [],
  languages: [
    {
      name: "English",
      level: "Native",
    },
    {
      name: "Spanish",
      level: "Intermediate",
    },
  ],
  personalityTraits: ["Creative", "Analytical"],
};

const mockMessages = {
  resume: {
    contactInfo: {
      title: "Contact Information",
    },
    languages: {
      title: "Languages",
    },
  },
};

describe("LeftColumn", () => {
  const renderWithIntl = (component: React.ReactElement) => {
    return render(
      <NextIntlClientProvider locale="en" messages={mockMessages}>
        {component}
      </NextIntlClientProvider>,
    );
  };

  it("renders all required components", () => {
    renderWithIntl(<LeftColumn resumeData={mockResumeData} />);

    // Check that ProfileImage is rendered
    expect(screen.getByTestId("profile-image")).toBeInTheDocument();

    // Check that ContactInfo section is rendered
    expect(screen.getByText("Contact Information")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("New York, NY")).toBeInTheDocument();

    // Check that Languages section is rendered
    expect(screen.getByText("Languages")).toBeInTheDocument();
    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("Spanish")).toBeInTheDocument();
  });

  it("applies correct CSS classes for layout", () => {
    const { container } = renderWithIntl(
      <LeftColumn resumeData={mockResumeData} />,
    );

    const leftColumnElement = container.firstChild as HTMLElement;
    expect(leftColumnElement).toHaveClass("flex", "flex-col", "gap-6");
  });

  it("accepts and applies custom className", () => {
    const customClass = "custom-left-column";
    const { container } = renderWithIntl(
      <LeftColumn resumeData={mockResumeData} className={customClass} />,
    );

    const leftColumnElement = container.firstChild as HTMLElement;
    expect(leftColumnElement).toHaveClass(customClass);
  });

  it("centers the profile image", () => {
    const { container } = renderWithIntl(
      <LeftColumn resumeData={mockResumeData} />,
    );

    const profileImageContainer = container.querySelector(
      ".flex.justify-center",
    );
    expect(profileImageContainer).toBeInTheDocument();
    expect(profileImageContainer).toContainElement(
      screen.getByTestId("profile-image"),
    );
  });

  it("renders with proper vertical spacing", () => {
    const { container } = renderWithIntl(
      <LeftColumn resumeData={mockResumeData} />,
    );

    const leftColumnElement = container.firstChild as HTMLElement;
    expect(leftColumnElement).toHaveClass("gap-6");
  });
});
