import dynamic from 'next/dynamic'
const CertifiedPayrollPreview = dynamic(() => import('@/components/skeleton/previews/certified-payroll-preview'), { ssr: false })

export default function CertifiedPayrollPage() {
  return <CertifiedPayrollPreview />
}
