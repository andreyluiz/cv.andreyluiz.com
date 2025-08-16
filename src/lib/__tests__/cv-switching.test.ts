import { describe, expect, it } from "vitest";
import { useStore } from "@/lib/store";
import type { Variant } from "@/lib/types";

describe("CV Switching Integration", () => {
  const mockCV: Variant = {
    name: "Test User",
    title: "Test Title",
    contactInfo: {
      email: "test@example.com",
      phone: "+1234567890",
      location: "Test Location",
      github: "github.com/test",
      linkedin: "linkedin.com/in/test",
      website: "test.com",
      age: "30",
      nationality: "Test",
    },
    summary: "Test summary",
    qualities: [],
    generalSkills: [],
    skills: [],
    experience: [],
    education: [],
    certifications: [],
    languages: [],
    personalityTraits: [],
  };

  it("should set currentCV when setCurrentCV is called", () => {
    const { setCurrentCV, currentCV } = useStore.getState();

    // Initially should be null
    expect(currentCV).toBeNull();

    // Set a CV
    setCurrentCV(mockCV);

    // Should now have the CV
    expect(useStore.getState().currentCV).toEqual(mockCV);
  });

  it("should clear currentCV when clearCurrentCV is called", () => {
    const { setCurrentCV, clearCurrentCV } = useStore.getState();

    // Set a CV first
    setCurrentCV(mockCV);
    expect(useStore.getState().currentCV).toEqual(mockCV);

    // Clear it
    clearCurrentCV();

    // Should be null again
    expect(useStore.getState().currentCV).toBeNull();
  });

  it("should handle switching between different CVs", () => {
    const { setCurrentCV } = useStore.getState();

    const cv1 = { ...mockCV, name: "User 1" };
    const cv2 = { ...mockCV, name: "User 2" };

    // Set first CV
    setCurrentCV(cv1);
    expect(useStore.getState().currentCV?.name).toBe("User 1");

    // Switch to second CV
    setCurrentCV(cv2);
    expect(useStore.getState().currentCV?.name).toBe("User 2");
  });
});
