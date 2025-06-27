import { redirect } from 'next/navigation'

export default function PaymentAccountsRedirectPage() {
  redirect('/admin/payment-accounts/list');
}
