import { redirect } from 'next/navigation'

// /draws is a duplicate of /draw-requests — redirect to canonical URL
export default function DrawsPage() {
  redirect('/draw-requests')
}
