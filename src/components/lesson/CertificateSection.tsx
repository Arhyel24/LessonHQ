
import { Download, Lock, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CertificateSectionProps {
  isComplete: boolean;
  courseName: string;
}

export const CertificateSection = ({ isComplete, courseName }: CertificateSectionProps) => {
  const handleDownload = () => {
    // Implement certificate download logic
    console.log(`Downloading certificate for ${courseName}`);
  };

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 font-poppins text-lg">
          <div className={`p-2 rounded-lg ${isComplete ? 'bg-yellow-500' : 'bg-gray-300'}`}>
            <Award className={`h-5 w-5 ${isComplete ? 'text-white' : 'text-gray-500'}`} />
          </div>
          Course Certificate
        </CardTitle>
      </CardHeader>

      <CardContent>
        {isComplete ? (
          <div className="space-y-4">
            <p className="font-nunito text-gray-700">
              🎉 Congratulations! You've completed <strong>{courseName}</strong>. 
              Download your certificate to showcase your new skills.
            </p>
            <Button
              onClick={handleDownload}
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-medium"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Certificate
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <Lock className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-600 text-sm">
                  Certificate Locked
                </p>
                <p className="text-xs text-gray-500">
                  Complete all lessons to unlock your certificate
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
