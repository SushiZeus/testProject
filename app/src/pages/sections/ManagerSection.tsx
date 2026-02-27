// Manager Section - Shows "Requests to Approve" and "My Requests" tables
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PettyCashTable } from '@/components/PettyCashTable';
import type { PettyCashRequest, User } from '@/types';

interface ManagerSectionProps {
  user: User;
  requestsToApprove: PettyCashRequest[];
  myRequests: PettyCashRequest[];
  statusColors: Record<string, string>;
  onView: (request: PettyCashRequest) => void;
  onApprove: (request: PettyCashRequest) => void;
  onReject: (request: PettyCashRequest) => void;
  onResubmit: (request: PettyCashRequest) => void;
  onDelete: (request: PettyCashRequest) => void;
}

export function ManagerSection({
  user,
  requestsToApprove,
  myRequests,
  statusColors,
  onView,
  onApprove,
  onReject,
  onResubmit,
  onDelete,
}: ManagerSectionProps) {
  return (
    <div className="space-y-6">
      {/* Requests to Approve */}
      <Card>
        <CardHeader>
          <CardTitle>Requests to Approve</CardTitle>
          <CardDescription>
            Review and approve requests from your team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PettyCashTable
            requests={requestsToApprove}
            user={user}
            statusColors={statusColors}
            onView={onView}
            onApprove={onApprove}
            onReject={onReject}
            showApproveReject={true}
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
