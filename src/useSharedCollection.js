import { useEffect, useState } from "react";

export const getCollectionItemKey = (item) =>
  item.productKey ||
  item.name?.trim().toLowerCase().replace(/\s+/g, "-") ||
  String(item.id);

export const normalizeCollectionItem = (item) => {
  const price = Number(item.price ?? item.basePriceUSD ?? 0);

  return {
    ...item,
    productKey: getCollectionItemKey(item),
    price,
    basePriceUSD: Number(item.basePriceUSD ?? price),
    quantity: Math.max(1, Number(item.quantity) || 1)
  };
};

const readCollection = (storageKey) => {
  try {
    const storedItems = JSON.parse(
      window.localStorage.getItem(storageKey) || "[]"
    );

    return Array.isArray(storedItems)
      ? storedItems.map(normalizeCollectionItem)
      : [];
  } catch {
    return [];
  }
};

export const useSharedCollection = (storageKey) => {
  const [items, setItems] = useState(() => readCollection(storageKey));

  useEffect(() => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify(items.map(normalizeCollectionItem))
    );
  }, [items, storageKey]);

  useEffect(() => {
    const syncCollection = (event) => {
      if (event.key === storageKey) {
        setItems(readCollection(storageKey));
      }
    };

    window.addEventListener("storage", syncCollection);
    return () => window.removeEventListener("storage", syncCollection);
  }, [storageKey]);

  return [items, setItems];
};