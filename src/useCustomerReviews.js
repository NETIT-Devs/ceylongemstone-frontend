import { useEffect, useState } from "react";
import customerReviews from "./customerReviews.js";

const storageKey = "ceylon-customer-reviews";

const readReviews = () => {
  try {
    const storedReviews = window.localStorage.getItem(storageKey);
    if (storedReviews === null) return customerReviews;

    const parsedReviews = JSON.parse(storedReviews);
    return Array.isArray(parsedReviews) ? parsedReviews : customerReviews;
  } catch {
    return customerReviews;
  }
};

export const useCustomerReviews = () => {
  const [reviews, setReviews] = useState(readReviews);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(reviews));
    } catch {
      // Keep the current view usable if browser storage is unavailable.
    }
  }, [reviews]);

  useEffect(() => {
    const syncReviews = (event) => {
      if (event.key === storageKey) setReviews(readReviews());
    };

    window.addEventListener("storage", syncReviews);
    return () => window.removeEventListener("storage", syncReviews);
  }, []);

  return [reviews, setReviews];
};