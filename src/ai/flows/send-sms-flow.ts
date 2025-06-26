'use server';
/**
 * @fileOverview A Genkit flow for sending SMS notifications.
 *
 * - sendSmsNotification - A function that sends an SMS message.
 * - SendSmsInput - The input type for the sendSmsNotification function.
 */

import { ai } from '@/ai/genkit';
import { sendSms } from '@/services/smsService';
import { z } from 'genkit';

export const SendSmsInputSchema = z.object({
  to: z.string().describe("The recipient's phone number."),
  message: z.string().describe('The content of the SMS message.'),
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
    const result = await sendSms(input.to, input.message);
    return { success: result.success };
  }
);
