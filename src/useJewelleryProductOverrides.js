import { useEffect, useState } from "react";

export const JEWELLERY_PRODUCT_OVERRIDES_STORAGE_KEY =
  "ceylon-jewellery-product-overrides";

const readOverrides = () => {
  try {
    const overrides = JSON.parse(
      window.localStorage.getItem(JEWELLERY_PRODUCT_OVERRIDES_STORAGE_KEY) || "{}"
    );
    return overrides && typeof overrides === "object" && !Array.isArray(overrides)
      ? overrides
      : {};
  } catch {
    return {};
  }
};

export const useJewelleryProductOverrides = () => {
  const [overrides, setOverrides] = useState(readOverrides);

  useEffect(() => {
    window.localStorage.setItem(
      JEWELLERY_PRODUCT_OVERRIDES_STORAGE_KEY,
      JSON.stringify(overrides)
    );
  }, [overrides]);

  useEffect(() => {
    const syncOverrides = (event) => {
      if (event.key === JEWELLERY_PRODUCT_OVERRIDES_STORAGE_KEY) {
        setOverrides(readOverrides());
      }
    };
    window.addEventListener("storage", syncOverrides);
    return () => window.removeEventListener("storage", syncOverrides);
  }, []);

  return [overrides, setOverrides];
};
