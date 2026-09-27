/**
 * Utility for generating Luhn-compliant virtual card numbers.
 */

export const generateCardNumber = (type: 'Visa' | 'Mastercard' | 'American Express'): string => {
  let number = '';
  let length = 16;

  if (type === 'Visa') {
    number = '4';
  } else if (type === 'Mastercard') {
    const start = Math.floor(Math.random() * 5) + 51; // 51-55
    number = start.toString();
  } else if (type === 'American Express') {
    number = Math.random() < 0.5 ? '34' : '37';
    length = 15;
  } else {
    number = '4'; // Default to Visa
  }

  // Generate middle digits
  while (number.length < length - 1) {
    number += Math.floor(Math.random() * 10).toString();
  }

  // Calculate check digit using Luhn algorithm
  const checkDigit = calculateLuhnCheckDigit(number);
  return number + checkDigit;
};

export const generateCVV = (type: 'Visa' | 'Mastercard' | 'American Express'): string => {
  const length = type === 'American Express' ? 4 : 3;
  let cvv = '';
  
  const isPredictable = (val: string) => {
    // Avoid "000", "111", etc.
    if (/^(\d)\1+$/.test(val)) return true;
    // Avoid "123", "234", etc.
    if ("0123456789".includes(val) || "9876543210".includes(val)) return true;
    return false;
  };

  do {
    cvv = '';
    for (let i = 0; i < length; i++) {
      cvv += Math.floor(Math.random() * 10).toString();
    }
  } while (isPredictable(cvv));

  return cvv;
};

export const generateExpiryDate = (yearsAhead: number = 4): string => {
  const now = new Date();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = (now.getFullYear() + yearsAhead).toString().slice(-2);
  return `${month}/${year}`;
};

/**
 * Luhn Algorithm: Calculate the check digit (final digit) to make the number valid.
 */
const calculateLuhnCheckDigit = (partialNumber: string): string => {
  let sum = 0;
  let shouldDouble = true;

  // We are calculating the check digit, so we act as if it's there
  // Iterate from right to left
  for (let i = partialNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(partialNumber.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit.toString();
};

/**
 * Validates a card number using the Luhn check.
 */
export const isValidCardNumber = (cardNumber: string): boolean => {
  let sum = 0;
  let shouldDouble = false;

  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};
