// Berlin ZIP codes (10115-14199)
const BERLIN_ZIP_CODES = /^(10[1-9]\d{2}|1[1-3]\d{3}|14[0-1]\d{2})$/;

export function validateTextField(value: string): boolean {
  // Must contain at least one letter
  return /[a-zA-ZäöüÄÖÜß]/.test(value);
}

export function validateBerlinZipCode(zip: string): boolean {
  if (!zip) return false;
  return BERLIN_ZIP_CODES.test(zip);
}

export function getTextFieldError(value: string, fieldName: string): string {
  if (!value || value.trim().length === 0) {
    return `${fieldName} ist erforderlich`;
  }
  if (!validateTextField(value)) {
    return `${fieldName} muss mindestens einen Buchstaben enthalten`;
  }
  return "";
}

export function getZipCodeError(zip: string): string {
  if (!zip || zip.trim().length === 0) {
    return "PLZ ist erforderlich";
  }
  if (!validateBerlinZipCode(zip)) {
    return "Bitte geben Sie eine gültige Berliner PLZ ein (10115-14199)";
  }
  return "";
}

/**
 * Get image URL - supports both Cloudinary URLs and local paths
 * @param imagePath - Can be a Cloudinary URL (https://...) or local filename
 * @returns Full image URL with cache busting for Cloudinary URLs
 */
export function getImageUrl(imagePath: string | undefined | null): string {
  const DEFAULT_IMAGE = "https://res.cloudinary.com/dnqms2vje/image/upload/v1768855945/berlin-wandel/No-Image.png";

  if (!imagePath || imagePath === "null" || imagePath === "No-Image.jpg") {
    return DEFAULT_IMAGE;
  }

  // If it's already a full URL (Cloudinary), use it directly with cache busting
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    // Add cache busting parameter to force browser to reload image
    const separator = imagePath.includes("?") ? "&" : "?";
    return `${imagePath}${separator}v=${Date.now()}`;
  }

  // Otherwise, it's a local path (for backward compatibility with old data)
  return `http://localhost:8000/images/${imagePath}?v=${Date.now()}`;
}
