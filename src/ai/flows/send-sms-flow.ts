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
  smsService: z.enum(['twilio', 'nexmo', 'textlk', 'other']),
  twilioSid: z.string().optional(),
  twilioToken: z.string().optional(),
  twilioFrom: z.string().optional(),
  nexmoKey: z.string().optional(),
  nexmoSecret: z.string().optional(),
  nexmoFrom: z.string().optional(),
  textlkApiKey: z.string().optional(),
  textlkSenderId: z.string().optional(),
  otherUrl: z.string().optional(),
  sendToParam: z.string().optional(),
  msgParam: z.string().optional(),
  requestMethod: z.enum(['get', 'post']).optional(),
  header1Key: z.string().optional(), header1Val: z.string().optional(),
  header2Key: z.string().optional(), header2Val: z.string().optional(),
  header3Key: z.string().optional(), header3Val: z.string().optional(),
  param1Key: z.string().optional(), param1Val: z.string().optional(),
  param2Key: z.string().optional(), param2Val: z.string().optional(),
  param3Key: z.string().optional(), param3Val: z.string().optional(),
  param4Key: z.string().optional(), param4Val: z.string().optional(),
  param5Key: z.string().optional(), param5Val: z.string().optional(),
  param6Key: z.string().optional(), param6Val: z.string().optional(),
  param7Key: z.string().optional(), param7Val: z.string().optional(),
  param8Key: z.string().optional(), param8Val: z.string().optional(),
  param9Key: z.string().optional(), param9Val: z.string().optional(),
  param10Key: z.string().optional(), param10Val: z.string().optional(),
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
