
'use server';

/**
 * @fileOverview Integrates with Text.lk to send SMS messages.
 * This service makes a real API call to the Text.lk service.
 */

/**
 * Formats a Sri Lankan phone number to the E.164 format (without +) required by Text.lk.
 * @param number The phone number string.
 * @returns The formatted phone number string, e.g., 94712345678.
 */
function formatSriLankanNumber(number: string): string {
  // 1. Remove all non-digit characters except for a potential leading '+'
  let cleaned = number.replace(/[^\d+]/g, '');

  // 2. Handle international format like +94...
  if (cleaned.startsWith('+94')) {
    // Remove '+' and return if length is correct for '94...' format
    cleaned = cleaned.substring(1);
    if (cleaned.length === 11) {
      return cleaned;
    }
  }

  // 3. Handle national format starting with 94...
  if (cleaned.startsWith('94')) {
    if (cleaned.length === 11) {
      return cleaned; // Already in the correct format
    } else {
      // It starts with 94 but has wrong length, which is ambiguous.
      console.warn(`Phone number ${number} starts with 94 but has incorrect length. Sending as is.`);
      return cleaned;
    }
  }

  // 4. Handle local format with leading '0' (e.g., 0712345678)
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1); // remove leading 0
  }

  // 5. After cleaning, if we have a 9-digit number, it's a valid local number.
  if (cleaned.length === 9) {
    return '94' + cleaned;
  }

  // 6. If we reach here, the format is unknown. Warn and return the original digits.
  console.warn(`Could not automatically format Sri Lankan phone number: ${number}. The format is unusual. Sending only the digits.`);
  return number.replace(/[^\d]/g, '');
}


export async function sendSms(to: string, message: string): Promise<{ success: boolean; error?: string; messageId?: string }> {
  const apiKey = process.env.TEXTLK_API_KEY;
  const senderId = process.env.TEXTLK_SENDER_ID;

  if (!apiKey || !senderId || apiKey === 'YOUR_TEXTLK_API_KEY' || senderId === 'YOUR_TEXTLK_SENDER_ID') {
    const errorMsg = 'ERROR: TEXTLK_API_KEY or TEXTLK_SENDER_ID is not set in the .env file.';
    console.error(errorMsg);
    return { success: false, error: errorMsg };
  }
  
  // Format the number before sending
  const formattedNumber = formatSriLankanNumber(to);
  const recipients = [formattedNumber];

  try {
    const response = await fetch('https://app.text.lk/api/v3/sms/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender_id: senderId,
        message: message,
        recipients: recipients,
      }),
      cache: 'no-store',
    });

    const responseBody = await response.json();

    if (!response.ok) {
      let errorMessage = responseBody.message || `API Error: ${response.statusText}`;
      // Check for specific authentication error status or message
      if (response.status === 401 || (responseBody.message && responseBody.message.toLowerCase().includes('unauthenticated'))) {
          errorMessage = "The Text.lk API Key is invalid or missing. Please check your .env file.";
      }
      console.error('Failed to send SMS via Text.lk. Status:', response.status, 'Response:', responseBody);
      return { success: false, error: errorMessage };
    }

    console.log('SMS sent successfully via Text.lk:', responseBody);
    
    const messageId = responseBody?.data?.request_id || `textlk_${Date.now()}`;

    return { success: true, messageId: messageId };

  } catch (error: any) {
    console.error('Error occurred while sending SMS:', error);
    return { success: false, error: error.message || 'Network error during SMS sending' };
  }
}
    