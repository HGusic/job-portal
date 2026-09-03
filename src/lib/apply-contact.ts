export const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC",
] as const;

export type USState = (typeof US_STATES)[number];

export type ContactInfo = {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  zipCode: string;
  state: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ZIP_RE = /^\d{5}(-\d{4})?$/;
const PHONE_DIGITS_RE = /^\d{10,15}$/;

function isUSState(value: string): value is USState {
  return (US_STATES as readonly string[]).includes(value);
}

/** Returns an error message, or null if contact info is valid. */
export function validateContactInfo(contact: ContactInfo): string | null {
  const firstName = contact.firstName.trim();
  const middleName = contact.middleName.trim();
  const lastName = contact.lastName.trim();
  const email = contact.email.trim();
  const phone = contact.phone.trim();
  const address = contact.address.trim();
  const zipCode = contact.zipCode.trim();
  const state = contact.state.trim().toUpperCase();

  if (!firstName) return "First name is required.";
  if (firstName.length > 100) return "First name is too long.";
  if (middleName.length > 100) return "Middle name is too long.";
  if (!lastName) return "Last name is required.";
  if (lastName.length > 100) return "Last name is too long.";
  if (!address) return "Address is required.";
  if (address.length > 300) return "Address is too long.";
  if (!zipCode) return "Zip code is required.";
  if (!ZIP_RE.test(zipCode)) return "Enter a valid zip code (12345 or 12345-6789).";
  if (!state) return "State is required.";
  if (!isUSState(state)) return "Select a valid US state.";
  if (!email) return "Email is required.";
  if (email.length > 320 || !EMAIL_RE.test(email)) return "Enter a valid email address.";
  if (!phone) return "Phone number is required.";
  if (phone.length > 40) return "Phone number is too long.";
  const digits = phone.replace(/\D/g, "");
  if (!PHONE_DIGITS_RE.test(digits)) {
    return "Enter a valid phone number (at least 10 digits).";
  }

  return null;
}

export function normalizeContactInfo(contact: ContactInfo): ContactInfo {
  return {
    firstName: contact.firstName.trim(),
    middleName: contact.middleName.trim(),
    lastName: contact.lastName.trim(),
    email: contact.email.trim(),
    phone: contact.phone.trim(),
    address: contact.address.trim(),
    zipCode: contact.zipCode.trim(),
    state: contact.state.trim().toUpperCase(),
  };
}

export function contactStorageKey(jobId: string) {
  return `job-apply-contact:${jobId}`;
}

export function formatApplicantName(app: {
  firstName: string;
  middleName: string | null;
  lastName: string;
}) {
  return [app.firstName, app.middleName, app.lastName].filter(Boolean).join(" ");
}
