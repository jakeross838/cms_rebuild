import { redirect } from 'next/navigation'

export default function AuthenticatedRootPage() {
  redirect('/dashboards')
}
