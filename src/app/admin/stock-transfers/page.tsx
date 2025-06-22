import { redirect } from 'next/navigation'

export default function StockTransfersRedirectPage() {
  redirect('/admin/stock-transfers/list');
}
