
'use server';

/**
 * @fileOverview Integrates with Text.lk to send SMS messages.
 * This service makes a real API call to the Text.lk service.
 */

/**
 * Formats a Sri Lankan phone number to the E.164 format required by Text.lk.
 * @param number The phone number string.
 * @returns The formatted phone number string.
 */
function formatSriLankanNumber(number: string): string {
  // Remove common special characters like spaces, hyphens, and parentheses
  let cleaned = number.replace(/[\s-()]/g, '');

  // If the number starts with a '+', remove it for further processing.
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  // Now, 'cleaned' is guaranteed not to have a '+' prefix.
  // The rest of the logic can assume a string of digits.

  // If it starts with '94' (country code), it's likely already in the correct format.
  if (cleaned.startsWith('94')) {
    return cleaned;
  }
  // If it starts with a '0', it's a local format. Replace '0' with '94'.
  if (cleaned.startsWith('0')) {
    return '94' + cleaned.substring(1);
  }
  // If it's a 9-digit number (local format without leading 0), prepend '94'.
  if (cleaned.length === 9) {
    return '94' + cleaned;
  }
  
  // As a fallback, return the number after basic cleaning, but warn the user.
  console.warn(`Could not automatically format phone number: ${number}. Attempting to send as ${cleaned}.`);
  return cleaned;
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
