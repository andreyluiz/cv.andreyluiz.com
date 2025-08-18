"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { photoService } from "@/lib/services/photoService";

interface ProfileImageProps {
  className?: string;
  photoId?: string;
}

export default function ProfileImage({
  className = "",
  photoId,
}: ProfileImageProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let currentPhotoUrl: string | null = null;

    const loadPhoto = async () => {
      if (!photoId) {
        setPhotoUrl(null);
        setIsLoading(false);
        setHasError(false);
        return;
      }

      setIsLoading(true);
      setHasError(false);

      try {
        const url = await photoService.getPhotoUrl(photoId);

        if (isMounted) {
          if (url) {
            currentPhotoUrl = url;
            setPhotoUrl(url);
            setHasError(false);
          } else {
            setPhotoUrl(null);
            setHasError(true);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to load profile photo:", error);
        if (isMounted) {
          setPhotoUrl(null);
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    loadPhoto();

    // Cleanup function to revoke object URL and prevent memory leaks
    return () => {
      isMounted = false;
      if (currentPhotoUrl) {
        URL.revokeObjectURL(currentPhotoUrl);
      }
    };
  }, [photoId]);

  // Show loading state
  if (isLoading) {
    return (
      <div
        className={`rounded-full print:size-32 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center ${className}`}
        style={{ width: 150, height: 150 }}
        role="img"
        aria-label="Loading profile picture"
      >
        <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Use custom photo if available and no error, otherwise fallback to default
  const imageSrc = photoUrl && !hasError ? photoUrl : "/profile.png";
  const altText =
    photoUrl && !hasError ? "Custom profile picture" : "Profile Picture";

  return (
    <Image
      src={imageSrc}
      alt={altText}
      width={150}
      height={150}
      className={`rounded-full print:size-32 ${className}`}
      onError={() => {
        // Handle image load errors by falling back to default
        if (photoUrl) {
          setHasError(true);
          setPhotoUrl(null);
        }
      }}
      {...(photoUrl && { unoptimized: true })} // Use unoptimized for blob URLs
    />
  );
}
