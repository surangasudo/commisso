'use server';
/**
 * @fileOverview A Genkit flow for sending SMS notifications.
 *
 * - sendSmsNotification - A function that sends an SMS message.
 * - SendSmsInput - The input type for the sendSmsNotification function.
 */

import { ai } from '@/ai/genkit';
import { sendSms } from '@/services/smsService';
import { type AllSettings } from '@/hooks/use-settings';
import { z } from 'genkit';

const SmsConfigSchema = z.object({
  smsService: z.literal('textlk'),
  textlkApiKey: z.string().optional(),
  textlkSenderId: z.string().optional(),
});


const SendSmsInputSchema = z.object({
  to: z.string().describe("The recipient's phone number."),
  message: z.string().describe('The content of the SMS message.'),
  smsConfig: SmsConfigSchema.describe("The business's configured SMS settings."),
});
export type SendSmsInput = z.infer<typeof SendSmsInputSchema>;

export async function sendSmsNotification(input: SendSmsInput): Promise<{ success: boolean }> {
  return sendSmsFlow(input);
}

const sendSmsFlow = ai.defineFlow(
  {
    name: 'sendSmsFlow',
    inputSchema: SendSmsInputSchema,
    outputSchema: z.object({ success: z.boolean() }),
  },
  async (input) => {
    const result = await sendSms(input.to, input.message, input.smsConfig as AllSettings['sms']);
    
    if (!result.success) {
      throw new Error(`Failed to send SMS: ${result.error || 'An unknown error occurred.'}`);
    }
    
    return { success: true };
  }
);
