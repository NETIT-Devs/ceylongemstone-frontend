import { FaGem, FaTimes, FaTrash } from "react-icons/fa";
import { getCollectionItemKey } from "../useSharedCollection.js";
import CollectionDrawerActions from "./CollectionDrawerActions.jsx";

const CollectionDrawerPanel = ({
  activeDrawer,
  setActiveDrawer,
  wishlist,
  setWishlist,
  cart,
  setCart
}) => {
  if (!activeDrawer) return null;

  const items = activeDrawer === "wishlist" ? wishlist : cart;

  const removeItem = (productKey) => {
    const setItems = activeDrawer === "wishlist" ? setWishlist : setCart;
    setItems((current) => current.filter(
      (item) => getCollectionItemKey(item) !== productKey
    ));
  };

  return (
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
          {items.length === 0 ? (
            <div className="drawer-empty">
              <FaGem />
              <p>Your {activeDrawer} is empty.</p>
            </div>
          ) : (
            items.map((item) => {
              const key = getCollectionItemKey(item);

              return (
                <div className="drawer-item" key={key}>
                  <img src={item.image} alt={item.name} />
                  <div className="gem-drawer-item-info">
                    <h4>{item.name}</h4>
                    <p>{item.carat} Ct</p>
                    <strong>${Number(item.price || 0).toLocaleString("en-US")}</strong>
                    <p>Qty 1</p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${item.name}`}
                    onClick={() => removeItem(key)}
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
    </div>
  );
};

export default CollectionDrawerPanel;