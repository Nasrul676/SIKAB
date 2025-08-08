export const formatNumber = (amount: number) => {
  // Ensure the input is a number and convert to an integer
  const integerAmount = typeof amount === "number" ? Math.round(amount) : parseInt(amount, 10);

  // Handle non-numeric or NaN input gracefully
  if (isNaN(integerAmount)) {
    console.warn("Input is not a valid number. Returning original input as string.");
    return String(amount);
  }

  // Use Intl.NumberFormat with 'id-ID' locale for period as thousands separator
  // and explicitly set fraction digits to 0.
  const formatter = new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    // No style or currency options needed, as we just want a number format.
  });

  return formatter.format(integerAmount);
}