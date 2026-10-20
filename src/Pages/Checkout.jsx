import { useEffect, useRef, useState } from "react";
import ShopNavDropdown from "../components/ShopNavDropdown.jsx";
import BrandLogo from "../components/BrandLogo.jsx";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaEnvelope,
  FaFacebookF,
  FaHeart,
  FaInstagram,
  FaLock,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaShoppingBag,
  FaTimes,
  FaUser,
  FaWhatsapp
} from "react-icons/fa";
import {
  getCollectionItemKey,
  useSharedCollection
} from "../useSharedCollection.js";
import { useGemInventory } from "../useGemInventory.js";
import { products } from "./Gemstones.jsx";
import { withActiveProductOffer } from "../productOffers.js";
import ProductOfferPrice from "../components/ProductOfferPrice.jsx";
import InternationalNavEntry from "../components/InternationalNavEntry.jsx";
import { apiGet, apiPost, resolveMediaUrl } from "../services/api.js";
import { currencyRates, getCurrentCurrency } from "../currency.js";
import "./Checkout.css";
import MobileSiteMenu from "../components/MobileSiteMenu.jsx";

const formatPrice = (price) =>
  Number(price || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  });

const formatSummaryPrice = (usdAmount, currency) => {
  const selectedCurrency = currencyRates[currency] || currencyRates.USD;
  const amount = Number(usdAmount || 0) * selectedCurrency.rate;
  const fractionDigits = currency === "USD" || currency === "GBP" || currency === "EUR"
    ? 2
    : 0;
  return `${selectedCurrency.symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  })}`;
};

const normalizeCountry = (country) => String(country || "").trim().toLocaleLowerCase();

const formatEstimatedDays = (estimatedDays) => {
  const value = String(estimatedDays || "").trim();
  if (!value || /(?:business\s+)?days$/i.test(value)) return value;
  return `${value} days`;
};

const getCheckoutPriceBreakdown = (item) => {
  const offerItem = withActiveProductOffer(item);
  const originalUnitPrice = Number(item.basePriceUSD ?? item.price ?? 0);
  const existingUnitPrice = Number(item.price ?? 0);
  const discountRate = Number(offerItem.discountRate ?? offerItem.offer_rate);
  const hasActiveDiscount =
    Number.isFinite(discountRate) && discountRate >= 1 && discountRate <= 100;
  const discountedUnitPrice = hasActiveDiscount
    ? Math.min(
        existingUnitPrice,
        Math.round(originalUnitPrice * (1 - discountRate / 100))
      )
    : existingUnitPrice;
  const quantity = Number(item.quantity) || 1;

  return {
    item,
    originalUnitPrice,
    unitPrice: discountedUnitPrice,
    quantity,
    originalTotal: originalUnitPrice * quantity,
    discountedTotal: discountedUnitPrice * quantity
  };
};

const Checkout = () => {
  const [displayCurrency, setDisplayCurrency] = useState(getCurrentCurrency);
  const [showMyOrdersLink] = useState(() => {
    try {
      const customer = JSON.parse(
        window.localStorage.getItem("ceylon-user") || "null"
      );
      return customer?.loggedIn === true;
    } catch {
      return false;
    }
  });
  const [wishlist] = useSharedCollection("ceylon-wishlist");
  const [cart, setCart] = useSharedCollection("ceylon-cart");
  const [inventory, setInventory] = useGemInventory(products);
  const [notice, setNotice] = useState("");
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [shippingMethodsLoading, setShippingMethodsLoading] = useState(true);
  const [shippingMethodsError, setShippingMethodsError] = useState("");
  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState("");
  const [shippingCountry, setShippingCountry] = useState("Sri Lanka");
  const [shippingCostConversion, setShippingCostConversion] = useState(null);
  const orderSubmitted = useRef(false);

  useEffect(() => {
    const syncCurrency = () => setDisplayCurrency(getCurrentCurrency());
    window.addEventListener("ceylon-currency-change", syncCurrency);
    window.addEventListener("storage", syncCurrency);
    return () => {
      window.removeEventListener("ceylon-currency-change", syncCurrency);
      window.removeEventListener("storage", syncCurrency);
    };
  }, []);

  const availableShippingMethods = shippingMethods.filter(
    (method) => normalizeCountry(method.country) === normalizeCountry(shippingCountry)
  );
  const cartPriceBreakdown = cart.map(getCheckoutPriceBreakdown);
  const itemTotal = cartPriceBreakdown.reduce(
    (sum, line) => sum + line.discountedTotal,
    0
  );
  const originalItemTotal = cartPriceBreakdown.reduce(
    (sum, line) => sum + line.originalTotal,
    0
  );
  const discountTotal = Math.max(0, originalItemTotal - itemTotal);
  const selectedShippingMethod = availableShippingMethods.find(
    (method) => String(method.id) === String(selectedShippingMethodId)
  );
  const selectedShippingAmount = Number(selectedShippingMethod?.shipping_cost);
  const selectedShippingCurrency = String(selectedShippingMethod?.currency || "USD").toUpperCase();
  const isFreeShipping =
    selectedShippingMethod?.free_shipping === true ||
    Number(selectedShippingMethod?.free_shipping) === 1;
  const needsShippingConversion =
    selectedShippingMethod &&
    !isFreeShipping &&
    Number.isFinite(selectedShippingAmount) &&
    selectedShippingAmount > 0 &&
    selectedShippingCurrency !== "USD";
  const currentShippingConversion =
    shippingCostConversion?.methodId === String(selectedShippingMethod?.id)
      ? shippingCostConversion
      : null;
  const shippingCostLoading =
    Boolean(needsShippingConversion) &&
    (!currentShippingConversion || currentShippingConversion.status === "loading");
  const shippingCostError =
    selectedShippingMethod && (!Number.isFinite(selectedShippingAmount) || selectedShippingAmount < 0)
      ? "The selected shipping method has an invalid shipping cost."
      : currentShippingConversion?.status === "error"
        ? currentShippingConversion.error
        : "";
  const shippingCostUsd = !selectedShippingMethod || isFreeShipping || selectedShippingAmount === 0
    ? 0
    : selectedShippingCurrency === "USD"
      ? selectedShippingAmount
      : currentShippingConversion?.status === "success"
        ? currentShippingConversion.amount
        : 0;
  const shippingCostIsCurrent =
    selectedShippingMethod &&
    !shippingCostLoading &&
    !shippingCostError;
  const total = itemTotal + (shippingCostIsCurrent ? shippingCostUsd : 0);
  const summaryItems = completedOrder?.items || cartPriceBreakdown.map((line) => ({
    ...line.item,
    price: line.unitPrice
  }));
  const summaryItemSubtotal = completedOrder?.itemSubtotal ?? itemTotal;
  const summaryDiscountTotal = completedOrder?.discountTotal ?? discountTotal;
  const summaryOriginalItemSubtotal = summaryItemSubtotal + summaryDiscountTotal;
  const summaryShippingMethod = completedOrder?.shippingMethod || selectedShippingMethod?.shipping_method;
  const summaryShippingCost = completedOrder?.shippingCost ??
    (shippingCostIsCurrent ? shippingCostUsd : 0);
  const summaryTotal = completedOrder?.total ?? total;

  useEffect(() => {
    let isActive = true;
    const loadShippingMethods = async () => {
      setShippingMethodsLoading(true);
      setShippingMethodsError("");
      try {
        const response = await apiGet("/api/shipping-methods");
        let data;
        try {
          data = await response.json();
        } catch {
          throw new Error("The shipping service returned an invalid response.");
        }
        if (!response.ok || data?.success !== true || !Array.isArray(data.shipping_methods)) {
          throw new Error(data?.message || "Unable to load shipping methods.");
        }

        const activeMethods = data.shipping_methods.filter(
          (method) => Number(method.status) === 1
        );
        if (isActive) {
          setShippingMethods(activeMethods);
          const countryMethods = activeMethods.filter(
            (method) => normalizeCountry(method.country) === normalizeCountry("Sri Lanka")
          );
          setSelectedShippingMethodId((currentId) =>
            countryMethods.some((method) => String(method.id) === String(currentId))
              ? currentId
              : String(countryMethods[0]?.id || "")
          );
        }
      } catch (error) {
        if (isActive) {
          setShippingMethods([]);
          setSelectedShippingMethodId("");
          setShippingMethodsError(error instanceof Error ? error.message : "Unable to load shipping methods.");
        }
      } finally {
        if (isActive) setShippingMethodsLoading(false);
      }
    };

    loadShippingMethods();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!needsShippingConversion) {
      return undefined;
    }

    let isActive = true;
    const convertShippingCost = async () => {
      const methodId = String(selectedShippingMethod.id);
      setShippingCostConversion({ methodId, status: "loading", amount: 0, error: "" });
      try {
        const query = new URLSearchParams({
          from: selectedShippingCurrency,
          to: "USD",
          amount: String(selectedShippingAmount)
        });
        const response = await apiGet(`/api/currency/convert?${query}`);
        let data;
        try {
          data = await response.json();
        } catch {
          throw new Error("The currency service returned an invalid response.");
        }
        if (!response.ok || data?.success !== true || !Number.isFinite(Number(data.converted_amount))) {
          throw new Error(data?.message || "Unable to convert the shipping cost to USD.");
        }
        if (isActive) {
          setShippingCostConversion({
            methodId,
            status: "success",
            amount: Number(data.converted_amount),
            error: ""
          });
        }
      } catch (error) {
        if (isActive) {
          setShippingCostConversion({
            methodId,
            status: "error",
            amount: 0,
            error: error instanceof Error ? error.message : "Unable to convert the shipping cost to USD."
          });
        }
      }
    };

    convertShippingCost();
    return () => {
      isActive = false;
    };
  }, [needsShippingConversion, selectedShippingAmount, selectedShippingCurrency, selectedShippingMethod]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (orderSubmitted.current) return;
    if (!selectedShippingMethod || shippingMethodsError || shippingCostError || !shippingCostIsCurrent) {
      setNotice(shippingMethodsError || shippingCostError || "Please select an available shipping method.");
      return;
    }

    const user = (() => {
      try { return JSON.parse(window.localStorage.getItem("ceylon-user") || "null"); }
      catch { return null; }
    })();
    const getAvailableQuantity = (item) => {
      const inventoryQuantity = inventory[getCollectionItemKey(item)];
      if (inventoryQuantity !== undefined && Number.isFinite(Number(inventoryQuantity))) {
        return Number(inventoryQuantity);
      }

      const productQuantity = Number(item.stockQuantity);
      return Number.isFinite(productQuantity) ? productQuantity : 0;
    };
    const unavailableItem = user?.id
      ? null
      : cart.find((item) => {
        return (Number(item.quantity) || 1) > getAvailableQuantity(item);
      });

    if (unavailableItem) {
      setNotice(
        `${unavailableItem.name} has only ${getAvailableQuantity(unavailableItem)} available. Please update your cart.`
      );
      return;
    }

    const formData = new FormData(event.currentTarget);
    let orderId = `CRG-${Date.now()}`;
    const orderDate = new Date().toISOString();
    const country = String(formData.get("country") || "");
    const shippingAddress = [
      formData.get("address"),
      formData.get("city"),
      formData.get("postal"),
      country
    ].filter(Boolean).join(", ");
    let confirmedOrder = null;

    if (user?.id) {
      try {
        const items = cart.map((item) => {
          const itemType =
            item.itemType ||
            item.item_type ||
            (item.rawId != null
              ? "jewellery"
              : item.inventoryId != null
                ? "gemstone"
                : null);
          const productId = itemType === "jewellery"
            ? item.rawId ?? (String(item.id).startsWith("db-")
              ? String(item.id).slice(3)
              : item.id)
            : item.inventoryId ?? item.id;

          return {
            item_type: itemType,
            product_id: Number(productId),
            quantity: Number(item.quantity) || 1
          };
        });

        if (items.some((item) =>
          !["gemstone", "jewellery"].includes(item.item_type) ||
          !Number.isSafeInteger(item.product_id) ||
          item.product_id < 1
        )) {
          throw new Error("Your cart has an item that is not linked to database inventory. Remove it and add it again from the shop.");
        }

        const response = await apiPost("/api/checkout", {
          currency: "USD",
          shipping_address: shippingAddress,
          shipping_method_id: Number(selectedShippingMethod.id),
          items
        });
        let result;
        try {
          result = await response.json();
        } catch {
          throw new Error("The checkout service returned an invalid response.");
        }
        if (!response.ok || result?.success !== true) {
          throw new Error(result?.message || "Unable to complete checkout.");
        }

        orderId = result.order_number || orderId;
        confirmedOrder = result;
      } catch (error) {
        setNotice(error instanceof Error ? error.message : "Unable to complete checkout.");
        return;
      }
    }

    const confirmedItems = Array.isArray(confirmedOrder?.items)
      ? confirmedOrder.items.map((item, index) => ({
          ...cart[index],
          ...item,
          basePriceUSD:
            cart[index]?.basePriceUSD ??
            Number(cart[index]?.price ?? item.price ?? 0),
          discountRate:
            cart[index]?.discountRate ?? item.discountRate,
          discountLabel:
            cart[index]?.discountLabel ?? item.discountLabel,
          offer_rate: cart[index]?.offer_rate ?? item.offer_rate,
          offer_start_date:
            cart[index]?.offer_start_date ?? item.offer_start_date,
          offer_end_date:
            cart[index]?.offer_end_date ?? item.offer_end_date
        }))
      : cartPriceBreakdown.map((line) => ({
          ...line.item,
          price: line.unitPrice
        }));
    const confirmedSubtotal = confirmedItems.reduce(
      (sum, item) =>
        sum + Number(item.price || 0) * (Number(item.quantity) || 1),
      0
    );
    const confirmedDiscountTotal = Math.max(
      0,
      originalItemTotal - confirmedSubtotal
    );
    const confirmedTotal = confirmedOrder
      ? Number(confirmedOrder.final_total)
      : total;
    const completedOrderSnapshot = {
      id: orderId,
      items: confirmedItems.map((item, index) => ({
        ...item,
        price: Number(item.price || 0),
        name: item.name || item.product_name,
        image: resolveMediaUrl(
          item.image || item.image_url || item.imageUrl || cart[index]?.image
        )
      })),
      itemSubtotal: confirmedSubtotal,
      discountTotal: confirmedDiscountTotal,
      originalItemSubtotal: confirmedSubtotal + confirmedDiscountTotal,
      shippingCost: confirmedOrder
        ? Number(confirmedOrder.shipping_cost)
        : shippingCostUsd,
      shippingMethod: selectedShippingMethod.shipping_method,
      total: confirmedTotal
    };
    const newOrder = {
      id: orderId,
      date: orderDate.slice(0, 10),
      status: "PROCESSING",
      statusColor: "status-dispatched",
      statusText: "Order received and being prepared",
      paymentStatus: `PENDING (${formatPrice(confirmedTotal)})`,
      totalAmount: confirmedTotal,
      shippingCost: confirmedOrder
        ? Number(confirmedOrder.shipping_cost)
        : shippingCostUsd,
      shippingMethod: selectedShippingMethod.shipping_method,
      trackingNumber: "Tracking details pending",
      estimatedDelivery: "To be confirmed",
      customerName: String(formData.get("name") || ""),
      customerEmail: String(formData.get("email") || ""),
      customerPhone: String(formData.get("phone") || ""),
      shippingAddress,
      items: confirmedItems.map((item, index) => ({
        name: item.name || item.product_name,
        carat: item.carat ? `${item.carat} Ct` : "Not provided",
        cut: item.cut || item.shape || "Not provided",
        origin: item.origin || "Ratnapura, Sri Lanka",
        certificateId: item.certificateNumber || "Certification pending",
        price: Number(item.price || 0),
        currency: item.currency || "USD",
        image: resolveMediaUrl(
          item.image || item.image_url || item.imageUrl || cart[index]?.image
        ),
        tag: item.tag || item.treatment || item.item_type?.toUpperCase() || "ORDER ITEM"
      })),
      timeline: [
        { step: "Order Placed & Confirmed", date: orderDate, completed: true },
        { step: "Gemological Lab Verification", date: "Pending", completed: false },
        { step: "Packaging & Dispatch", date: "Pending", completed: false },
        { step: "Delivery", date: "Pending", completed: false }
      ]
    };

    try {
      const currentUser = JSON.parse(window.localStorage.getItem("ceylon-user") || "null");
      const userEmail = currentUser?.email;
      const ordersKey = userEmail ? `ceylon-orders-${userEmail}` : "ceylon-orders";
      const savedOrders = JSON.parse(
        window.localStorage.getItem(ordersKey) || "[]"
      );
      if (!Array.isArray(savedOrders)) {
        throw new Error("Stored orders are not in a valid list format.");
      }
      window.localStorage.setItem(
        ordersKey,
        JSON.stringify([newOrder, ...savedOrders])
      );
    } catch (error) {
      console.error("Unable to save the order for My Orders.", error);
      setNotice(confirmedOrder
        ? `Order ${orderId} was placed, but this browser could not save the local order view.`
        : "Your order could not be saved. Please try again.");
      if (confirmedOrder) {
        orderSubmitted.current = true;
        setCompletedOrder(completedOrderSnapshot);
        setCart([]);
      }
      return;
    }

    orderSubmitted.current = true;
    setInventory((current) =>
      cart.reduce((updatedInventory, item) => {
        const productKey = getCollectionItemKey(item);
        return {
          ...updatedInventory,
          [productKey]: Math.max(
            0,
            (updatedInventory[productKey] ?? 0) - (Number(item.quantity) || 1)
          )
        };
      }, current)
    );
    setCart([]);
    setCompletedOrder(completedOrderSnapshot);
  };

  const handleInquirySubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const inquiry = [
      "Gemstone inquiry from the checkout page",
      `Name: ${formData.get("name")}`,
      `Email: ${formData.get("email")}`,
      `Phone: ${formData.get("phone")}`,
      `Inquiry: ${formData.get("message")}`
    ].join("\n");

    window.open(
      `https://wa.me/94712345678?text=${encodeURIComponent(inquiry)}`,
      "_blank",
      "noopener,noreferrer"
    );
    setIsInquiryOpen(false);
  };

  return (
    <div className="checkout-page">
      <nav className="about-navbar checkout-navbar">
        <a href="/" className="about-navbar-logo">
          <BrandLogo alt="Ceylon Royal Gemstones" />
          <div className="about-logo-text">
            <span>CEYLON</span>
            <small>ROYAL GEMSTONES</small>
          </div>
        </a>

        <MobileSiteMenu />
        <div className="about-nav-links">
          <a href="/">Home</a>
          <ShopNavDropdown />
          <a href="/About">Our Story</a>
          <a href="/trust">Certification</a>
          <a href="/reviews">Reviews</a>
          <a href="/blog">Blog</a>
          <a href="/contact">Contact</a>
          {/* {showMyOrdersLink && <a href="/my-orders">My Orders</a>} */}
          <InternationalNavEntry />
        </div>

        <div className="about-nav-actions">
          <InternationalNavEntry mobile />
          <a
            className="about-nav-icon"
            href="/gemstones#wishlist"
            aria-label={`Open wishlist, ${wishlist.reduce((sum, item) => sum + item.quantity, 0)} items`}
            title="Wishlist"
          >
            <FaHeart />
            {wishlist.length > 0 && (
              <span className="about-badge">
                {wishlist.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </a>
          {/* <a
            className="about-nav-icon"
            href="/gemstones#cart"
            aria-label={`Open cart, ${cart.reduce((sum, item) => sum + item.quantity, 0)} items`}
            title="Shopping Cart"
          >
            <FaShoppingBag />
            {cart.length > 0 && (
              <span className="about-badge">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </a> */}
          <a
            href="https://wa.me/94712345678"
            target="_blank"
            rel="noreferrer"
            className="about-inquire-btn"
          >
            INQUIRE NOW
          </a>
          <a
            href="/join-us"
            className="navbar-joinus-btn"
            title="Join With Us"
          >
            <span>JOIN US</span>
          </a>
          <a
            href="/login"
            className="navbar-login-btn"
            title="Login / Register"
          >
            <FaUser />
            <span>LOGIN</span>
          </a>
        </div>
      </nav>

      <main className="checkout-content">
        <div className="checkout-main">
          <a className="checkout-back" href="/gemstones">
            <FaArrowLeft /> Continue shopping
          </a>
          <p className="checkout-eyebrow">SECURE CHECKOUT</p>
          <h1>{completedOrder ? "Order confirmed" : "Shipping details"}</h1>

          {completedOrder ? (
            <section className="checkout-success" role="status" aria-labelledby="checkout-success-title">
              <FaCheckCircle className="checkout-success-icon" aria-hidden="true" />
              <p className="checkout-success-eyebrow">A NEW TREASURE IS ON ITS WAY</p>
              <h2 id="checkout-success-title">Thank you for your order</h2>
              <p className="checkout-success-message">
                Your order has been placed successfully. We’ll keep you updated as it is prepared.
              </p>
              <div className="checkout-success-order-id">
                <span>ORDER ID</span>
                <strong>{completedOrder.id}</strong>
              </div>
              {/* <a className="checkout-success-action" href="/my-orders">
                View My Orders
              </a> */}
            </section>
          ) : cart.length === 0 ? (
            <div className="checkout-empty">
              <p>Your cart is empty.</p>
              <a href="/gemstones">Explore gemstones</a>
            </div>
          ) : (
            <form className="checkout-form" onSubmit={handleSubmit}>
              <div className="checkout-fields">
                <label>Full name<input name="name" autoComplete="name" required /></label>
                <label>Email address<input name="email" type="email" autoComplete="email" required /></label>
                <label>Phone<input name="phone" type="tel" autoComplete="tel" required /></label>
                <label>
                  Country
                  <input
                    name="country"
                    autoComplete="country-name"
                    value={shippingCountry}
                    onChange={(event) => {
                      const country = event.target.value;
                      const countryMethods = shippingMethods.filter(
                        (method) => normalizeCountry(method.country) === normalizeCountry(country)
                      );
                      setShippingCountry(country);
                      setSelectedShippingMethodId(String(countryMethods[0]?.id || ""));
                    }}
                    required
                  />
                </label>
                <label className="checkout-field-wide">
                  Shipping method
                  <select
                    name="shipping_method_id"
                    value={selectedShippingMethodId}
                    onChange={(event) => setSelectedShippingMethodId(event.target.value)}
                    disabled={shippingMethodsLoading || availableShippingMethods.length === 0}
                    required
                  >
                    <option value="">
                      {shippingMethodsLoading
                        ? "Loading shipping methods…"
                        : availableShippingMethods.length
                          ? "Select a shipping method"
                          : "No shipping methods for this country"}
                    </option>
                    {availableShippingMethods.map((method) => (
                      <option key={method.id} value={method.id}>
                        {method.shipping_method} — {method.free_shipping === true || Number(method.free_shipping) === 1
                          ? "Free shipping"
                          : `${Number(method.shipping_cost).toLocaleString()} ${method.currency || "USD"}`}
                        {method.estimated_days
                          ? ` (${formatEstimatedDays(method.estimated_days)})`
                          : ""}
                      </option>
                    ))}
                  </select>
                  {shippingMethodsError && <span role="alert">{shippingMethodsError}</span>}
                  {!shippingMethodsLoading && !shippingMethodsError && availableShippingMethods.length === 0 && (
                    <span role="alert">No active shipping methods are available for this country.</span>
                  )}
                  {shippingCostLoading && <span role="status">Calculating shipping cost…</span>}
                  {shippingCostError && <span role="alert">{shippingCostError}</span>}
                </label>
                <label className="checkout-field-wide">Street address<input name="address" autoComplete="street-address" required /></label>
                <label>City<input name="city" autoComplete="address-level2" required /></label>
                <label>Postal code<input name="postal" autoComplete="postal-code" required /></label>
              </div>
              <button
                className="checkout-pay"
                type="submit"
                disabled={
                  shippingMethodsLoading ||
                  !selectedShippingMethod ||
                  !shippingCostIsCurrent
                }
              >
                <FaLock /> PLACE ORDER
              </button>
            </form>
          )}
          {notice && !completedOrder && (
            <div className="checkout-notice" role="status">
              <p>{notice}</p>
            </div>
          )}
        </div>

        <aside className="checkout-summary">
          <h2>{completedOrder ? "Your order" : "Order summary"}</h2>
          {summaryItems.map((item) => (
            <div className="checkout-item" key={item.productKey || item.id || item.name}>
              <img
                src={item.image || item.image_url || item.imageUrl
                  ? resolveMediaUrl(item.image || item.image_url || item.imageUrl)
                  : ""}
                alt={item.name}
              />
              <div>
                <strong>{item.name}</strong>
                <span>Qty {Number(item.quantity) || 1}</span>
              </div>
              <ProductOfferPrice
                item={item}
                currency={displayCurrency}
                quantity={Number(item.quantity) || 1}
                displayPrice={Number(item.price || 0)}
              />
            </div>
          ))}
          <div className="checkout-total">
            <span>Items subtotal</span>
            <strong>{formatSummaryPrice(
              summaryDiscountTotal > 0
                ? summaryOriginalItemSubtotal
                : summaryItemSubtotal,
              displayCurrency
            )}</strong>
          </div>
          {summaryDiscountTotal > 0 && (
            <>
              <div className="checkout-total checkout-discount-total">
                <span>Discount</span>
                <strong>−{formatSummaryPrice(summaryDiscountTotal, displayCurrency)}</strong>
              </div>
              <div className="checkout-total">
                <span>Discounted items total</span>
                <strong>{formatSummaryPrice(summaryItemSubtotal, displayCurrency)}</strong>
              </div>
            </>
          )}
          <div className="checkout-total">
            <span>Shipping{summaryShippingMethod ? ` · ${summaryShippingMethod}` : ""}</span>
            <strong>
              {!completedOrder && shippingCostLoading
                ? "Calculating…"
                : summaryShippingMethod
                  ? formatSummaryPrice(summaryShippingCost, displayCurrency)
                  : "Select a method"}
            </strong>
          </div>
          <div className="checkout-total">
            <span>Total</span>
            <strong>{formatSummaryPrice(summaryTotal, displayCurrency)}</strong>
          </div>
          {!completedOrder && (
            <p className="checkout-secure"><FaLock /> Your details are kept private.</p>
          )}
        </aside>
      </main>

      <footer className="about-footer">
        <div className="about-footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <BrandLogo alt="Ceylon Royal Gemstones" />
              <div>
                <strong>CEYLON</strong>
                <small>ROYAL GEMSTONES</small>
              </div>
            </div>
            <p>
              Discover the timeless beauty of authentic Sri Lankan gemstones,
              carefully sourced, crafted and presented with royal elegance.
            </p>
          </div>

          <div>
            <h4>EXPLORE</h4>
            <a href="/">Home</a>
            <a href="/gemstones">Shop</a>
            <a href="/About">Our Story</a>
            <a href="/trust">Trust &amp; Certification</a>
            <a href="/reviews">Reviews</a>
            <a href="/contact">Contact</a>
          </div>

          <div>
            <h4>CONTACT</h4>
            <a href="tel:+94712345678"><FaPhoneAlt /> +94 71 234 5678</a>
            <a href="mailto:info@ceylonroyalgemstones.com">
              <FaEnvelope /> info@ceylonroyalgemstones.com
            </a>
            <a href="https://wa.me/94712345678" target="_blank" rel="noreferrer">
              <FaWhatsapp /> WhatsApp
            </a>
            <a href="#"><FaMapMarkerAlt /> Ratnapura, Sri Lanka</a>
          </div>

          <div>
            <h4>FOLLOW US</h4>
            <p>Follow our journey and discover the world of Ceylon gemstones.</p>
            <div className="footer-social-icons">
              <a href="#" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" aria-label="Facebook"><FaFacebookF /></a>
              <a href="https://wa.me/94712345678" target="_blank" rel="noreferrer" aria-label="WhatsApp">
                <FaWhatsapp />
              </a>
            </div>
          </div>
        </div>
        <div className="about-footer-bottom">
          <p>Copyright © 2026 Powered by NETIT Technology</p>
          <span>NATURAL • AUTHENTIC • CEYLON</span>
        </div>
      </footer>

      {isInquiryOpen && (
        <div
          className="about-modal-backdrop"
          onClick={() => setIsInquiryOpen(false)}
        >
          <section
            className="about-inquiry-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-inquiry-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="about-modal-close"
              type="button"
              aria-label="Close inquiry form"
              onClick={() => setIsInquiryOpen(false)}
            >
              <FaTimes />
            </button>
            <BrandLogo
              className="about-modal-logo"
              alt="Ceylon Royal Gemstones"
            />
            <span>PRIVATE GEMSTONE INQUIRY</span>
            <h3 id="checkout-inquiry-title">Contact Our Team</h3>
            <p>Send your gemstone question to our team.</p>
            <form onSubmit={handleInquirySubmit}>
              <input type="text" name="name" placeholder="Your Full Name" autoComplete="name" required />
              <input type="email" name="email" placeholder="Email Address" autoComplete="email" required />
              <input type="tel" name="phone" placeholder="WhatsApp / Phone Number" autoComplete="tel" required />
              <textarea name="message" placeholder="Tell us about your requirements..." rows="4" required />
              <button type="submit">SEND INQUIRY VIA WHATSAPP</button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default Checkout;