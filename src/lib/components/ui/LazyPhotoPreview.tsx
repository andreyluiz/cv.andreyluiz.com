"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { photoService } from "@/lib/services/photoService";

interface LazyPhotoPreviewProps {
  photoId?: string;
  alt: string;
  className?: string;
  size?: number;
  fallbackSrc?: string;
  onError?: () => void;
}

export function LazyPhotoPreview({
  photoId,
  alt,
  className = "",
  size = 40,
  fallbackSrc = "/profile.webp",
  onError,
}: LazyPhotoPreviewProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (!imgRef.current || !photoId) return;

    // Check if IntersectionObserver is available (not available in test environments)
    if (typeof IntersectionObserver === 'undefined') {
      // Fallback: immediately set as in view for environments without IntersectionObserver
      setIsInView(true);
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: "50px", // Start loading 50px before the image comes into view
        threshold: 0.1,
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [photoId]);

  // Load photo when it comes into view
  useEffect(() => {
    if (!isInView || !photoId) return;

    let isMounted = true;

    const loadPhoto = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        const url = await photoService.getPhotoUrl(photoId);

        if (isMounted) {
          if (url) {
            setPhotoUrl(url);
            setHasError(false);
          } else {
            setPhotoUrl(null);
            setHasError(true);
            onError?.();
          }
        }
      } catch (error) {
        console.error("Failed to load lazy photo preview:", error);
        if (isMounted) {
          setPhotoUrl(null);
          setHasError(true);
          onError?.();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPhoto();

    return () => {
      isMounted = false;
    };
  }, [isInView, photoId, onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const imageSrc = photoUrl && !hasError ? photoUrl : fallbackSrc;
  const shouldShowSpinner = isLoading && isInView;

  return (
    <div
      ref={imgRef}
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size }}
    >
      {shouldShowSpinner ? (
        <div
          className="rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <Image
          src={imageSrc}
          alt={alt}
          width={size}
          height={size}
          className="rounded-full object-cover"
          onError={() => {
            if (photoUrl) {
              setHasError(true);
              setPhotoUrl(null);
              onError?.();
            }
          }}
          {...(photoUrl && { unoptimized: true })} // Use unoptimized for blob URLs
        />
      )}
    </div>
  );
}