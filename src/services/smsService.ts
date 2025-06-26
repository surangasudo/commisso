'use server';

/**
 * @fileOverview A placeholder service for sending SMS messages.
 * In a real application, this would integrate with an SMS provider like Twilio.
 */

export async function sendSms(to: string, message: string): Promise<{ success: boolean, messageId?: string }> {
  console.log(`--- SIMULATING SMS ---`);
  console.log(`To: ${to}`);
  console.log(`Message: ${message}`);
  console.log(`----------------------`);

  // Simulate a successful API call
  return Promise.resolve({
    success: true,
    messageId: `sms_${Date.now()}`
  });
}
