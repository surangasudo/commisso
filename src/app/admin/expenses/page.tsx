import { redirect } from 'next/navigation'

export default function ExpensesRedirectPage() {
  redirect('/admin/expenses/list');
}
