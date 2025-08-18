"use client";

import { useEffect, useRef, useState } from "react";
import { photoService } from "@/lib/services/photoService";

interface PerformanceMetrics {
  cacheStats: {
    size: number;
    maxSize: number;
    hitRate?: number;
  };
  storageInfo: {
    used: number;
    available: number;
  } | null;
  loadTimes: number[];
  averageLoadTime: number;
  errorCount: number;
}

export function usePhotoPerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cacheStats: { size: 0, maxSize: 0 },
    storageInfo: null,
    loadTimes: [],
    averageLoadTime: 0,
    errorCount: 0,
  });

  const loadTimesRef = useRef<number[]>([]);
  const errorCountRef = useRef(0);

  // Update metrics periodically
  useEffect(() => {
    const updateMetrics = async () => {
      try {
        const cacheStats = photoService.getCacheStats();
        const storageInfo = await photoService.getStorageInfo();

        const averageLoadTime =
          loadTimesRef.current.length > 0
            ? loadTimesRef.current.reduce((sum, time) => sum + time, 0) /
              loadTimesRef.current.length
            : 0;

        setMetrics({
          cacheStats,
          storageInfo,
          loadTimes: [...loadTimesRef.current],
          averageLoadTime,
          errorCount: errorCountRef.current,
        });
      } catch (error) {
        console.error("Failed to update photo performance metrics:", error);
      }
    };

    // Update immediately
    updateMetrics();

    // Update every 30 seconds
    const interval = setInterval(updateMetrics, 30000);

    return () => clearInterval(interval);
  }, []);

  // Track photo load time
  const trackLoadTime = (loadTime: number) => {
    loadTimesRef.current.push(loadTime);

    // Keep only last 100 load times to prevent memory growth
    if (loadTimesRef.current.length > 100) {
      loadTimesRef.current = loadTimesRef.current.slice(-100);
    }
  };

  // Track error
  const trackError = () => {
    errorCountRef.current += 1;
  };

  // Reset metrics
  const resetMetrics = () => {
    loadTimesRef.current = [];
    errorCountRef.current = 0;
    setMetrics({
      cacheStats: photoService.getCacheStats(),
      storageInfo: null,
      loadTimes: [],
      averageLoadTime: 0,
      errorCount: 0,
    });
  };

  // Get performance recommendations
  const getRecommendations = (): string[] => {
    const recommendations: string[] = [];

    if (metrics.cacheStats.size >= metrics.cacheStats.maxSize * 0.8) {
      recommendations.push(
        "Cache is nearly full. Consider clearing unused photos.",
      );
    }

    if (metrics.averageLoadTime > 1000) {
      recommendations.push(
        "Photo load times are high. Consider optimizing image sizes.",
      );
    }

    if (metrics.errorCount > 10) {
      recommendations.push(
        "High error rate detected. Check IndexedDB availability.",
      );
    }

    if (
      metrics.storageInfo &&
      metrics.storageInfo.used > metrics.storageInfo.available * 0.8
    ) {
      recommendations.push(
        "Storage quota is nearly full. Consider cleaning up old photos.",
      );
    }

    return recommendations;
  };

  return {
    metrics,
    trackLoadTime,
    trackError,
    resetMetrics,
    getRecommendations,
  };
}
