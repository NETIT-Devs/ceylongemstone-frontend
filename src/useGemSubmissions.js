import { useEffect, useState } from "react";

export const GEM_SUBMISSIONS_STORAGE_KEY = "ceylon-gem-submissions";

export const readGemSubmissions = () => {
  try {
    const submissions = JSON.parse(
      window.localStorage.getItem(GEM_SUBMISSIONS_STORAGE_KEY) || "[]"
    );

    return Array.isArray(submissions)
      ? submissions.filter(
          (submission) =>
            submission?.gem &&
            ["pending", "approved", "rejected"].includes(submission.status)
        )
      : [];
  } catch {
    return [];
  }
};

export const getApprovedGems = () =>
  readGemSubmissions()
    .filter((submission) => submission.status === "approved")
    .map((submission) => submission.gem);

export const useGemSubmissions = () => {
  const [submissions, setSubmissions] = useState(readGemSubmissions);

  useEffect(() => {
    window.localStorage.setItem(
      GEM_SUBMISSIONS_STORAGE_KEY,
      JSON.stringify(submissions)
    );
  }, [submissions]);

  useEffect(() => {
    const syncSubmissions = (event) => {
      if (event.key === GEM_SUBMISSIONS_STORAGE_KEY) {
        setSubmissions(readGemSubmissions());
      }
    };

    window.addEventListener("storage", syncSubmissions);
    return () => window.removeEventListener("storage", syncSubmissions);
  }, []);

  return [submissions, setSubmissions];
};
