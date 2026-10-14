const getLocalDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const isProductOfferActive = (product, now = new Date()) => {
  const discountRate = Number(product?.discountRate ?? product?.offer_rate);
  const hasValidRate =
    Number.isFinite(discountRate) && discountRate >= 1 && discountRate <= 100;
  const hasOfferLabel = Boolean((product?.discountLabel ?? product?.discount_label)?.trim());
  if (!hasValidRate && !hasOfferLabel) {
    return false;
  }

  const today = getLocalDateKey(now);
  const startDate = getProductOfferDate(product, "start");
  const endDate = getProductOfferDate(product, "end");

  return (!startDate || today >= startDate) && (!endDate || today <= endDate);
};

const getProductOfferDate = (product, edge) => {
  const value = edge === "start"
    ? product?.offerStartDate ?? product?.offer_start_date
    : product?.offerEndDate ?? product?.offer_end_date;
  return typeof value === "string" ? value.slice(0, 10) : "";
};

export const formatProductOfferEndDate = (product) => {
  const endDate = getProductOfferDate(product, "end");
  if (!endDate) return "";

  const parsedDate = new Date(`${endDate}T00:00:00`);
  return Number.isNaN(parsedDate.getTime())
    ? ""
    : parsedDate.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
};

export const withActiveProductOffer = (product, now = new Date()) => {
  if (isProductOfferActive(product, now)) return product;
  return { ...product, discountRate: null, offer_rate: null, discountLabel: "", discount_label: "" };
};
