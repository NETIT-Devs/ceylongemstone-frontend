import { useEffect, useState } from "react";
import {
  getCollectionItemKey,
  normalizeCollectionItem
} from "../useSharedCollection.js";
import { formatCurrencyPrice, getCurrentCurrency } from "../currency.js";
import "./CollectionDrawerActions.css";

const CollectionDrawerActions = ({
  activeDrawer,
  wishlist,
  cart,
  setWishlist,
  setCart,
  setActiveDrawer
}) => {
  const [currency, setCurrency] = useState(getCurrentCurrency);
  const items = activeDrawer === "wishlist" ? wishlist : cart;

  useEffect(() => {
    const updateCurrency = () => setCurrency(getCurrentCurrency());

    window.addEventListener("ceylon-currency-change", updateCurrency);
    window.addEventListener("storage", updateCurrency);
    return () => {
      window.removeEventListener("ceylon-currency-change", updateCurrency);
      window.removeEventListener("storage", updateCurrency);
    };
  }, []);

  if (!items.length) return null;

  const total = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * (Number(item.quantity) || 1),
    0
  );

  const addWishlistToCart = () => {
    setCart((current) => {
      const nextCart = [...current];

      wishlist.forEach((item) => {
        const productKey = getCollectionItemKey(item);
        const existingIndex = nextCart.findIndex(
          (cartItem) => getCollectionItemKey(cartItem) === productKey
        );

        if (existingIndex >= 0) {
          nextCart[existingIndex] = {
            ...nextCart[existingIndex],
            quantity: 1
          };
        } else {
          nextCart.push(normalizeCollectionItem({ ...item, quantity: 1 }));
        }
      });

      return nextCart;
    });
    setWishlist([]);
    setActiveDrawer("cart");
  };

  return (
    <div className="collection-drawer-actions">
      <div className="collection-drawer-total">
        <span>{activeDrawer === "wishlist" ? "Wishlist total" : "Cart total"}</span>
        <strong>{formatCurrencyPrice(total, currency)} {currency}</strong>
      </div>
      {activeDrawer === "wishlist" ? (
        <button type="button" onClick={addWishlistToCart}>
          ADD TO CART
        </button>
      ) : (
        <button type="button" onClick={() => window.location.assign("/checkout")}>
          CHECKOUT
        </button>
      )}
    </div>
  );
};

export default CollectionDrawerActions;