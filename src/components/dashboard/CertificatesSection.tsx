"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Award } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Certificate {
  id: string;
  courseName: string;
  completedDate: string | null;
  available: boolean;
  progress: number;
  lessonsCompleted: number;
  totalLessons: number;
  purchaseDate?: string;
  certificateIssued: boolean;
}

export const CertificatesSection = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const res = await fetch("/api/certificates");
        const json = await res.json();

        if (!res.ok) throw new Error("Failed to fetch certificates");

        setCertificates(json.data || []);
      } catch (err) {
        console.error("Could not fetch your certificates.", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-poppins font-semibold text-xl text-gray-900">
          Certificates
        </h2>
        <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
          <Award className="w-5 h-5 text-accent" />
        </div>
      </div>

      {loading ? (
        <p className="font-nunito text-gray-500 text-sm">Loading...</p>
      ) : certificates.length > 0 ? (
        <div className="space-y-4">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className={`border rounded-lg p-4 flex items-center justify-between ${
                cert.available
                  ? "border-green-200 bg-green-50"
                  : "border-gray-200"
              }`}
            >
              <div>
                <h3 className="font-inter font-medium text-gray-900 mb-1">
                  {cert.courseName}
                </h3>
                <p className="font-nunito text-sm text-gray-600">
                  {cert.available
                    ? `Completed: ${cert.completedDate}`
                    : cert.completedDate
                    ? `In Progress: ${cert.progress}%`
                    : "Not completed"}
                </p>
              </div>
              <Button
                size="sm"
                disabled={!cert.available}
                className={
                  cert.available
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : ""
                }
              >
                <Download className="w-4 h-4 mr-2" />
                {cert.available ? "Download" : "Locked"}
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="font-nunito text-gray-500 text-sm">
            Complete courses to earn certificates
          </p>
        </div>
      )}
    </div>
  );
};
