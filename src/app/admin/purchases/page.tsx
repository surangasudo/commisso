import { redirect } from 'next/navigation'

export default function PurchasesRedirectPage() {
  redirect('/admin/purchases/list');
}
