/**
 * Google Form & Google Sheet Integration Service
 * 
 * Maps website Contact / Investor Enquiry Form fields to new Google Form entry IDs
 * and dispatches submissions directly to Google Forms & linked Google Sheet.
 */

// Production Google Form Entry ID Mappings (Updated)
export const GOOGLE_FORM_FIELD_MAP = {
  name: 'entry.2005620554',          // Full Name
  phone: 'entry.1166974658',         // Phone number
  email: 'entry.1045781291',         // Email
  cityState: 'entry.606323434',      // City & State
  country: 'entry.1059695746',       // Country
  budget: 'entry.741973709',         // Investment Budget
  storeLocation: 'entry.1320393607', // Commercial Space Status
  message: 'entry.1065046570',       // Specific Query or Comments
};

// Default Google Form Action URL (New formResponse endpoint)
export const DEFAULT_GOOGLE_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLScPditMWTVrcSEsJpqEBlNJU58beCpE5CkXAg4GcqdPrjf7Sw/formResponse';

function normalizeBudget(budget) {
  if (!budget) return '₹50 lakhs - ₹1crore (Flagship)';
  if (budget.includes('50') || budget.toLowerCase().includes('flagship')) {
    return '₹50 lakhs - ₹1crore (Flagship)';
  }
  if (budget.includes('2') && (budget.includes('+') || budget.toLowerCase().includes('multi'))) {
    return '₹2crore + (Multi-store)';
  }
  if (budget.includes('1') && budget.includes('2')) {
    return '₹1crore - ₹2crore (Prime)';
  }
  return '₹50 lakhs - ₹1crore (Flagship)';
}

/**
 * Submits form data to Google Forms using FormData and fetch (no-cors mode)
 * 
 * @param {Object} formData Form data from ContactSection
 * @returns {Promise<{ success: boolean }>}
 */
export async function submitContactToGoogleForm(formData) {
  const formActionUrl =
    (typeof import.meta !== 'undefined' &&
      import.meta.env &&
      import.meta.env.VITE_GOOGLE_FORM_ACTION_URL) ||
    DEFAULT_GOOGLE_FORM_URL;

  const data = new FormData();
  data.append(GOOGLE_FORM_FIELD_MAP.name, (formData.name || '').trim());
  data.append(GOOGLE_FORM_FIELD_MAP.phone, formData.phone ? `+91 ${formData.phone.trim()}` : '');
  data.append(GOOGLE_FORM_FIELD_MAP.email, (formData.email || '').trim().toLowerCase());
  data.append(GOOGLE_FORM_FIELD_MAP.cityState, (formData.cityState || '').trim());
  data.append(GOOGLE_FORM_FIELD_MAP.country, (formData.country || 'India').trim());
  data.append(GOOGLE_FORM_FIELD_MAP.budget, normalizeBudget(formData.budget));
  data.append(GOOGLE_FORM_FIELD_MAP.storeLocation, (formData.storeLocation || 'N/A').trim());
  data.append(GOOGLE_FORM_FIELD_MAP.message, (formData.message || 'Website investor enquiry').trim());
  data.append('fvv', '1');
  data.append('pageHistory', '0');

  try {
    await fetch(formActionUrl, {
      method: 'POST',
      mode: 'no-cors',
      body: data,
    });
    return { success: true };
  } catch (error) {
    console.error('Google Form submission error:', error);
    throw error;
  }
}
