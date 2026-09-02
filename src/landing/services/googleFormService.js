/**
 * Google Form & Google Sheet Integration Service
 * 
 * Maps website Contact / Investor Enquiry Form fields to Google Form entry IDs
 * and dispatches submissions directly to Google Forms & linked Google Sheet.
 */

// Production Google Form Entry ID Mappings
export const GOOGLE_FORM_FIELD_MAP = {
  name: 'entry.2005620554',          // Name
  phone: 'entry.1166974658',         // Phone
  email: 'entry.1045781291',         // Email
  country: 'entry.1065046570',       // Nationality / Country
  cityState: 'entry.1115387442',     // State / City & State
  budget: 'entry.839337160',         // Investment Range
  storeLocation: 'entry.70660907',   // Field 1 (Commercial Space Status)
  message: 'entry.1694447815',       // Message / Additional Comments
};

// Default Google Form Action URL (formResponse endpoint)
export const DEFAULT_GOOGLE_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSdIVMLsVPDEjjVLplVusOgW6pFZn3biTbxb-U-Dt3hkAIxgEw/formResponse';

/**
 * Submits form data to Google Forms using both hidden iframe POST and fetch fallback
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

  const payload = {
    [GOOGLE_FORM_FIELD_MAP.name]: (formData.name || '').trim(),
    [GOOGLE_FORM_FIELD_MAP.phone]: formData.phone ? `+91 ${formData.phone.trim()}` : '',
    [GOOGLE_FORM_FIELD_MAP.email]: (formData.email || '').trim().toLowerCase(),
    [GOOGLE_FORM_FIELD_MAP.country]: (formData.country || 'India').trim(),
    [GOOGLE_FORM_FIELD_MAP.cityState]: (formData.cityState || '').trim(),
    [GOOGLE_FORM_FIELD_MAP.budget]: (formData.budget || '').trim(),
    [GOOGLE_FORM_FIELD_MAP.storeLocation]: (formData.storeLocation || 'N/A').trim(),
    [GOOGLE_FORM_FIELD_MAP.message]: (formData.message || 'Website investor enquiry').trim(),
    fvv: '1',
    pageHistory: '0',
  };

  return new Promise((resolve) => {
    try {
      // 1. Dispatch DOM Hidden Iframe Form POST (Bypasses all client-side CORS issues)
      const iframeName = `gform_iframe_${Date.now()}`;
      const iframe = document.createElement('iframe');
      iframe.name = iframeName;
      iframe.style.display = 'none';
      iframe.style.position = 'absolute';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = formActionUrl;
      form.target = iframeName;
      form.style.display = 'none';

      Object.entries(payload).forEach(([key, val]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = val;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();

      // Clean up DOM elements after submission
      setTimeout(() => {
        try {
          if (form.parentNode) form.parentNode.removeChild(form);
          if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        } catch {
          // ignore cleanup errors
        }
      }, 5000);
    } catch (e) {
      console.warn('Iframe submission fallback triggered:', e);
    }

    // 2. Also dispatch background fetch for dual assurance
    try {
      const params = new URLSearchParams();
      Object.entries(payload).forEach(([key, val]) => params.append(key, val));

      fetch(formActionUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      }).catch(() => {});
    } catch {
      // ignore
    }

    // Resolve after short buffer for smooth UX
    setTimeout(() => {
      resolve({ success: true });
    }, 800);
  });
}
