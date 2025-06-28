
'use server';

/**
 * @fileOverview Integrates with SMS providers to send messages.
 * This service makes real API calls.
 */

 type SmsConfig = {
    smsService: 'twilio' | 'nexmo' | 'textlk' | 'other';
    twilioSid?: string;
    twilioToken?: string;
    twilioFrom?: string;
    nexmoKey?: string;
    nexmoSecret?: string;
    nexmoFrom?: string;
    textlkApiKey?: string;
    textlkSenderId?: string;
    otherUrl?: string;
    sendToParam?: string;
    msgParam?: string;
    requestMethod?: 'get' | 'post';
    header1Key?: string; header1Val?: string;
    header2Key?: string; header2Val?: string;
    header3Key?: string; header3Val?: string;
    param1Key?: string; param1Val?: string;
    param2Key?: string; param2Val?: string;
    param3Key?: string; param3Val?: string;
    param4Key?: string; param4Val?: string;
    param5Key?: string; param5Val?: string;
    param6Key?: string; param6Val?: string;
    param7Key?: string; param7Val?: string;
    param8Key?: string; param8Val?: string;
    param9Key?: string; param9Val?: string;
    param10Key?: string; param10Val?: string;
    // Extra fields needed by the service but not part of the form
    businessName?: string;
    currency?: string;
};

// Main dispatcher function
export async function sendSms(
  recipient: string,
  message: string,
  config: SmsConfig
): Promise<{ success: boolean; error?: string; data?: any }> {
  
  switch (config.smsService) {
    case 'twilio':
      return sendWithTwilio(recipient, message, config);
    case 'nexmo':
      return sendWithNexmo(recipient, message, config);
    case 'textlk':
      return sendWithTextlk(recipient, message, config);
    case 'other':
        console.warn("SMS service 'other' is selected but not implemented in smsService.ts.");
        return { success: false, error: "Custom SMS service ('other') is not implemented." };
    default:
      console.error(`SMS service "${config.smsService}" is not configured or supported.`);
      return { success: false, error: `SMS service "${config.smsService}" is not configured or supported.` };
  }
}

// Twilio implementation
async function sendWithTwilio(
  recipient: string,
  message: string,
  config: SmsConfig
): Promise<{ success: boolean; error?: string; data?: any }> {
  const accountSid = config.twilioSid;
  const authToken = config.twilioToken;
  const fromNumber = config.twilioFrom;

  if (!accountSid || !authToken || !fromNumber) {
    const errorMsg = 'ERROR: Twilio SID, Token, or From Number is not configured in the settings.';
    console.error(errorMsg);
    return { success: false, error: 'SMS service (Twilio) is not configured.' };
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  
  const body = new URLSearchParams();
  body.append('To', recipient);
  body.append('From', fromNumber);
  body.append('Body', message);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
      cache: 'no-store'
    });
    
    const data = await response.json();

    if (response.ok && !data.error_code) {
      console.log('SMS sent successfully via Twilio:', data);
      return { success: true, data };
    } else {
      console.error('Failed to send SMS via Twilio:', data.message || data.error_message);
      return { success: false, error: data.message || data.error_message || 'Twilio API error' };
    }
  } catch (error: any) {
    console.error('Error sending SMS via Twilio:', error);
    return { success: false, error: error.message || 'Unknown network error' };
  }
}

// Nexmo/Vonage implementation
async function sendWithNexmo(
  recipient: string,
  message: string,
  config: SmsConfig
): Promise<{ success: boolean; error?: string; data?: any }> {
  const apiKey = config.nexmoKey;
  const apiSecret = config.nexmoSecret;
  const from = config.nexmoFrom;

  if (!apiKey || !apiSecret || !from) {
    const errorMsg = 'ERROR: Nexmo API Key, Secret, or From Name is not configured in the settings.';
    console.error(errorMsg);
    return { success: false, error: 'SMS service (Nexmo) is not configured.' };
  }

  const url = 'https://rest.nexmo.com/sms/json';

  const body = {
    api_key: apiKey,
    api_secret: apiSecret,
    to: recipient,
    from,
    text: message,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store'
    });

    const data = await response.json();
    const firstMessage = data.messages?.[0];

    if (firstMessage && firstMessage.status === '0') {
      console.log('SMS sent successfully via Nexmo:', data);
      return { success: true, data };
    } else {
      const errorMessage = firstMessage?.['error-text'] || 'Nexmo API error';
      console.error('Failed to send SMS via Nexmo:', errorMessage);
      return { success: false, error: errorMessage };
    }
  } catch (error: any) {
    console.error('Error sending SMS via Nexmo:', error);
    return { success: false, error: error.message || 'Unknown network error' };
  }
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
