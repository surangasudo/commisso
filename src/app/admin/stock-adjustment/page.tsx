import { redirect } from 'next/navigation'

export default function StockAdjustmentRedirectPage() {
  redirect('/admin/stock-adjustment/list');
}
