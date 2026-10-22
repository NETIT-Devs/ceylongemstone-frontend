import { useEffect, useMemo, useState } from "react";
import { getCollectionItemKey } from "./useSharedCollection.js";

export const GEM_INVENTORY_STORAGE_KEY = "ceylon-gem-inventory";
export const LOW_STOCK_THRESHOLD = 3;
export const DEFAULT_GEM_STOCK = 1;

const getActiveStock = (item) => {
  if (item.stock_quantity === undefined || item.stock_quantity === null) {
    return null;
  }

  const quantity = Number(item.stock_quantity);
  return Number.isSafeInteger(quantity) && quantity >= 0 ? quantity : null;
};

const readInventory = (items) => {
  const initialInventory = Object.fromEntries(
    items.map((item) => [
      getCollectionItemKey(item),
      getActiveStock(item) ?? DEFAULT_GEM_STOCK
    ])
  );
  const activeStockKeys = new Set(
    items
      .filter((item) => getActiveStock(item) !== null)
      .map(getCollectionItemKey)
  );
  const storedInventory = JSON.parse(
    window.localStorage.getItem(GEM_INVENTORY_STORAGE_KEY) || "{}"
  );

  return storedInventory && typeof storedInventory === "object"
    ? {
        ...initialInventory,
        ...Object.fromEntries(
          Object.entries(storedInventory)
            .filter(([key]) => !activeStockKeys.has(key))
            .map(([key, quantity]) => [
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
  const [storedInventory, setInventory] = useState(() => readInventory(items));
  const activeStock = useMemo(
    () =>
      Object.fromEntries(
        items
          .filter((item) => getActiveStock(item) !== null)
          .map((item) => [getCollectionItemKey(item), getActiveStock(item)])
      ),
    [items]
  );
  const inventory = useMemo(
    () => ({ ...storedInventory, ...activeStock }),
    [activeStock, storedInventory]
  );

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
