"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DocumentData {
  candidate_name: string;
  candidate_no: string;
  college_no: string;
  session: string;
  sex: string;
  
  p1_cd: string;
  p1_t: string;
  p1_i: string;
  p2_cd: string;
  p2_t: string;
  p2_i: string;
  p3_cd: string;
  p3_t: string;
  p3_i: string;
  p4_cd: string;
  p4_t: string;
  p4_i: string;
  p5_cd: string;
  p5_t: string;
  p5_i: string;
  p6_cd: string;
  p6_t: string;
  p6_i: string;
  
  c1: string;
  sgp1: string;
  c2: string;
  sgp2: string;
  c3: string;
  sgp3: string;
  c4: string;
  sgp4: string;
  c5: string;
  sgp5: string;
  c6: string;
  sgp6: string;
  
  cgpa: string;
  gcgpa: string;
  percentage: string;
  rslt: string;
  res: string;
  frem: string;
}

export default function PreviewDocumentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const seat_no = searchParams.get("seat_no");

  const [documentData, setDocumentData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (seat_no) {
      fetchDocumentData();
    } else {
      setError("No seat number provided");
      setLoading(false);
    }
  }, [seat_no]);

  const fetchDocumentData = async () => {
    try {
      const token = localStorage.getItem("auth-token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/preview-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ seat_no }),
      });

      if (response.ok) {
        const data = await response.json();
        setDocumentData(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch document data");
      }
    } catch (err) {
      console.error("Error fetching document data:", err);
      setError("An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof DocumentData, value: string) => {
    if (documentData) {
      setDocumentData({
        ...documentData,
        [field]: value,
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const token = localStorage.getItem("auth-token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/generate-result", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ seat_no }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Result_${seat_no}.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to generate document");
      }
    } catch (err) {
      console.error("Error downloading document:", err);
      alert("An error occurred while downloading");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <p>Loading document data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">{error}</p>
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="mt-4"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!documentData) {
    return (
      <div className="container mx-auto p-6">
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Action Buttons - Hidden when printing */}
      <div className="mb-6 flex gap-4 print:hidden">
        <Button onClick={handlePrint} variant="default">
          Print Document
        </Button>
        <Button
          onClick={handleDownload}
          variant="outline"
          disabled={downloading}
        >
          {downloading ? "Downloading..." : "Download DOCX"}
        </Button>
        <Button onClick={() => router.back()} variant="outline">
          Back
        </Button>
      </div>

      {/* Document Preview */}
      <Card className="print:border-none print:shadow-none">
        <CardHeader className="print:p-0">
          <CardTitle className="text-2xl">Document Preview</CardTitle>
          <p className="text-sm text-muted-foreground print:hidden">
            Edit any fields below before printing or downloading
          </p>
        </CardHeader>
        <CardContent className="space-y-6 print:p-0">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="candidate_name">Candidate Name</Label>
                <Input
                  id="candidate_name"
                  value={documentData.candidate_name}
                  onChange={(e) =>
                    updateField("candidate_name", e.target.value)
                  }
                  className="print:border-none print:p-0"
                />
              </div>
              <div>
                <Label htmlFor="candidate_no">Candidate Number</Label>
                <Input
                  id="candidate_no"
                  value={documentData.candidate_no}
                  onChange={(e) => updateField("candidate_no", e.target.value)}
                  className="print:border-none print:p-0"
                />
              </div>
              <div>
                <Label htmlFor="college_no">College Number</Label>
                <Input
                  id="college_no"
                  value={documentData.college_no}
                  onChange={(e) => updateField("college_no", e.target.value)}
                  className="print:border-none print:p-0"
                />
              </div>
              <div>
                <Label htmlFor="session">Session</Label>
                <Input
                  id="session"
                  value={documentData.session}
                  onChange={(e) => updateField("session", e.target.value)}
                  className="print:border-none print:p-0"
                />
              </div>
              <div>
                <Label htmlFor="sex">Sex</Label>
                <Input
                  id="sex"
                  value={documentData.sex}
                  onChange={(e) => updateField("sex", e.target.value)}
                  className="print:border-none print:p-0"
                />
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="rslt">Result Status (RSLT)</Label>
                <Input
                  id="rslt"
                  value={documentData.rslt}
                  onChange={(e) => updateField("rslt", e.target.value)}
                  className="print:border-none print:p-0"
                />
              </div>
              <div>
                <Label htmlFor="res">Result (RES)</Label>
                <Input
                  id="res"
                  value={documentData.res}
                  onChange={(e) => updateField("res", e.target.value)}
                  className="print:border-none print:p-0"
                />
              </div>
              <div>
                <Label htmlFor="frem">FREM</Label>
                <Input
                  id="frem"
                  value={documentData.frem}
                  onChange={(e) => updateField("frem", e.target.value)}
                  className="print:border-none print:p-0"
                />
              </div>
            </div>
          </div>

          {/* Papers */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">
              Papers & Marks
            </h3>
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div key={num} className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Paper {num}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`p${num}_cd`}>Paper Code</Label>
                    <Input
                      id={`p${num}_cd`}
                      value={
                        documentData[`p${num}_cd` as keyof DocumentData] || ""
                      }
                      onChange={(e) =>
                        updateField(
                          `p${num}_cd` as keyof DocumentData,
                          e.target.value
                        )
                      }
                      className="print:border-none print:p-0"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`p${num}_t`}>Theory Marks</Label>
                    <Input
                      id={`p${num}_t`}
                      value={
                        documentData[`p${num}_t` as keyof DocumentData] || ""
                      }
                      onChange={(e) =>
                        updateField(
                          `p${num}_t` as keyof DocumentData,
                          e.target.value
                        )
                      }
                      className="print:border-none print:p-0"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`p${num}_i`}>Internal Marks</Label>
                    <Input
                      id={`p${num}_i`}
                      value={
                        documentData[`p${num}_i` as keyof DocumentData] || ""
                      }
                      onChange={(e) =>
                        updateField(
                          `p${num}_i` as keyof DocumentData,
                          e.target.value
                        )
                      }
                      className="print:border-none print:p-0"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Semester Credits & SGPs */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">
              Semester Credits & SGPs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div key={num} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Semester {num}</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor={`c${num}`}>Credits (C{num})</Label>
                      <Input
                        id={`c${num}`}
                        value={
                          documentData[`c${num}` as keyof DocumentData] || ""
                        }
                        onChange={(e) =>
                          updateField(
                            `c${num}` as keyof DocumentData,
                            e.target.value
                          )
                        }
                        className="print:border-none print:p-0"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`sgp${num}`}>SGP{num}</Label>
                      <Input
                        id={`sgp${num}`}
                        value={
                          documentData[`sgp${num}` as keyof DocumentData] || ""
                        }
                        onChange={(e) =>
                          updateField(
                            `sgp${num}` as keyof DocumentData,
                            e.target.value
                          )
                        }
                        className="print:border-none print:p-0"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Overall Performance */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">
              Overall Performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cgpa">CGPA</Label>
                <Input
                  id="cgpa"
                  value={documentData.cgpa}
                  onChange={(e) => updateField("cgpa", e.target.value)}
                  className="print:border-none print:p-0"
                />
              </div>
              <div>
                <Label htmlFor="gcgpa">GCGPA</Label>
                <Input
                  id="gcgpa"
                  value={documentData.gcgpa}
                  onChange={(e) => updateField("gcgpa", e.target.value)}
                  className="print:border-none print:p-0"
                />
              </div>
              <div>
                <Label htmlFor="percentage">Percentage</Label>
                <Input
                  id="percentage"
                  value={documentData.percentage}
                  onChange={(e) => updateField("percentage", e.target.value)}
                  className="print:border-none print:p-0"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
