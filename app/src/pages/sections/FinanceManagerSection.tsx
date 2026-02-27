// Finance Manager Section - Three tables
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PettyCashTable } from '@/components/PettyCashTable';
import type { PettyCashRequest, User } from '@/types';

interface FinanceManagerSectionProps {
  user: User;
  accountsRequests: PettyCashRequest[];
  cooApprovedRequests: PettyCashRequest[];
  myRequests: PettyCashRequest[];
  statusColors: Record<string, string>;
  onView: (request: PettyCashRequest) => void;
  onApprove: (request: PettyCashRequest) => void;
  onReject: (request: PettyCashRequest) => void;
  onWaiting: (request: PettyCashRequest) => void;
  onApproved: (request: PettyCashRequest) => void;
  onResubmit: (request: PettyCashRequest) => void;
  onDelete: (request: PettyCashRequest) => void;
}

export function FinanceManagerSection({
  user,
  accountsRequests,
  cooApprovedRequests,
  myRequests,
  statusColors,
  onView,
  onApprove,
  onReject,
  onWaiting,
  onApproved,
  onResubmit,
  onDelete,
}: FinanceManagerSectionProps) {
  return (
    <div className="space-y-6">
      {/* Accounts Department Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Accounts Department Requests</CardTitle>
          <CardDescription>
            Approve or reject requests from accounts staff
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PettyCashTable
            requests={accountsRequests}
            user={user}
            statusColors={statusColors}
            onView={onView}
            onApprove={onApprove}
            onReject={onReject}
            showApproveReject={true}
          />
        </CardContent>
      </Card>

      {/* COO Approved Requests */}
      <Card>
        <CardHeader>
          <CardTitle>COO Approved Requests</CardTitle>
          <CardDescription>
            Mark as waiting for funds or approve for payment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PettyCashTable
            requests={cooApprovedRequests}
            user={user}
            statusColors={statusColors}
            onView={onView}
            onWaiting={onWaiting}
            onApproved={onApproved}
            showFinanceButtons={true}
          />
        </CardContent>
      </Card>

      {/* My Requests */}
      <Card>
        <CardHeader>
          <CardTitle>My Requests</CardTitle>
          <CardDescription>
            Petty cash requests you have submitted
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PettyCashTable
            requests={myRequests}
            user={user}
            statusColors={statusColors}
            onView={onView}
            onResubmit={onResubmit}
            onDelete={onDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
}
