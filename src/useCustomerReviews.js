import { useCallback, useEffect, useState } from "react";
import { apiGet } from "./services/api.js";

export const useCustomerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReviews = useCallback(async () => {
    const response = await apiGet("/api/reviews");
    const data = await response.json();
    if (!response.ok || data.success !== true || !Array.isArray(data.data)) {
      throw new Error(data.message || "Unable to load customer reviews.");
    }

    return data.data
      .filter((review) => review.status === "APPROVED")
      .map((review) => ({
        id: review.id,
        name: review.name?.trim() || "Customer",
        location: review.gemstone_name || "",
        rating: Number(review.rating),
        comment: review.comment,
        avatar: null,
        createdAt: review.created_at,
      }));
  }, []);

  const refreshReviews = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setReviews(await loadReviews());
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load customer reviews."
      );
    } finally {
      setLoading(false);
    }
  }, [loadReviews]);

  useEffect(() => {
    let isCurrent = true;

    loadReviews()
      .then((loadedReviews) => {
        if (isCurrent) setReviews(loadedReviews);
      })
      .catch((loadError) => {
        if (isCurrent) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load customer reviews."
          );
        }
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [loadReviews]);

  return { reviews, loading, error, refreshReviews };
};