

'use server';

/**
 * @fileOverview Integrates with SMS providers to send messages.
 * This service makes real API calls.
 */

 type SmsConfig = {
    smsService: 'textlk';
    textlkApiKey?: string;
    textlkSenderId?: string;
    // Extra fields that might be passed from settings but are not used here
    [key: string]: any;
};

// Main dispatcher function
export async function sendSms(
  recipient: string,
  message: string,
  config: SmsConfig
): Promise<{ success: boolean; error?: string; data?: any }> {
  
  if (config.smsService !== 'textlk') {
      const errorMsg = `Unsupported SMS service: ${config.smsService}. Only Text.lk is configured.`;
      console.error(errorMsg);
      return { success: false, error: errorMsg };
  }
  
  return sendWithTextlk(recipient, message, config);
}

async function sendWithTextlk(
  recipient: string,
  message: string,
  config: SmsConfig
): Promise<{ success: boolean; error?: string; data?: any }> {
  const apiKey = config.textlkApiKey;
  const senderId = config.textlkSenderId;

  if (!apiKey || !senderId) {
    const errorMsg = 'ERROR: Text.lk API Key or Sender ID is not configured in the settings.';
    console.error(errorMsg);
    return { success: false, error: 'SMS service (Text.lk) is not configured.' };
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
      console.log('SMS sent successfully via Text.lk:', data.data);
      return { success: true, data: data.data };
    } else {
      console.error('Failed to send SMS via Text.lk:', data.message);
      return { success: false, error: data.message || 'API error' };
    }
  } catch (error: any) {
    console.error('Error sending SMS via Text.lk:', error);
    return { success: false, error: error.message || 'Unknown network error' };
  }
}
