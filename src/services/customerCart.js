import { useCallback, useEffect, useState } from "react";
import {
  apiDelete,
  apiGet,
  apiPost,
  getCustomerToken,
  resolveMediaUrl
} from "./api.js";
import { getCollectionItemKey } from "../useSharedCollection.js";
import { currencyRates } from "../currency.js";
import { getProductOfferPricing } from "../productOffers.js";

const getCustomerId = () => {
  try {
    const customer = JSON.parse(window.localStorage.getItem("ceylon-user") || "null");
    return customer?.id || window.localStorage.getItem("ceylon-user-id");
  } catch {
    return window.localStorage.getItem("ceylon-user-id");
  }
};

const readResponse = async (response, fallbackMessage) => {
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("The cart service returned an invalid response.");
  }

  if (!response.ok || data?.success !== true) {
    throw new Error(data?.message || fallbackMessage);
  }

  return data;
};

const mapCustomerCartItem = (item) => {
  const isJewellery = item.item_type === "jewellery" || item.jewellery_id != null;
  const productId = isJewellery ? item.jewellery_id : item.gemstone_id;
  const sourceCurrency = String(item.currency || "USD").toUpperCase();
  const sourceRate = currencyRates[sourceCurrency]?.rate || 1;
  const originalPriceUSD = Number(item.price || 0) / sourceRate;
  const offerPricing = getProductOfferPricing({
    ...item,
    price: originalPriceUSD,
    basePriceUSD: originalPriceUSD
  });

  return {
    ...item,
    id: productId,
    cartId: item.id,
    itemType: isJewellery ? "jewellery" : "gemstone",
    productKey: isJewellery
      ? item.product_code || `jewellery-db-${productId}`
      : `inventory-gemstone-${productId}`,
    name: item.name || (isJewellery ? "Jewellery" : "Gemstone"),
    image: resolveMediaUrl(item.image_url),
    price: offerPricing.currentPrice,
    quantity: Number(item.quantity) || 1,
    carat: item.carat || "",
    basePriceUSD: originalPriceUSD,
    discountRate: offerPricing.discountRate,
    discountLabel: offerPricing.discountLabel
  };
};

export const fetchCustomerCart = async () => {
  const customerId = getCustomerId();
  if (!customerId) {
    throw new Error("Unable to identify the logged-in customer.");
  }

  const response = await apiGet(`/api/cart/${encodeURIComponent(customerId)}`);
  const data = await readResponse(response, "Unable to load your saved cart.");
  if (!Array.isArray(data.data)) {
    throw new Error("The cart service returned an invalid item list.");
  }

  return data.data.map(mapCustomerCartItem);
};

export const useCustomerCart = (isOpen, setCart) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingCartIds, setDeletingCartIds] = useState([]);

  useEffect(() => {
    if (!isOpen || !getCustomerToken()) return undefined;

    let isActive = true;
    Promise.resolve()
      .then(() => {
        if (!isActive) return null;
        setIsLoading(true);
        setError("");
        setCart([]);
        return fetchCustomerCart();
      })
      .then((savedCart) => {
        if (isActive && savedCart) setCart(savedCart);
      })
      .catch((fetchError) => {
        if (isActive) {
          setError(fetchError instanceof Error
            ? fetchError.message
            : "Unable to load your saved cart.");
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [isOpen, setCart]);

  const removeCartItem = useCallback(async (item) => {
    const productKey = getCollectionItemKey(item);
    setCart((current) => current.filter((entry) => getCollectionItemKey(entry) !== productKey));
    if (!item.cartId || !getCustomerToken()) return true;

    setDeletingCartIds((current) => [...current, item.cartId]);
    setError("");
    try {
      const response = await apiDelete(`/api/cart/${encodeURIComponent(item.cartId)}`);
      await readResponse(response, "Unable to remove this item from your saved cart.");
      return true;
    } catch (deleteError) {
      setCart((current) => (
        current.some((entry) => getCollectionItemKey(entry) === productKey)
          ? current
          : [item, ...current]
      ));
      setError(deleteError instanceof Error
        ? deleteError.message
        : "Unable to remove this item from your saved cart.");
      return false;
    } finally {
      setDeletingCartIds((current) => current.filter((id) => id !== item.cartId));
    }
  }, [setCart]);

  return {
    isLoading,
    error,
    deletingCartIds,
    removeCartItem
  };
};

export const persistCustomerCartItem = async (itemType, itemId, quantity = 1) => {
  if (!getCustomerToken()) return { persisted: false, quantity };

  const id = Number(itemId);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new Error("This item is not linked to a database record and cannot be saved to your account cart.");
  }

  const response = await apiPost("/api/cart", {
    [itemType === "jewellery" ? "jewellery_id" : "gemstone_id"]: id,
    quantity,
    replace_quantity: true
  });

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("The cart service returned an invalid response.");
  }

  if (!response.ok || data?.success !== true) {
    throw new Error(data?.message || "Unable to save this item to your account cart.");
  }

  return {
    persisted: true,
    quantity: Number.isSafeInteger(Number(data.quantity)) && Number(data.quantity) > 0
      ? Number(data.quantity)
      : quantity
  };
};
