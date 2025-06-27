'use server';

/**
 * @fileOverview Integrates with Text.lk to send SMS messages.
 * This service makes a real API call to the Text.lk service.
 */

export async function sendSms(recipient: string, message: string): Promise<{ success: boolean; error?: string; data?: any }> {
  const apiKey = process.env.TEXTLK_API_KEY;
  const senderId = process.env.TEXTLK_SENDER_ID;

  if (!apiKey || !senderId || apiKey === 'YOUR_TEXTLK_API_KEY' || senderId === 'YOUR_TEXTLK_SENDER_ID') {
    const errorMsg = 'ERROR: TEXTLK_API_KEY or TEXTLK_SENDER_ID is not set in the .env file.';
    console.error(errorMsg);
    return { success: false, error: errorMsg };
  }

  const url = 'https://app.text.lk/api/v3/sms/send';

  const body = {
    recipient: recipient,
    sender_id: senderId,
    type: 'plain',
    message: message
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body),
      cache: 'no-store'
    });

    const data = await response.json();

    if (response.ok && data.status === 'success') {
      console.log('SMS sent successfully:', data.data);
      return { success: true, data: data.data };
    } else {
      console.error('Failed to send SMS:', data.message);
      return { success: false, error: data.message };
    }
  } catch (error: any) {
    console.error('Error sending SMS:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}
