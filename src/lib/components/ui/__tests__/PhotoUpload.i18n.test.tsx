import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import { PhotoUpload } from "../PhotoUpload";

// Mock the photo service
vi.mock("@/lib/services/photoService", () => ({
  photoService: {
    storePhoto: vi.fn(),
    getPhotoUrl: vi.fn(),
    deletePhoto: vi.fn(),
  },
  PhotoService: {
    revokePhotoUrl: vi.fn(),
  },
}));

// Mock Next.js Image component
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: any) => {
    // biome-ignore lint/performance/noImgElement: Tests
    return <img src={src} alt={alt} {...props} />;
  },
}));

// Mock ConfirmationDialog component
vi.mock("@/lib/components/modals/ConfirmationDialog", () => ({
  default: ({ isOpen, title, message, confirmText, cancelText }: any) => {
    if (!isOpen) return null;
    return (
      <div role="dialog">
        <h3>{title}</h3>
        <p>{message}</p>
        <button type="button">{cancelText}</button>
        <button type="button">{confirmText}</button>
      </div>
    );
  },
}));

// English messages
const enMessages = {
  cvManagement: {
    photo: {
      upload: "Upload Photo",
      dragDrop: "Drag and drop an image here, or click to browse",
      preview: "Photo Preview",
      alt: "Profile photo preview",
      removeAlt: "Remove uploaded photo",
      uploading: "Uploading photo...",
      clickToReplace: "Click to replace photo",
      clickToReplaceAlt: "Click to replace current photo with a new one",
      uploadAreaLabel:
        "Photo upload area. Drag and drop an image here, or press Enter or Space to browse for files",
      supportedFormats: "JPEG, PNG, WebP (max 2MB)",
      helpText: "Upload a profile photo to personalize your CV",
      uploadSuccess: "Photo uploaded successfully",
      uploadError: "Photo upload failed",
      removeSuccess: "Photo removed successfully",
      confirmRemoveTitle: "Remove Photo",
      confirmRemoveMessage:
        "Are you sure you want to remove this photo? This action cannot be undone.",
      confirmRemoveButton: "Remove Photo",
    },
    errors: {
      photoTooLarge: "Image file must be smaller than 2MB",
      photoInvalidType: "Please select a valid image file (JPEG, PNG, or WebP)",
      photoUploadFailed: "Failed to process image. Please try again",
    },
    actions: {
      cancelDelete: "Cancel",
    },
  },
};

// French messages
const frMessages = {
  cvManagement: {
    photo: {
      upload: "Télécharger une Photo",
      dragDrop: "Glissez-déposez une image ici, ou cliquez pour parcourir",
      preview: "Aperçu de la Photo",
      alt: "Aperçu de la photo de profil",
      removeAlt: "Supprimer la photo téléchargée",
      uploading: "Téléchargement de la photo...",
      clickToReplace: "Cliquez pour remplacer la photo",
      clickToReplaceAlt:
        "Cliquez pour remplacer la photo actuelle par une nouvelle",
      uploadAreaLabel:
        "Zone de téléchargement de photo. Glissez-déposez une image ici, ou appuyez sur Entrée ou Espace pour parcourir les fichiers",
      supportedFormats: "JPEG, PNG, WebP (max 2 Mo)",
      helpText: "Téléchargez une photo de profil pour personnaliser votre CV",
      uploadSuccess: "Photo téléchargée avec succès",
      uploadError: "Échec du téléchargement de la photo",
      removeSuccess: "Photo supprimée avec succès",
      confirmRemoveTitle: "Supprimer la Photo",
      confirmRemoveMessage:
        "Êtes-vous sûr de vouloir supprimer cette photo ? Cette action ne peut pas être annulée.",
      confirmRemoveButton: "Supprimer la Photo",
    },
    errors: {
      photoTooLarge: "Le fichier image doit être inférieur à 2 Mo",
      photoInvalidType:
        "Veuillez sélectionner un fichier image valide (JPEG, PNG ou WebP)",
      photoUploadFailed: "Échec du traitement de l'image. Veuillez réessayer",
    },
    actions: {
      cancelDelete: "Annuler",
    },
  },
};

// Portuguese messages
const ptMessages = {
  cvManagement: {
    photo: {
      upload: "Enviar Foto",
      dragDrop: "Arraste e solte uma imagem aqui, ou clique para navegar",
      preview: "Visualização da Foto",
      alt: "Visualização da foto de perfil",
      removeAlt: "Remover foto enviada",
      uploading: "Enviando foto...",
      clickToReplace: "Clique para substituir a foto",
      clickToReplaceAlt: "Clique para substituir a foto atual por uma nova",
      uploadAreaLabel:
        "Área de envio de foto. Arraste e solte uma imagem aqui, ou pressione Enter ou Espaço para navegar pelos arquivos",
      supportedFormats: "JPEG, PNG, WebP (máx 2MB)",
      helpText: "Envie uma foto de perfil para personalizar seu CV",
      uploadSuccess: "Foto enviada com sucesso",
      uploadError: "Falha no envio da foto",
      removeSuccess: "Foto removida com sucesso",
      confirmRemoveTitle: "Remover Foto",
      confirmRemoveMessage:
        "Tem certeza de que deseja remover esta foto? Esta ação não pode ser desfeita.",
      confirmRemoveButton: "Remover Foto",
    },
    errors: {
      photoTooLarge: "O arquivo de imagem deve ser menor que 2MB",
      photoInvalidType:
        "Por favor, selecione um arquivo de imagem válido (JPEG, PNG ou WebP)",
      photoUploadFailed:
        "Falha ao processar imagem. Por favor, tente novamente",
    },
    actions: {
      cancelDelete: "Cancelar",
    },
  },
};

const renderWithIntl = (
  component: React.ReactElement,
  locale: string,
  messages: any,
) => {
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      {component}
    </NextIntlClientProvider>,
  );
};

describe("PhotoUpload Internationalization", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("English (en) locale", () => {
    it("renders all UI text in English", () => {
      renderWithIntl(
        <PhotoUpload value={null} onChange={mockOnChange} />,
        "en",
        enMessages,
      );

      // Check main UI elements
      expect(screen.getByText("Upload Photo")).toBeInTheDocument();
      expect(
        screen.getByText("Drag and drop an image here, or click to browse"),
      ).toBeInTheDocument();
      expect(screen.getByText("JPEG, PNG, WebP (max 2MB)")).toBeInTheDocument();
      expect(
        screen.getByText("Upload a profile photo to personalize your CV"),
      ).toBeInTheDocument();

      // Check accessibility labels
      expect(
        screen.getByLabelText(
          "Photo upload area. Drag and drop an image here, or press Enter or Space to browse for files",
        ),
      ).toBeInTheDocument();
    });

    it("renders error messages in English", () => {
      renderWithIntl(
        <PhotoUpload
          value={null}
          onChange={mockOnChange}
          error="Image file must be smaller than 2MB"
        />,
        "en",
        enMessages,
      );

      expect(
        screen.getByText("Image file must be smaller than 2MB"),
      ).toBeInTheDocument();
    });
  });

  describe("French (fr) locale", () => {
    it("renders all UI text in French", () => {
      renderWithIntl(
        <PhotoUpload value={null} onChange={mockOnChange} />,
        "fr",
        frMessages,
      );

      // Check main UI elements
      expect(screen.getByText("Télécharger une Photo")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Glissez-déposez une image ici, ou cliquez pour parcourir",
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText("JPEG, PNG, WebP (max 2 Mo)"),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Téléchargez une photo de profil pour personnaliser votre CV",
        ),
      ).toBeInTheDocument();

      // Check accessibility labels
      expect(
        screen.getByLabelText(
          "Zone de téléchargement de photo. Glissez-déposez une image ici, ou appuyez sur Entrée ou Espace pour parcourir les fichiers",
        ),
      ).toBeInTheDocument();
    });

    it("renders error messages in French", () => {
      renderWithIntl(
        <PhotoUpload
          value={null}
          onChange={mockOnChange}
          error="Le fichier image doit être inférieur à 2 Mo"
        />,
        "fr",
        frMessages,
      );

      expect(
        screen.getByText("Le fichier image doit être inférieur à 2 Mo"),
      ).toBeInTheDocument();
    });
  });

  describe("Portuguese (pt) locale", () => {
    it("renders all UI text in Portuguese", () => {
      renderWithIntl(
        <PhotoUpload value={null} onChange={mockOnChange} />,
        "pt",
        ptMessages,
      );

      // Check main UI elements
      expect(screen.getByText("Enviar Foto")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Arraste e solte uma imagem aqui, ou clique para navegar",
        ),
      ).toBeInTheDocument();
      expect(screen.getByText("JPEG, PNG, WebP (máx 2MB)")).toBeInTheDocument();
      expect(
        screen.getByText("Envie uma foto de perfil para personalizar seu CV"),
      ).toBeInTheDocument();

      // Check accessibility labels
      expect(
        screen.getByLabelText(
          "Área de envio de foto. Arraste e solte uma imagem aqui, ou pressione Enter ou Espaço para navegar pelos arquivos",
        ),
      ).toBeInTheDocument();
    });

    it("renders error messages in Portuguese", () => {
      renderWithIntl(
        <PhotoUpload
          value={null}
          onChange={mockOnChange}
          error="O arquivo de imagem deve ser menor que 2MB"
        />,
        "pt",
        ptMessages,
      );

      expect(
        screen.getByText("O arquivo de imagem deve ser menor que 2MB"),
      ).toBeInTheDocument();
    });
  });

  describe("Photo preview state internationalization", () => {
    beforeEach(async () => {
      // Mock successful photo URL retrieval
      const { photoService } = await import("@/lib/services/photoService");
      vi.mocked(photoService.getPhotoUrl).mockResolvedValue("blob:mock-url");
    });

    it("renders preview text in English", async () => {
      renderWithIntl(
        <PhotoUpload value="photo-id" onChange={mockOnChange} />,
        "en",
        enMessages,
      );

      // Wait for photo to load and preview to show
      await screen.findByText("Photo Preview");
      expect(screen.getByText("Click to replace photo")).toBeInTheDocument();
      expect(screen.getByAltText("Profile photo preview")).toBeInTheDocument();
      expect(
        screen.getByLabelText("Remove uploaded photo"),
      ).toBeInTheDocument();
    });

    it("renders preview text in French", async () => {
      renderWithIntl(
        <PhotoUpload value="photo-id" onChange={mockOnChange} />,
        "fr",
        frMessages,
      );

      // Wait for photo to load and preview to show
      await screen.findByText("Aperçu de la Photo");
      expect(
        screen.getByText("Cliquez pour remplacer la photo"),
      ).toBeInTheDocument();
      expect(
        screen.getByAltText("Aperçu de la photo de profil"),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText("Supprimer la photo téléchargée"),
      ).toBeInTheDocument();
    });

    it("renders preview text in Portuguese", async () => {
      renderWithIntl(
        <PhotoUpload value="photo-id" onChange={mockOnChange} />,
        "pt",
        ptMessages,
      );

      // Wait for photo to load and preview to show
      await screen.findByText("Visualização da Foto");
      expect(
        screen.getByText("Clique para substituir a foto"),
      ).toBeInTheDocument();
      expect(
        screen.getByAltText("Visualização da foto de perfil"),
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Remover foto enviada")).toBeInTheDocument();
    });
  });

  describe("Accessibility labels across locales", () => {
    it("provides proper ARIA labels in all locales", () => {
      // Test English
      const { unmount: unmountEn } = renderWithIntl(
        <PhotoUpload value={null} onChange={mockOnChange} />,
        "en",
        enMessages,
      );
      expect(
        screen.getByLabelText(
          "Photo upload area. Drag and drop an image here, or press Enter or Space to browse for files",
        ),
      ).toBeInTheDocument();
      unmountEn();

      // Test French
      const { unmount: unmountFr } = renderWithIntl(
        <PhotoUpload value={null} onChange={mockOnChange} />,
        "fr",
        frMessages,
      );
      expect(
        screen.getByLabelText(
          "Zone de téléchargement de photo. Glissez-déposez une image ici, ou appuyez sur Entrée ou Espace pour parcourir les fichiers",
        ),
      ).toBeInTheDocument();
      unmountFr();

      // Test Portuguese
      renderWithIntl(
        <PhotoUpload value={null} onChange={mockOnChange} />,
        "pt",
        ptMessages,
      );
      expect(
        screen.getByLabelText(
          "Área de envio de foto. Arraste e solte uma imagem aqui, ou pressione Enter ou Espaço para navegar pelos arquivos",
        ),
      ).toBeInTheDocument();
    });
  });
});
