import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import type { PettyCashStatus } from '@/types';

export interface PettyCashFilters {
  amountMin: string;
  amountMax: string;
  fileNumber: string;
  dateFrom: string;
  dateTo: string;
  status: PettyCashStatus | 'all';
  requester: string;
}

interface PettyCashFilterProps {
  filters: PettyCashFilters;
  onFiltersChange: (filters: PettyCashFilters) => void;
  onClearFilters: () => void;
  showRequesterFilter?: boolean;
}

export function PettyCashFilter({
  filters,
  onFiltersChange,
  onClearFilters,
  showRequesterFilter = false,
}: PettyCashFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof PettyCashFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = 
    filters.amountMin || 
    filters.amountMax || 
    filters.fileNumber || 
    filters.dateFrom || 
    filters.dateTo || 
    filters.status !== 'all' ||
    filters.requester;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
              Active
            </span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="gap-2 text-gray-600"
          >
            <X className="w-4 h-4" />
            Clear
          </Button>
        )}
      </div>

      {isExpanded && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Amount Range */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Amount Range</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.amountMin}
                    onChange={(e) => handleFilterChange('amountMin', e.target.value)}
                    className="h-9"
                  />
                  <span className="text-gray-500">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.amountMax}
                    onChange={(e) => handleFilterChange('amountMax', e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>

              {/* File Number */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">File Number</Label>
                <Input
                  placeholder="Search by file number"
                  value={filters.fileNumber}
                  onChange={(e) => handleFilterChange('fileNumber', e.target.value)}
                  className="h-9"
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="PENDING_HR_APPROVAL">Pending HR</SelectItem>
                    <SelectItem value="PENDING_MANAGER_APPROVAL">Pending Manager</SelectItem>
                    <SelectItem value="PENDING_DECLARATION_MANAGER_APPROVAL">Pending Declaration</SelectItem>
                    <SelectItem value="PENDING_COO_APPROVAL">Pending COO</SelectItem>
                    <SelectItem value="APPROVED_BY_COO">Approved by COO</SelectItem>
                    <SelectItem value="PENDING_FINANCE">Pending Finance</SelectItem>
                    <SelectItem value="PENDING_PAYMENT">Pending Payment</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="REJECTED_BY_HR">Rejected by HR</SelectItem>
                    <SelectItem value="REJECTED_BY_MANAGER">Rejected by Manager</SelectItem>
                    <SelectItem value="REJECTED_BY_DECLARATION_MANAGER">Rejected by Declaration</SelectItem>
                    <SelectItem value="REJECTED_BY_COO">Rejected by COO</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date From */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Date From</Label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="h-9"
                />
              </div>

              {/* Date To */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Date To</Label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="h-9"
                />
              </div>

              {/* Requester (for managers only) */}
              {showRequesterFilter && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Requester</Label>
                  <Input
                    placeholder="Search by requester name"
                    value={filters.requester}
                    onChange={(e) => handleFilterChange('requester', e.target.value)}
                    className="h-9"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
