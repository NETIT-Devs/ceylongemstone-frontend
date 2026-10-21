import { useCallback, useEffect, useRef, useState } from "react";

export const getCollectionItemKey = (item) =>
  item.productKey ||
  item.name?.trim().toLowerCase().replace(/\s+/g, "-") ||
  String(item.id);

export const normalizeCollectionItem = (item) => {
  const price = Number(item.price ?? item.basePriceUSD ?? 0);
  const quantity = Number(item.quantity);

  return {
    ...item,
    productKey: getCollectionItemKey(item),
    price,
    basePriceUSD: Number(item.basePriceUSD ?? price),
    quantity: Number.isSafeInteger(quantity) && quantity > 0 ? quantity : 1
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
  const itemsRef = useRef(items);

  useEffect(() => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify(items.map(normalizeCollectionItem))
    );
  }, [items, storageKey]);

  useEffect(() => {
    const syncCollection = (event) => {
      if (event.key === storageKey) {
        const nextItems = readCollection(storageKey);
        itemsRef.current = nextItems;
        setItems(nextItems);
      }
    };

    const syncSameTabCollection = (event) => {
      if (event.detail?.storageKey === storageKey) {
        itemsRef.current = event.detail.items;
        setItems(event.detail.items);
      }
    };

    window.addEventListener("storage", syncCollection);
    window.addEventListener("ceylon-collection-change", syncSameTabCollection);
    return () => {
      window.removeEventListener("storage", syncCollection);
      window.removeEventListener("ceylon-collection-change", syncSameTabCollection);
    };
  }, [storageKey]);

  const setCollection = useCallback((nextValue) => {
    const nextItems = typeof nextValue === "function"
      ? nextValue(itemsRef.current)
      : nextValue;
    const normalizedItems = nextItems.map(normalizeCollectionItem);

    itemsRef.current = normalizedItems;
    setItems(normalizedItems);
    window.localStorage.setItem(storageKey, JSON.stringify(normalizedItems));
    window.dispatchEvent(new CustomEvent("ceylon-collection-change", {
      detail: { storageKey, items: normalizedItems }
    }));
  }, [storageKey]);

  return [items, setCollection];
};