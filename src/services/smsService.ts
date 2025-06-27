'use server';

import { type AllSettings } from '@/hooks/use-settings';

/**
 * @fileOverview Integrates with SMS providers to send messages.
 * This service makes real API calls.
 */

export async function sendSms(
  recipient: string,
  message: string,
  config: AllSettings['sms']
): Promise<{ success: boolean; error?: string; data?: any }> {
  
  if (config.smsService === 'textlk') {
    return sendWithTextlk(recipient, message, config);
  }

  // TODO: Add other providers like Twilio, Nexmo here if needed.
  
  console.error(`SMS service "${config.smsService}" is not configured or supported.`);
  return { success: false, error: `SMS service "${config.smsService}" is not configured or supported.` };
}

async function sendWithTextlk(
  recipient: string,
  message: string,
  config: AllSettings['sms']
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
