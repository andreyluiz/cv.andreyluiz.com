import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useStore } from "@/lib/store";
import type { CoverLetterInputs, Variant } from "@/lib/types";
import CoverLetterDisplay from "../CoverLetterDisplay";
import CoverLetterInputForm from "../CoverLetterInputForm";
import CoverLetterModal from "../CoverLetterModal";

// Mock the store
vi.mock("@/lib/store");

// Mock server actions
vi.mock("@/lib/server/actions", () => ({
  generateCoverLetter: vi.fn(),
}));

// Mock Next.js navigation hooks
vi.mock("next/navigation", () => ({
  useParams: () => ({ locale: "en" }),
}));

const englishMessages = {
  coverLetter: {
    form: {
      optional: "optional",
      generating: "Generating...",
      generate: "Generate Cover Letter",
      infoBox: {
        title: "Spontaneous Application",
        description:
          "Leave job title and job description empty to create a spontaneous application cover letter that focuses on your interest in the company.",
      },
      jobPosition: {
        label: "Job Position",
        placeholder: "e.g., Senior Software Engineer",
      },
      companyDescription: {
        label: "Company Description",
        placeholder:
          "Tell us about the company, its mission, values, products, or what interests you about working there...",
      },
      jobDescription: {
        label: "Job Description",
        placeholder:
          "Paste the job description here or describe the role requirements...",
      },
      validation: {
        companyDescriptionRequired:
          "Company description is required to generate a personalized cover letter.",
      },
    },
    display: {
      regenerate: "Regenerate",
    },
    modal: {
      titles: {
        input: "Generate Cover Letter",
        generating: "Generating Cover Letter",
        display: "Cover Letter",
        error: "Generation Failed",
        default: "Cover Letter",
      },
      generating: {
        message: "Creating your personalized cover letter...",
        subtitle: "This may take a few moments",
      },
      error: {
        title: "Something went wrong",
      },
      errors: {
        generationFailed: "Failed to generate cover letter. Please try again.",
        apiError:
          "Failed to generate cover letter. Please check your API key and selected model, then try again.",
      },
      actions: {
        editInputs: "Edit Inputs",
        close: "Close",
        retry: "Try Again",
        cancel: "Cancel",
      },
    },
  },
};

const frenchMessages = {
  coverLetter: {
    form: {
      optional: "optionnel",
      generating: "Génération...",
      generate: "Générer la Lettre de Motivation",
      infoBox: {
        title: "Candidature Spontanée",
        description:
          "Laissez le titre du poste et la description du poste vides pour créer une lettre de motivation de candidature spontanée qui se concentre sur votre intérêt pour l'entreprise.",
      },
      jobPosition: {
        label: "Poste Visé",
        placeholder: "ex. Ingénieur Logiciel Senior",
      },
      companyDescription: {
        label: "Description de l'Entreprise",
        placeholder:
          "Parlez-nous de l'entreprise, sa mission, ses valeurs, ses produits, ou ce qui vous intéresse dans le fait d'y travailler...",
      },
      jobDescription: {
        label: "Description du Poste",
        placeholder:
          "Collez la description du poste ici ou décrivez les exigences du rôle...",
      },
      validation: {
        companyDescriptionRequired:
          "La description de l'entreprise est requise pour générer une lettre de motivation personnalisée.",
      },
    },
    display: {
      regenerate: "Régénérer",
    },
    modal: {
      titles: {
        input: "Générer une Lettre de Motivation",
        generating: "Génération de la Lettre de Motivation",
        display: "Lettre de Motivation",
        error: "Échec de la Génération",
        default: "Lettre de Motivation",
      },
      generating: {
        message: "Création de votre lettre de motivation personnalisée...",
        subtitle: "Cela peut prendre quelques instants",
      },
      error: {
        title: "Quelque chose s'est mal passé",
      },
      errors: {
        generationFailed:
          "Échec de la génération de la lettre de motivation. Veuillez réessayer.",
        apiError:
          "Échec de la génération de la lettre de motivation. Veuillez vérifier votre clé API et le modèle sélectionné, puis réessayer.",
      },
      actions: {
        editInputs: "Modifier les Entrées",
        close: "Fermer",
        retry: "Réessayer",
        cancel: "Annuler",
      },
    },
  },
};

const portugueseMessages = {
  coverLetter: {
    form: {
      optional: "opcional",
      generating: "Gerando...",
      generate: "Gerar Carta de Apresentação",
      infoBox: {
        title: "Candidatura Espontânea",
        description:
          "Deixe o título do cargo e a descrição do cargo em branco para criar uma carta de apresentação de candidatura espontânea que foca no seu interesse pela empresa.",
      },
      jobPosition: {
        label: "Cargo Pretendido",
        placeholder: "ex. Engenheiro de Software Sênior",
      },
      companyDescription: {
        label: "Descrição da Empresa",
        placeholder:
          "Conte-nos sobre a empresa, sua missão, valores, produtos, ou o que te interessa em trabalhar lá...",
      },
      jobDescription: {
        label: "Descrição do Cargo",
        placeholder:
          "Cole a descrição do cargo aqui ou descreva os requisitos da função...",
      },
      validation: {
        companyDescriptionRequired:
          "A descrição da empresa é obrigatória para gerar uma carta de apresentação personalizada.",
      },
    },
    display: {
      regenerate: "Gerar Novamente",
    },
    modal: {
      titles: {
        input: "Gerar Carta de Apresentação",
        generating: "Gerando Carta de Apresentação",
        display: "Carta de Apresentação",
        error: "Falha na Geração",
        default: "Carta de Apresentação",
      },
      generating: {
        message: "Criando sua carta de apresentação personalizada...",
        subtitle: "Isso pode levar alguns momentos",
      },
      error: {
        title: "Algo deu errado",
      },
      errors: {
        generationFailed:
          "Falha ao gerar carta de apresentação. Por favor, tente novamente.",
        apiError:
          "Falha ao gerar carta de apresentação. Por favor, verifique sua chave da API e modelo selecionado, então tente novamente.",
      },
      actions: {
        editInputs: "Editar Entradas",
        close: "Fechar",
        retry: "Tentar Novamente",
        cancel: "Cancelar",
      },
    },
  },
};

const renderWithLocale = (
  component: React.ReactElement,
  locale: string,
  messages: any,
) => {
  return render(
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
      {component}
    </NextIntlClientProvider>,
  );
};

describe("Cover Letter Internationalization", () => {
  const mockOnSubmit = vi.fn();
  const mockOnRegenerate = vi.fn();
  const mockOnClose = vi.fn();
  const mockedUseStore = vi.mocked(useStore);

  const defaultResumeData: Variant = {
    name: "John Doe",
    title: "Software Engineer",
    contactInfo: {
      email: "john@example.com",
      phone: "+1234567890",
      location: "City, Country",
      website: "https://johndoe.dev",
      linkedin: "linkedin.com/in/johndoe",
      github: "github.com/johndoe",
      age: "30",
      nationality: "American",
      permit: "US Citizen",
    },
    summary: "Experienced software engineer",
    qualities: ["Problem-solving"],
    generalSkills: ["JavaScript", "Python"],
    skills: [
      {
        domain: "Programming",
        skills: ["JavaScript", "TypeScript"],
      },
    ],
    experience: [
      {
        title: "Software Engineer",
        company: "Tech Corp",
        location: "San Francisco, CA",
        period: { start: "2020", end: "Present" },
        achievements: ["Built web applications"],
        techStack: ["React", "Node.js"],
      },
    ],
    projects: [
      {
        name: "Project A",
        description: "A web application",
        techStack: ["React"],
        period: { start: "2023", end: "2024" },
      },
    ],
    education: [
      {
        degree: "CS",
        institution: "University",
        year: "2020",
        location: "CA",
      },
    ],
    certifications: [],
    languages: [
      {
        name: "English",
        level: "Native",
      },
    ],
    publications: [],
    personalityTraits: ["Analytical"],
  };

  const mockInputs: CoverLetterInputs = {
    jobPosition: "Software Engineer",
    companyDescription: "Tech company",
    jobDescription: "Developer role",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseStore.mockReturnValue({
      generatedCoverLetter: null,
      coverLetterInputs: null,
      setCoverLetter: vi.fn(),
    });
  });

  describe("CoverLetterInputForm Internationalization", () => {
    it("should render form in English", () => {
      renderWithLocale(
        <CoverLetterInputForm
          initialInputs={null}
          onSubmit={mockOnSubmit}
          isLoading={false}
        />,
        "en",
        englishMessages,
      );

      expect(screen.getByText("Spontaneous Application")).toBeInTheDocument();
      expect(screen.getByText("Job Position")).toBeInTheDocument();
      expect(screen.getByText("Company Description")).toBeInTheDocument();
      expect(screen.getByText("Job Description")).toBeInTheDocument();
      expect(screen.getByText("Generate Cover Letter")).toBeInTheDocument();
      expect(screen.getAllByText(/optional/)).toHaveLength(2);
    });

    it("should render form in French", () => {
      renderWithLocale(
        <CoverLetterInputForm
          initialInputs={null}
          onSubmit={mockOnSubmit}
          isLoading={false}
        />,
        "fr",
        frenchMessages,
      );

      expect(screen.getByText("Candidature Spontanée")).toBeInTheDocument();
      expect(screen.getByText("Poste Visé")).toBeInTheDocument();
      expect(
        screen.getByText("Description de l'Entreprise"),
      ).toBeInTheDocument();
      expect(screen.getByText("Description du Poste")).toBeInTheDocument();
      expect(
        screen.getByText("Générer la Lettre de Motivation"),
      ).toBeInTheDocument();
      expect(screen.getAllByText(/optionnel/)).toHaveLength(2);
    });

    it("should render form in Portuguese", () => {
      renderWithLocale(
        <CoverLetterInputForm
          initialInputs={null}
          onSubmit={mockOnSubmit}
          isLoading={false}
        />,
        "pt",
        portugueseMessages,
      );

      expect(screen.getByText("Candidatura Espontânea")).toBeInTheDocument();
      expect(screen.getByText("Cargo Pretendido")).toBeInTheDocument();
      expect(screen.getByText("Descrição da Empresa")).toBeInTheDocument();
      expect(screen.getByText("Descrição do Cargo")).toBeInTheDocument();
      expect(
        screen.getByText("Gerar Carta de Apresentação"),
      ).toBeInTheDocument();
      expect(screen.getAllByText(/opcional/)).toHaveLength(2);
    });

    it("should show validation message in the correct language", async () => {
      const user = userEvent.setup();

      // Test English validation
      const { unmount } = renderWithLocale(
        <CoverLetterInputForm
          initialInputs={null}
          onSubmit={mockOnSubmit}
          isLoading={false}
        />,
        "en",
        englishMessages,
      );

      const submitButton = screen.getByText("Generate Cover Letter");
      await user.click(submitButton);

      expect(
        screen.getByText(
          "Company description is required to generate a personalized cover letter.",
        ),
      ).toBeInTheDocument();
      unmount();

      // Test French validation
      const { unmount: unmountFr } = renderWithLocale(
        <CoverLetterInputForm
          initialInputs={null}
          onSubmit={mockOnSubmit}
          isLoading={false}
        />,
        "fr",
        frenchMessages,
      );

      const submitButtonFr = screen.getByText(
        "Générer la Lettre de Motivation",
      );
      await user.click(submitButtonFr);

      expect(
        screen.getByText(
          "La description de l'entreprise est requise pour générer une lettre de motivation personnalisée.",
        ),
      ).toBeInTheDocument();
      unmountFr();

      // Test Portuguese validation
      renderWithLocale(
        <CoverLetterInputForm
          initialInputs={null}
          onSubmit={mockOnSubmit}
          isLoading={false}
        />,
        "pt",
        portugueseMessages,
      );

      const submitButtonPt = screen.getByText("Gerar Carta de Apresentação");
      await user.click(submitButtonPt);

      expect(
        screen.getByText(
          "A descrição da empresa é obrigatória para gerar uma carta de apresentação personalizada.",
        ),
      ).toBeInTheDocument();
    });

    it("should show loading state in the correct language", () => {
      // Test English loading
      const { unmount } = renderWithLocale(
        <CoverLetterInputForm
          initialInputs={null}
          onSubmit={mockOnSubmit}
          isLoading={true}
        />,
        "en",
        englishMessages,
      );

      expect(screen.getByText("Generating...")).toBeInTheDocument();
      unmount();

      // Test French loading
      const { unmount: unmountFr } = renderWithLocale(
        <CoverLetterInputForm
          initialInputs={null}
          onSubmit={mockOnSubmit}
          isLoading={true}
        />,
        "fr",
        frenchMessages,
      );

      expect(screen.getByText("Génération...")).toBeInTheDocument();
      unmountFr();

      // Test Portuguese loading
      renderWithLocale(
        <CoverLetterInputForm
          initialInputs={null}
          onSubmit={mockOnSubmit}
          isLoading={true}
        />,
        "pt",
        portugueseMessages,
      );

      expect(screen.getByText("Gerando...")).toBeInTheDocument();
    });
  });

  describe("CoverLetterDisplay Internationalization", () => {
    it("should render regenerate button in English", () => {
      renderWithLocale(
        <CoverLetterDisplay
          content="Sample cover letter content"
          inputs={mockInputs}
          onRegenerate={mockOnRegenerate}
        />,
        "en",
        englishMessages,
      );

      expect(screen.getByText("Regenerate")).toBeInTheDocument();
    });

    it("should render regenerate button in French", () => {
      renderWithLocale(
        <CoverLetterDisplay
          content="Sample cover letter content"
          inputs={mockInputs}
          onRegenerate={mockOnRegenerate}
        />,
        "fr",
        frenchMessages,
      );

      expect(screen.getByText("Régénérer")).toBeInTheDocument();
    });

    it("should render regenerate button in Portuguese", () => {
      renderWithLocale(
        <CoverLetterDisplay
          content="Sample cover letter content"
          inputs={mockInputs}
          onRegenerate={mockOnRegenerate}
        />,
        "pt",
        portugueseMessages,
      );

      expect(screen.getByText("Gerar Novamente")).toBeInTheDocument();
    });
  });

  describe("CoverLetterModal Internationalization", () => {
    const defaultModalProps = {
      isOpen: true,
      onClose: mockOnClose,
      resumeData: defaultResumeData,
      apiKey: "test-api-key",
      selectedModel: "test-model",
    };

    it("should render modal titles in English", () => {
      renderWithLocale(
        <CoverLetterModal {...defaultModalProps} />,
        "en",
        englishMessages,
      );

      expect(
        screen.getByRole("heading", { name: "Generate Cover Letter" }),
      ).toBeInTheDocument();
    });

    it("should render modal titles in French", () => {
      renderWithLocale(
        <CoverLetterModal {...defaultModalProps} />,
        "fr",
        frenchMessages,
      );

      expect(
        screen.getByRole("heading", {
          name: "Générer une Lettre de Motivation",
        }),
      ).toBeInTheDocument();
    });

    it("should render modal titles in Portuguese", () => {
      renderWithLocale(
        <CoverLetterModal {...defaultModalProps} />,
        "pt",
        portugueseMessages,
      );

      expect(
        screen.getByRole("heading", { name: "Gerar Carta de Apresentação" }),
      ).toBeInTheDocument();
    });

    it("should show different phase titles correctly across languages", () => {
      // Test display phase with existing cover letter
      mockedUseStore.mockReturnValue({
        generatedCoverLetter: "Existing cover letter",
        coverLetterInputs: mockInputs,
        setCoverLetter: vi.fn(),
      });

      const { unmount } = renderWithLocale(
        <CoverLetterModal {...defaultModalProps} />,
        "en",
        englishMessages,
      );

      expect(screen.getByText("Cover Letter")).toBeInTheDocument();
      unmount();

      const { unmount: unmountFr } = renderWithLocale(
        <CoverLetterModal {...defaultModalProps} />,
        "fr",
        frenchMessages,
      );

      expect(screen.getByText("Lettre de Motivation")).toBeInTheDocument();
      unmountFr();

      renderWithLocale(
        <CoverLetterModal {...defaultModalProps} />,
        "pt",
        portugueseMessages,
      );

      expect(screen.getByText("Carta de Apresentação")).toBeInTheDocument();
    });
  });

  describe("Locale-specific placeholder texts", () => {
    it("should show correct placeholders for each language", () => {
      // English placeholders
      const { unmount } = renderWithLocale(
        <CoverLetterInputForm
          initialInputs={null}
          onSubmit={mockOnSubmit}
          isLoading={false}
        />,
        "en",
        englishMessages,
      );

      expect(
        screen.getByPlaceholderText("e.g., Senior Software Engineer"),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(
          "Tell us about the company, its mission, values, products, or what interests you about working there...",
        ),
      ).toBeInTheDocument();
      unmount();

      // French placeholders
      const { unmount: unmountFr } = renderWithLocale(
        <CoverLetterInputForm
          initialInputs={null}
          onSubmit={mockOnSubmit}
          isLoading={false}
        />,
        "fr",
        frenchMessages,
      );

      expect(
        screen.getByPlaceholderText("ex. Ingénieur Logiciel Senior"),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(
          "Parlez-nous de l'entreprise, sa mission, ses valeurs, ses produits, ou ce qui vous intéresse dans le fait d'y travailler...",
        ),
      ).toBeInTheDocument();
      unmountFr();

      // Portuguese placeholders
      renderWithLocale(
        <CoverLetterInputForm
          initialInputs={null}
          onSubmit={mockOnSubmit}
          isLoading={false}
        />,
        "pt",
        portugueseMessages,
      );

      expect(
        screen.getByPlaceholderText("ex. Engenheiro de Software Sênior"),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(
          "Conte-nos sobre a empresa, sua missão, valores, produtos, ou o que te interessa em trabalhar lá...",
        ),
      ).toBeInTheDocument();
    });
  });

  describe("Information box localization", () => {
    it("should render info box content in all supported languages", () => {
      // English info box
      const { unmount } = renderWithLocale(
        <CoverLetterInputForm
          initialInputs={null}
          onSubmit={mockOnSubmit}
          isLoading={false}
        />,
        "en",
        englishMessages,
      );

      expect(
        screen.getByText(
          "Leave job title and job description empty to create a spontaneous application cover letter that focuses on your interest in the company.",
        ),
      ).toBeInTheDocument();
      unmount();

      // French info box
      const { unmount: unmountFr } = renderWithLocale(
        <CoverLetterInputForm
          initialInputs={null}
          onSubmit={mockOnSubmit}
          isLoading={false}
        />,
        "fr",
        frenchMessages,
      );

      expect(
        screen.getByText(
          "Laissez le titre du poste et la description du poste vides pour créer une lettre de motivation de candidature spontanée qui se concentre sur votre intérêt pour l'entreprise.",
        ),
      ).toBeInTheDocument();
      unmountFr();

      // Portuguese info box
      renderWithLocale(
        <CoverLetterInputForm
          initialInputs={null}
          onSubmit={mockOnSubmit}
          isLoading={false}
        />,
        "pt",
        portugueseMessages,
      );

      expect(
        screen.getByText(
          "Deixe o título do cargo e a descrição do cargo em branco para criar uma carta de apresentação de candidatura espontânea que foca no seu interesse pela empresa.",
        ),
      ).toBeInTheDocument();
    });
  });
});
