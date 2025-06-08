import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users } from "lucide-react";

interface AffiliateRecord {
  id: string;
  name: string;
  dateReferred: string;
  status: "Registered" | "Course Started" | "Completed" | "Pending";
  reward: number;
}

interface AffiliateHistoryTableProps {
  history: AffiliateRecord[];
}

export const AffiliateHistoryTable = ({
  history,
}: AffiliateHistoryTableProps) => {
  const getStatusBadge = (status: AffiliateRecord["status"]) => {
    const statusConfig = {
      Completed: {
        variant: "default" as const,
        className: "bg-green-100 text-green-800",
      },
      "Course Started": {
        variant: "secondary" as const,
        className: "bg-yellow-100 text-yellow-800",
      },
      Registered: {
        variant: "outline" as const,
        className: "bg-blue-100 text-blue-800",
      },
      Pending: {
        variant: "secondary" as const,
        className: "bg-gray-100 text-gray-600",
      },
    };

    const config = statusConfig[status];

    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-poppins font-semibold text-lg text-gray-900 mb-2">
            No Affiliates Yet
          </h3>
          <p className="font-nunito text-gray-600">
            You haven&apos;t referred anyone yet. Share your link and start earning!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-poppins text-lg flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Users className="h-5 w-5 text-primary" />
          </div>
          Affiliate History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-inter font-semibold">Name</TableHead>
                <TableHead className="font-inter font-semibold">
                  Date Referred
                </TableHead>
                <TableHead className="font-inter font-semibold">
                  Status
                </TableHead>
                <TableHead className="font-inter font-semibold text-right">
                  Reward Earned
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-nunito font-medium">
                    {record.name}
                  </TableCell>
                  <TableCell className="font-nunito text-gray-600">
                    {formatDate(record.dateReferred)}
                  </TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                  <TableCell className="text-right font-inter font-semibold">
                    {record.reward > 0
                      ? `₦${record.reward}`
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile view */}
        <div className="md:hidden space-y-4">
          {history.map((record) => (
            <div key={record.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-nunito font-medium text-gray-900">
                    {record.name}
                  </p>
                  <p className="font-nunito text-sm text-gray-600">
                    {formatDate(record.dateReferred)}
                  </p>
                </div>
                <div className="text-right">
                  {getStatusBadge(record.status)}
                  <p className="font-inter font-semibold text-sm mt-1">
                    {record.reward > 0
                      ? `₦${record.reward}`
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
