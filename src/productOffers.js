const getLocalDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const isProductOfferActive = (product, now = new Date()) => {
  const discountRate = Number(product?.discountRate);
  const hasValidRate =
    Number.isFinite(discountRate) && discountRate >= 1 && discountRate <= 100;
  const hasOfferLabel = Boolean(product?.discountLabel?.trim());
  if (!hasValidRate && !hasOfferLabel) {
    return false;
  }

  const today = getLocalDateKey(now);
  const startDate = product.offerStartDate || "";
  const endDate = product.offerEndDate || "";

  return (!startDate || today >= startDate) && (!endDate || today <= endDate);
};

export const withActiveProductOffer = (product, now = new Date()) => {
  if (isProductOfferActive(product, now)) return product;
  return { ...product, discountRate: null, discountLabel: "" };
};
