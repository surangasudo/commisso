'use server';

/**
 * @fileOverview Integrates with Text.lk to send SMS messages.
 * This service makes a real API call to the Text.lk service.
 */

export async function sendSms(to: string, message: string): Promise<{ success: boolean; error?: string; messageId?: string }> {
  const apiKey = process.env.TEXTLK_API_KEY;
  const senderId = process.env.TEXTLK_SENDER_ID;

  if (!apiKey || !senderId) {
    const errorMsg = 'ERROR: TEXTLK_API_KEY or TEXTLK_SENDER_ID is not set in the .env file.';
    console.error(errorMsg);
    return { success: false, error: errorMsg };
  }
  
  // The API expects recipients as an array of strings.
  const recipients = [to];

  try {
    const response = await fetch('https://app.text.lk/api/v2/sms/send', {
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
      const errorMessage = responseBody.message || `API Error: ${response.statusText}`;
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
