import { useEffect, useState } from "react";

export const JEWELLERY_SUBMISSIONS_STORAGE_KEY = "ceylon-jewellery-submissions";

const readSubmissions = () => {
  try {
    const submissions = JSON.parse(
      window.localStorage.getItem(JEWELLERY_SUBMISSIONS_STORAGE_KEY) || "[]"
    );
    return Array.isArray(submissions)
      ? submissions.filter(
          (submission) =>
            submission?.jewellery &&
            ["pending", "approved", "rejected"].includes(submission.status)
        )
      : [];
  } catch {
    return [];
  }
};

export const useJewellerySubmissions = () => {
  const [submissions, setSubmissions] = useState(readSubmissions);

  useEffect(() => {
    window.localStorage.setItem(
      JEWELLERY_SUBMISSIONS_STORAGE_KEY,
      JSON.stringify(submissions)
    );
  }, [submissions]);

  useEffect(() => {
    const syncSubmissions = (event) => {
      if (event.key === JEWELLERY_SUBMISSIONS_STORAGE_KEY) {
        setSubmissions(readSubmissions());
      }
    };
    window.addEventListener("storage", syncSubmissions);
    return () => window.removeEventListener("storage", syncSubmissions);
  }, []);

  return [submissions, setSubmissions];
};
