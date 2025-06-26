'use server';

/**
 * @fileOverview Integrates with Text.lk to send SMS messages.
 * This service makes a real API call to the Text.lk service.
 */

export async function sendSms(to: string, message: string): Promise<{ success: boolean, messageId?: string }> {
  const apiKey = process.env.TEXTLK_API_KEY;
  const senderId = process.env.TEXTLK_SENDER_ID;

  if (!apiKey || !senderId) {
    console.error('ERROR: TEXTLK_API_KEY or TEXTLK_SENDER_ID is not set in the .env file.');
    return { success: false };
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

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to send SMS via Text.lk. Status:', response.status, 'Response:', errorData);
      return { success: false };
    }

    const data = await response.json();
    console.log('SMS sent successfully via Text.lk:', data);
    
    // Assuming the API response has a structure like { data: { request_id: '...' } }
    const messageId = data?.data?.request_id || `textlk_${Date.now()}`;

    return { success: true, messageId: messageId };

  } catch (error) {
    console.error('Error occurred while sending SMS:', error);
    return { success: false };
  }
}
