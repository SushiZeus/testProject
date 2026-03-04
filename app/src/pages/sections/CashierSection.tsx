// Cashier Section - Single table showing all requests with their status
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PettyCashTable } from '@/components/PettyCashTable';
import type { PettyCashRequest, User } from '@/types';
import { Badge } from '@/components/ui/badge';

interface CashierSectionProps {
  user: User;
  financeApprovedRequests: PettyCashRequest[];
  statusColors: Record<string, string>;
  onView: (request: PettyCashRequest) => void;
  onPaid: (request: PettyCashRequest) => void;
}

export function CashierSection({
  user,
  financeApprovedRequests,
  statusColors,
  onView,
  onPaid,
}: CashierSectionProps) {
  const readyForPayment = financeApprovedRequests.filter(r => r.status === 'PENDING_PAYMENT').length;
  const inApproval = financeApprovedRequests.filter(r => 
    r.status !== 'PENDING_PAYMENT' && 
    r.status !== 'PAID' && 
    !r.status.includes('REJECTED')
  ).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>All Petty Cash Requests</CardTitle>
            <CardDescription>
              View all requests and their status. You can only mark as paid requests approved by Finance Manager.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              {readyForPayment} Ready for Payment
            </Badge>
            <Badge variant="secondary" className="bg-amber-100 text-amber-700">
              {inApproval} In Approval
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <PettyCashTable
          requests={financeApprovedRequests}
          user={user}
          statusColors={statusColors}
          onView={onView}
          onPaid={onPaid}
          showPaidButton={true}
        />
      </CardContent>
    </Card>
  );
}
