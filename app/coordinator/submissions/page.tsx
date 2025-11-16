"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface ChangeRequest {
  id: string;
  coordinator_id: string;
  coordinator_name: string;
  faculty: string;
  student_seat_no: string;
  student_name: string;
  session: string;
  changes: string;
  document_type: string;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  faculty_comment: string | null;
}

export default function CoordinatorSubmissionsPage() {
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      // Check localStorage first, then cookies
      let token = localStorage.getItem("auth-token");
      
      if (!token) {
        token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("auth-token="))
          ?.split("=")[1] || null;
      }

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/change-requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setRequests(result.data || result);
      } else {
        console.error("Failed to fetch requests");
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-600 hover:bg-green-700">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN");
  };

  const parseChanges = (changesStr: string) => {
    try {
      return JSON.parse(changesStr);
    } catch {
      return {};
    }
  };

  const fieldLabels: { [key: string]: string } = {
    rslt: "Result Status (RSLT)",
    res: "Result (RES)",
    c1: "Semester 1 Credits",
    sgp1: "Semester 1 SGP",
    c2: "Semester 2 Credits",
    sgp2: "Semester 2 SGP",
    c3: "Semester 3 Credits",
    sgp3: "Semester 3 SGP",
    c4: "Semester 4 Credits",
    sgp4: "Semester 4 SGP",
    c5: "Semester 5 Credits",
    sgp5: "Semester 5 SGP",
    c6: "Semester 6 Credits",
    sgp6: "Semester 6 SGP",
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <p>Loading submissions...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">My Submissions</h1>
        <p className="text-muted-foreground">
          View all your change requests and their status
        </p>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              No submissions found. Submit a change request to see it here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Seat No</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {request.student_name}
                    </TableCell>
                    <TableCell>{request.student_seat_no}</TableCell>
                    <TableCell>{request.session}</TableCell>
                    <TableCell>{request.document_type}</TableCell>
                    <TableCell>{formatDate(request.submitted_at)}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Request Details</DialogTitle>
                              <DialogDescription>
                                Change request for {request.student_name} (
                                {request.student_seat_no})
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">
                                    Session
                                  </Label>
                                  <p className="text-sm text-muted-foreground">
                                    {request.session}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">
                                    Document Type
                                  </Label>
                                  <p className="text-sm text-muted-foreground">
                                    {request.document_type}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">
                                    Submitted At
                                  </Label>
                                  <p className="text-sm text-muted-foreground">
                                    {formatDate(request.submitted_at)}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">
                                    Status
                                  </Label>
                                  <div className="mt-1">
                                    {getStatusBadge(request.status)}
                                  </div>
                                </div>
                              </div>

                              <div>
                                <Label className="text-sm font-medium mb-2 block">
                                  Changes Requested
                                </Label>
                                <Card>
                                  <CardContent className="p-4">
                                    <div className="space-y-2">
                                      {Object.entries(
                                        parseChanges(request.changes)
                                      ).map(([key, value]) => (
                                        <div
                                          key={key}
                                          className="flex justify-between items-center border-b pb-2 last:border-b-0"
                                        >
                                          <span className="font-medium text-sm">
                                            {fieldLabels[key] || key}:
                                          </span>
                                          <span className="text-sm text-muted-foreground">
                                            {String(value)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>

                              {request.status !== "pending" && (
                                <div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium">
                                        Reviewed At
                                      </Label>
                                      <p className="text-sm text-muted-foreground">
                                        {request.reviewed_at
                                          ? formatDate(request.reviewed_at)
                                          : "N/A"}
                                      </p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">
                                        Reviewed By
                                      </Label>
                                      <p className="text-sm text-muted-foreground">
                                        {request.reviewed_by || "N/A"}
                                      </p>
                                    </div>
                                  </div>
                                  {request.faculty_comment && (
                                    <div className="mt-4">
                                      <Label className="text-sm font-medium">
                                        Admin Comment
                                      </Label>
                                      <Card className="mt-2">
                                        <CardContent className="p-3">
                                          <p className="text-sm">
                                            {request.faculty_comment}
                                          </p>
                                        </CardContent>
                                      </Card>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>

                        {request.status === "approved" && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/coordinator/preview-document?seat_no=${request.student_seat_no}`
                              )
                            }
                          >
                            Generate Document
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
