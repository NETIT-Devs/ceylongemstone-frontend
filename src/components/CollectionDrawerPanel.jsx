import { createPortal } from "react-dom";
import { FaGem, FaTimes, FaTrash } from "react-icons/fa";
import { getCollectionItemKey } from "../useSharedCollection.js";
import { useCustomerCart } from "../services/customerCart.js";
import { getCurrentCurrency } from "../currency.js";
import CollectionDrawerActions from "./CollectionDrawerActions.jsx";
import ProductOfferPrice from "./ProductOfferPrice.jsx";

const CollectionDrawerPanel = ({
  activeDrawer,
  setActiveDrawer,
  wishlist,
  setWishlist,
  cart,
  setCart
}) => {
  const {
    isLoading,
    error: cartError,
    deletingCartIds,
    removeCartItem
  } = useCustomerCart(activeDrawer === "cart", setCart);

  if (!activeDrawer) return null;

  const items = activeDrawer === "wishlist" ? wishlist : cart;

  const removeItem = (item) => {
    if (activeDrawer === "cart") {
      void removeCartItem(item);
      return;
    }

    setWishlist((current) => current.filter(
      (entry) => getCollectionItemKey(entry) !== getCollectionItemKey(item)
    ));
  };

  return createPortal(
    <div className="gem-drawer-backdrop" onClick={() => setActiveDrawer(null)}>
      <aside
        className="gem-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="page-collection-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="gem-drawer-header">
          <h3 id="page-collection-title">
            {activeDrawer === "wishlist" ? "Wishlist" : "Shopping Cart"}
          </h3>
          <button
            type="button"
            aria-label="Close collection drawer"
            onClick={() => setActiveDrawer(null)}
          >
            <FaTimes />
          </button>
        </div>

        <div className="gem-drawer-body">
          {activeDrawer === "cart" && isLoading && (
            <p role="status">Loading your saved cart...</p>
          )}
          {activeDrawer === "cart" && cartError && (
            <p role="alert">{cartError}</p>
          )}
          {items.length === 0 ? (
            activeDrawer === "cart" && isLoading ? null : (
            <div className="drawer-empty">
              <FaGem />
              <p>Your {activeDrawer} is empty.</p>
            </div>
            )
          ) : (
            items.map((item) => {
              const key = getCollectionItemKey(item);

              return (
                <div className="drawer-item" key={key}>
                  <img src={item.image} alt={item.name} />
                  <div className="gem-drawer-item-info">
                    <h4>{item.name}</h4>
                    {item.carat ? <p>{item.carat} Ct</p> : null}
                    <ProductOfferPrice item={item} currency={getCurrentCurrency()} />
                    <p>Qty {Number(item.quantity) || 1}</p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${item.name}`}
                    disabled={Boolean(item.cartId && deletingCartIds.includes(item.cartId))}
                    onClick={() => removeItem(item)}
                  >
                    <FaTrash />
                  </button>
                </div>
              );
            })
          )}
        </div>

        <CollectionDrawerActions
          activeDrawer={activeDrawer}
          wishlist={wishlist}
          cart={cart}
          setWishlist={setWishlist}
          setCart={setCart}
          setActiveDrawer={setActiveDrawer}
        />
      </aside>
    </div>,
    document.body
  );
};

export default CollectionDrawerPanel;