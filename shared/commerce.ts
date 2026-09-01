export const PDF_PACKAGE_PRICE = 200;
export const BUNDLE_PRICES = { pdfPackage: 200, course: 350, fullBundle: 520, habitDiscipline: 100 } as const;
export function canSellEbookAlone(kind: string) { return kind !== "ebook"; }
export function pricePdfPackage() { return PDF_PACKAGE_PRICE; }
export function assertCheckoutAcknowledgement(value: boolean) { if (!value) throw new Error("No-refund acknowledgement is required"); return true; }
