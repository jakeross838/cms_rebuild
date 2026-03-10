import { AlertCircle, CheckCircle2, DollarSign } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

// ---------------------------------------------------------------------------
// PaymentStatusBadge — shows vendor payment status (unpaid/partial/paid)
// ---------------------------------------------------------------------------

interface PaymentStatusBadgeProps {
  paymentStatus: 'unpaid' | 'partial' | 'paid' | undefined | null
  paidAmount?: number | null
  totalAmount?: number | null
  compact?: boolean
}

export function PaymentStatusBadge({
  paymentStatus,
  paidAmount,
  totalAmount,
  compact = false,
}: PaymentStatusBadgeProps) {
  const status = paymentStatus || 'unpaid'
  const paid = paidAmount || 0
  const total = totalAmount || 0

  if (status === 'paid') {
    return (
      <Badge
        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
        title={`Paid to vendor: ${formatCurrency(paid)}`}
      >
        <CheckCircle2 className="h-3 w-3" />
        {!compact && 'Paid'}
      </Badge>
    )
  }

  if (status === 'partial') {
    const percentPaid = total > 0 ? Math.round((paid / total) * 100) : 0
    const remaining = total - paid
    return (
      <Badge
        className="bg-amber-100 text-amber-800 gap-1"
        title={`Paid: ${formatCurrency(paid)} · Remaining: ${formatCurrency(remaining)}`}
      >
        <DollarSign className="h-3 w-3" />
        {compact ? `${percentPaid}%` : `Partial (${percentPaid}%)`}
      </Badge>
    )
  }

  // Unpaid
  return (
    <Badge
      variant="outline"
      className="text-muted-foreground gap-1"
      title={total > 0 ? `Amount due: ${formatCurrency(total)}` : 'Not yet paid to vendor'}
    >
      <AlertCircle className="h-3 w-3" />
      {!compact && 'Unpaid'}
    </Badge>
  )
}
