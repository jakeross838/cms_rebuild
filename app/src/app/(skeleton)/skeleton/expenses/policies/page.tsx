import dynamic from 'next/dynamic'
const ExpensesPreview = dynamic(() => import('@/components/skeleton/previews/expenses-preview'), { ssr: false })

export default function ExpensePoliciesPage() {
  return <ExpensesPreview />
}
