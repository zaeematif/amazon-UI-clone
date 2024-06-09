export function currencyFix (priceCents) {
    return (priceCents / 100).toFixed(2);
}