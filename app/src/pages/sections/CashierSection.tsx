// Cashier Section - Single table for payment
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PettyCashTable } from '@/components/PettyCashTable';
import type { PettyCashRequest, User } from '@/types';

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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Requests for Payment</CardTitle>
        <CardDescription>
          Mark requests as paid after processing payment
        </CardDescription>
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
