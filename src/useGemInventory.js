import { useEffect, useState } from "react";
import { getCollectionItemKey } from "./useSharedCollection.js";

export const GEM_INVENTORY_STORAGE_KEY = "ceylon-gem-inventory";
export const LOW_STOCK_THRESHOLD = 3;
export const DEFAULT_GEM_STOCK = 1;

const readInventory = (items) => {
  const initialInventory = Object.fromEntries(
    items.map((item) => [
      getCollectionItemKey(item),
      Number.isSafeInteger(Number(item.stockQuantity))
        && Number(item.stockQuantity) >= 0
        ? Math.max(0, Number(item.stockQuantity))
        : DEFAULT_GEM_STOCK
    ])
  );
  const storedInventory = JSON.parse(
    window.localStorage.getItem(GEM_INVENTORY_STORAGE_KEY) || "{}"
  );

  return storedInventory && typeof storedInventory === "object"
    ? {
        ...initialInventory,
        ...Object.fromEntries(
          Object.entries(storedInventory).map(([key, quantity]) => [
            key,
            Number.isSafeInteger(Number(quantity))
              ? Math.max(0, Number(quantity))
              : 0
          ])
        )
      }
    : initialInventory;
};

export const useGemInventory = (items) => {
  const [inventory, setInventory] = useState(() => readInventory(items));

  useEffect(() => {
    window.localStorage.setItem(
      GEM_INVENTORY_STORAGE_KEY,
      JSON.stringify(inventory)
    );
  }, [inventory]);

  useEffect(() => {
    const syncInventory = (event) => {
      if (event.key === GEM_INVENTORY_STORAGE_KEY) {
        setInventory(readInventory(items));
      }
    };

    window.addEventListener("storage", syncInventory);
    return () => window.removeEventListener("storage", syncInventory);
  }, [items]);

  return [inventory, setInventory];
};
