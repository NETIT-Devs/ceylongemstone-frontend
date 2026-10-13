import { useEffect, useState } from "react";

export const GEM_PRODUCT_OVERRIDES_STORAGE_KEY = "ceylon-gem-product-overrides";

const readGemProductOverrides = () => {
  try {
    const overrides = JSON.parse(
      window.localStorage.getItem(GEM_PRODUCT_OVERRIDES_STORAGE_KEY) || "{}"
    );
    return overrides && typeof overrides === "object" && !Array.isArray(overrides)
      ? overrides
      : {};
  } catch {
    return {};
  }
};

export const useGemProductOverrides = () => {
  const [overrides, setOverrides] = useState(readGemProductOverrides);

  useEffect(() => {
    window.localStorage.setItem(
      GEM_PRODUCT_OVERRIDES_STORAGE_KEY,
      JSON.stringify(overrides)
    );
  }, [overrides]);

  useEffect(() => {
    const syncOverrides = (event) => {
      if (event.key === GEM_PRODUCT_OVERRIDES_STORAGE_KEY) {
        setOverrides(readGemProductOverrides());
      }
    };

    window.addEventListener("storage", syncOverrides);
    return () => window.removeEventListener("storage", syncOverrides);
  }, []);

  return [overrides, setOverrides];
};
