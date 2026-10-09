export const currencyRates = {
  USD: { symbol: "$", rate: 1, flag: "https://flagcdn.com/w40/us.png" },
  GBP: { symbol: "£", rate: 0.79, flag: "https://flagcdn.com/w40/gb.png" },
  EUR: { symbol: "€", rate: 0.92, flag: "https://flagcdn.com/w40/eu.png" },
  LKR: { symbol: "Rs ", rate: 305, flag: "https://flagcdn.com/w40/lk.png" },
  AED: { symbol: "د.إ ", rate: 3.67, flag: "https://flagcdn.com/w40/ae.png" }
};

export const getCurrentCurrency = () => {
  const savedCurrency = window.localStorage.getItem("ceylon-currency");
  return Object.hasOwn(currencyRates, savedCurrency) ? savedCurrency : "USD";
};

export const formatCurrencyPrice = (usdAmount, currency = "USD") => {
  const selectedCurrency = currencyRates[currency] || currencyRates.USD;
  const amount = typeof usdAmount === "number"
    ? usdAmount
    : Number(String(usdAmount ?? "").replace(/[^0-9.-]/g, ""));
  const convertedAmount = Number.isFinite(amount)
    ? Math.round(amount * selectedCurrency.rate)
    : 0;

  return `${selectedCurrency.symbol}${convertedAmount.toLocaleString("en-US")}`;
};
