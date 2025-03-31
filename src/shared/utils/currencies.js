/**
 * List of all supported currencies in the application
 */
export const AVAILABLE_CURRENCIES = [
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
];

/**
 * Get a currency object by currency code
 * @param {string} code Currency code
 * @returns Currency object or undefined if not found
 */
export const getCurrencyByCode = (code) => {
  return AVAILABLE_CURRENCIES.find(currency => currency.code === code);
};

/**
 * Format a number as a currency
 * @param {number} amount Amount to format
 * @param {string} currencyCode Currency code
 * @param {object} options Formatting options
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (
  amount,
  currencyCode = "IDR",
  options = {}
) => {
  const currency = getCurrencyByCode(currencyCode);
  
  if (!currency) {
    return `${amount} ${currencyCode}`;
  }

  // Determine decimal places based on currency
  // Most currencies use 2 decimal places, but JPY uses 0
  const decimals = currencyCode === "JPY" ? 0 : 2;
  
  // Format the number with commas
  const formattedNumber = amount.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    ...options
  });

  // Indonesian Rupiah typically shows the symbol first without a space
  if (currencyCode === "IDR") {
    return `${currency.symbol}${formattedNumber}`;
  }
  
  // For other currencies, follow their typical convention
  return `${currency.symbol}${formattedNumber}`;
};

/**
 * Convert an amount from one currency to another
 * This is a simplified version - a real implementation would use exchange rates API
 * @param {number} amount Amount to convert
 * @param {string} fromCurrency Currency code to convert from
 * @param {string} toCurrency Currency code to convert to
 * @param {number} conversionRate Exchange rate (if provided)
 * @returns {number} Converted amount
 */
export const convertCurrency = (
  amount,
  fromCurrency,
  toCurrency,
  conversionRate = null
) => {
  // If currencies are the same, no conversion needed
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  // If conversion rate is provided, use it
  if (conversionRate !== null) {
    return amount * conversionRate;
  }
  
  // In a real app, you would fetch the latest exchange rate from an API
  // This is just a placeholder implementation
  console.warn("No conversion rate provided, using placeholder implementation");
  
  // Example placeholder conversion rates
  const placeholderRates = {
    "IDR_USD": 0.000064, // 1 IDR = 0.000064 USD
    "USD_IDR": 15625,    // 1 USD = 15625 IDR
    "EUR_USD": 1.08,     // 1 EUR = 1.08 USD
    "USD_EUR": 0.93,     // 1 USD = 0.93 EUR
    // Add more as needed
  };
  
  const rateKey = `${fromCurrency}_${toCurrency}`;
  const inverseRateKey = `${toCurrency}_${fromCurrency}`;
  
  if (placeholderRates[rateKey]) {
    return amount * placeholderRates[rateKey];
  } else if (placeholderRates[inverseRateKey]) {
    return amount / placeholderRates[inverseRateKey];
  }
  
  // If no conversion rate found, return the original amount
  console.error(`No conversion rate found for ${fromCurrency} to ${toCurrency}`);
  return amount;
};

export default {
  AVAILABLE_CURRENCIES,
  getCurrencyByCode,
  formatCurrency,
  convertCurrency
};