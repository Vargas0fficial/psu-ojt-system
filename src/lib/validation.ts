export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidRole(role: string): role is "intern" | "supervisor" {
  return role === "intern" || role === "supervisor";
}

export function isValidTimeString(value: string) {
  // Expected "HH:MM AM/PM" e.g. "08:02 AM"
  return /^([0]?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i.test(value);
}

export function isValidDateString(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function assertRequiredFields(
  body: Record<string, unknown>,
  fields: string[]
): string | null {
  for (const field of fields) {
    const value = body[field];
    if (value === undefined || value === null || value === "") {
      return `Missing required field: ${field}`;
    }
  }
  return null;
}
