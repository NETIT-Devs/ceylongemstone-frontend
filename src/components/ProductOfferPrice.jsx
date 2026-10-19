import { formatCurrencyPrice } from "../currency.js";
import { getProductOfferPricing } from "../productOffers.js";
import "./ProductOfferPrice.css";

const ProductOfferPrice = ({
  item,
  currency = "USD",
  quantity = 1,
  displayPrice
}) => {
  const pricing = getProductOfferPricing(item);
  const currentPrice = displayPrice === undefined
    ? pricing.currentPrice
    : Number(displayPrice);
  const multiplier = Number(quantity) || 1;
  const hasSavings = currentPrice < pricing.originalPrice;
  const offerLabel = pricing.discountRate
    ? `${pricing.discountRate}% OFF`
    : pricing.discountLabel;

  return (
    <span className="product-offer-price">
      {hasSavings && (
        <del>{formatCurrencyPrice(pricing.originalPrice * multiplier, currency)}</del>
      )}
      <strong>{formatCurrencyPrice(currentPrice * multiplier, currency)}</strong>
      {hasSavings && offerLabel && <small>{offerLabel}</small>}
    </span>
  );
};

export default ProductOfferPrice;
