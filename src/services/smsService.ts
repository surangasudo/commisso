'use server';

/**
 * @fileOverview Integrates with Text.lk to send SMS messages.
 * This service makes a real API call to the Text.lk service.
 */

/**
 * Formats a Sri Lankan phone number to the E.164 format (without +) required by Text.lk.
 * Throws an error if the number is not in a recognizable Sri Lankan format.
 * @param phoneNumber The phone number string to format.
 * @returns The formatted phone number string, e.g., 94712345678.
 */
function formatSriLankanNumber(phoneNumber: string): string {
    // This is a pre-condition check. The function should not be called with falsy values.
    if (!phoneNumber || typeof phoneNumber !== 'string') {
        throw new Error('Invalid input: Phone number must be a non-empty string.');
    }
    
    // Remove all non-digit characters.
    const cleaned = phoneNumber.replace(/\D/g, '');

    // Case 1: Number starts with '94' and is 11 digits long (e.g., 94712345678)
    if (cleaned.startsWith('94') && cleaned.length === 11) {
        return cleaned;
    }
    
    // Case 2: Number starts with '0' and is 10 digits long (e.g., 0712345678)
    if (cleaned.startsWith('0') && cleaned.length === 10) {
        return '94' + cleaned.substring(1);
    }
    
    // Case 3: Number is 9 digits long (e.g., 712345678)
    if (cleaned.length === 9) {
        return '94' + cleaned;
    }

    // If none of the valid formats match, throw an error.
    throw new Error(`Invalid Sri Lankan phone number format provided: "${phoneNumber}"`);
}


export async function sendSms(to: string, message: string): Promise<{ success: boolean; error?: string; messageId?: string }> {
  // Add a very strict check for the 'to' parameter at the beginning of the function
  if (!to || typeof to !== 'string' || to.trim() === '') {
      const errorMsg = 'Recipient phone number is missing, empty, or not a string.';
      console.error(errorMsg);
      return { success: false, error: errorMsg };
  }
  
  const apiKey = process.env.TEXTLK_API_KEY;
  const senderId = process.env.TEXTLK_SENDER_ID;

  if (!apiKey || !senderId || apiKey === 'YOUR_TEXTLK_API_KEY' || senderId === 'YOUR_TEXTLK_SENDER_ID') {
    const errorMsg = 'ERROR: TEXTLK_API_KEY or TEXTLK_SENDER_ID is not set in the .env file.';
    console.error(errorMsg);
    return { success: false, error: errorMsg };
  }
  
  try {
    const formattedNumber = formatSriLankanNumber(to);
    
    const requestBody = {
      sender_id: senderId,
      message: message,
      recipients: [formattedNumber],
    };

    console.log('Sending SMS request to Text.lk with body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://app.text.lk/api/v3/sms/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      cache: 'no-store',
    });

    const responseBody = await response.json();

    if (!response.ok) {
      let errorMessage = responseBody.message || `API Error: ${response.statusText}`;
      if (response.status === 401 || (responseBody.message && (responseBody.message.toLowerCase().includes('unauthenticated') || responseBody.message.toLowerCase().includes('user not found')))) {
          errorMessage = "The Text.lk API Key is invalid or missing. Please check your .env file.";
      }
      console.error('Failed to send SMS via Text.lk. Status:', response.status, 'Full Response:', JSON.stringify(responseBody, null, 2));
      return { success: false, error: errorMessage };
    }

    console.log('SMS sent successfully via Text.lk:', responseBody);
    
    const messageId = responseBody?.data?.request_id || `textlk_${Date.now()}`;

    return { success: true, messageId: messageId };

  } catch (error: any) {
    console.error('An exception occurred while sending SMS. This might be a network issue or an error in phone number formatting.', error);
    return { success: false, error: error.message || 'A network or unexpected error occurred during SMS sending.' };
  }
}
