

// use server removed

/**
 * @fileOverview Service to send SMS messages using Text.lk.
 */

export type SmsConfig = {
  smsService: 'textlk';
  textlkApiKey?: string;
  textlkSenderId?: string;
  [key: string]: any;
};

export async function sendSms(
  recipient: string,
  message: string,
  config: SmsConfig
): Promise<{ success: boolean; error?: string; data?: any }> {

  if (config.smsService !== 'textlk') {
    const errorMsg = `Unsupported SMS service: '${config.smsService}'. Only 'textlk' is configured.`;
    console.error(errorMsg);
    return { success: false, error: errorMsg };
  }

  const apiKey = process.env.NEXT_PUBLIC_TEXTLK_API_KEY || process.env.TEXTLK_API_KEY || config.textlkApiKey;
  const senderId = process.env.NEXT_PUBLIC_TEXTLK_SENDER_ID || process.env.TEXTLK_SENDER_ID || config.textlkSenderId;

  console.log('SMS Config Trace:', {
    envPublic: !!process.env.NEXT_PUBLIC_TEXTLK_API_KEY,
    envSecret: !!process.env.TEXTLK_API_KEY,
    configKey: !!config.textlkApiKey,
    finalApiKeySet: !!apiKey,
    finalSenderId: senderId,
    recipient: recipient
  });

  if (!apiKey || !senderId) {
    const errorMsg = 'SMS Service: Text.lk credentials not found. SMS notification skipped.';
    console.warn(errorMsg);
    return { success: false, error: 'SMS service is not configured. (Credentials missing in Settings/Env)' };
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
      console.error('Failed to send SMS via Text.lk:', data);
      return { success: false, error: data.message || 'API error from Text.lk' };
    }
  } catch (error: any) {
    console.error('Network or other error sending SMS via Text.lk:', error);
    return { success: false, error: error.message || 'Unknown network error' };
  }
}
