
'use server';

/**
 * @fileOverview Integrates with Text.lk to send SMS messages.
 * This service makes a real API call to the Text.lk service.
 */

/**
 * Formats a Sri Lankan phone number to the E.164 format (without +) required by Text.lk.
 * Throws an error if the number is not in a recognizable Sri Lankan format.
 * @param number The phone number string.
 * @returns The formatted phone number string, e.g., 94712345678.
 */
function formatSriLankanNumber(number: string): string {
  // Remove all non-digit characters
  const cleaned = number.replace(/\D/g, '');

  // Case 1: Already in 94... format (e.g., from +94)
  if (cleaned.startsWith('94') && cleaned.length === 11) {
    return cleaned;
  }

  // Case 2: Starts with 0 (e.g., 0712345678)
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return '94' + cleaned.slice(1);
  }

  // Case 3: Just the 9 digits (e.g., 712345678)
  if (cleaned.length === 9) {
    return '94' + cleaned;
  }
  
  // If none of the above, the number is invalid.
  throw new Error(`Invalid Sri Lankan phone number format: ${number}`);
}


export async function sendSms(to: string, message: string): Promise<{ success: boolean; error?: string; messageId?: string }> {
  const apiKey = process.env.TEXTLK_API_KEY;
  const senderId = process.env.TEXTLK_SENDER_ID;

  if (!apiKey || !senderId || apiKey === 'YOUR_TEXTLK_API_KEY' || senderId === 'YOUR_TEXTLK_SENDER_ID') {
    const errorMsg = 'ERROR: TEXTLK_API_KEY or TEXTLK_SENDER_ID is not set in the .env file.';
    console.error(errorMsg);
    return { success: false, error: errorMsg };
  }
  
  try {
    // Format the number before sending. This may throw an error.
    const formattedNumber = formatSriLankanNumber(to);
    const recipients = [formattedNumber];

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
      if (response.status === 401 || (responseBody.message && (responseBody.message.toLowerCase().includes('unauthenticated') || responseBody.message.toLowerCase().includes('user not found')))) {
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
    return { success: false, error: error.message || 'An unexpected error occurred during SMS sending' };
  }
}
    