import axiosInstance from "../lib/axios";

/**
 * Service for handling currency-related API calls
 */
const currencyService = {
  /**
   * Get available currencies from the API
   * @returns {Promise<Array>} List of available currencies
   */
  getAvailableCurrencies: async () => {
    try {
      const response = await axiosInstance.get("/api/currencies");
      
      if (response.data.success) {
        return {
          success: true,
          currencies: response.data.currencies
        };
      }
      
      return { 
        success: false, 
        currencies: [] 
      };
    } catch (error) {
      console.error("Error fetching currencies:", error);
      return { 
        success: false, 
        currencies: [] 
      };
    }
  },
  
  /**
   * Format a number as a currency with the given currency code
   * @param {number} amount - The amount to format
   * @param {string} currencyCode - The currency code (e.g., "USD", "IDR")
   * @returns {string} - Formatted currency string
   */
  formatCurrency: (amount, currencyCode = "IDR") => {
    // Define currency formatting options
    const currencyOptions = {
      IDR: { symbol: "Rp", decimals: 0, symbolPosition: "before" },
      USD: { symbol: "$", decimals: 2, symbolPosition: "before" },
      EUR: { symbol: "€", decimals: 2, symbolPosition: "before" },
      GBP: { symbol: "£", decimals: 2, symbolPosition: "before" },
      JPY: { symbol: "¥", decimals: 0, symbolPosition: "before" },
      SGD: { symbol: "S$", decimals: 2, symbolPosition: "before" },
      AUD: { symbol: "A$", decimals: 2, symbolPosition: "before" },
      CNY: { symbol: "¥", decimals: 2, symbolPosition: "before" },
    };
    
    // Get currency options or use default (USD)
    const options = currencyOptions[currencyCode] || currencyOptions.USD;
    
    // Format number with appropriate decimal places
    const formattedNumber = amount.toLocaleString(undefined, {
      minimumFractionDigits: options.decimals,
      maximumFractionDigits: options.decimals,
    });
    
    // Return formatted currency string with symbol
    return options.symbolPosition === "before"
      ? `${options.symbol}${formattedNumber}`
      : `${formattedNumber} ${options.symbol}`;
  },
  
  /**
   * Convert an amount from one currency to another
   * This is a simplified implementation - in a real app, you would use exchange rate API
   * @param {number} amount - The amount to convert
   * @param {string} fromCurrency - Source currency code
   * @param {string} toCurrency - Target currency code
   * @param {number|null} exchangeRate - Optional exchange rate to use
   * @returns {number} - Converted amount
   */
  convertCurrency: (amount, fromCurrency, toCurrency, exchangeRate = null) => {
    // If currencies are the same, no conversion needed
    if (fromCurrency === toCurrency) {
      return amount;
    }
    
    // If exchange rate is provided, use it
    if (exchangeRate !== null) {
      return amount * exchangeRate;
    }
    
    // Otherwise use placeholder rates (this should be replaced with API call in production)
    const placeholderRates = {
      "IDR_USD": 0.000064, // 1 IDR = 0.000064 USD
      "USD_IDR": 15625,    // 1 USD = 15625 IDR
      "EUR_USD": 1.08,     // 1 EUR = 1.08 USD
      "USD_EUR": 0.93,     // 1 USD = 0.93 EUR
      "IDR_EUR": 0.000059, // 1 IDR = 0.000059 EUR
      "EUR_IDR": 16950,    // 1 EUR = 16950 IDR
      // Add more rates as needed
    };
    
    const rateKey = `${fromCurrency}_${toCurrency}`;
    const inverseRateKey = `${toCurrency}_${fromCurrency}`;
    
    if (placeholderRates[rateKey]) {
      return amount * placeholderRates[rateKey];
    } else if (placeholderRates[inverseRateKey]) {
      return amount / placeholderRates[inverseRateKey];
    }
    
    // If no direct conversion is found, try to convert via USD as intermediate
    if (fromCurrency !== "USD" && toCurrency !== "USD") {
      // Convert from source currency to USD
      const amountInUSD = currencyService.convertCurrency(amount, fromCurrency, "USD");
      // Convert from USD to target currency
      return currencyService.convertCurrency(amountInUSD, "USD", toCurrency);
    }
    
    // If all else fails, return the original amount
    console.warn(`No conversion rate found for ${fromCurrency} to ${toCurrency}`);
    return amount;
  }
};

export default currencyService;