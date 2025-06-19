import PDFDocument from "pdfkit";

export interface CertificateData {
  studentName: string;
  courseName: string;
  completionDate: Date;
  instructorName: string;
  certificateId: string;
}

export async function generateCertificate(
  data: CertificateData
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const buffers: Uint8Array[] = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Certificate background
      doc.rect(0, 0, doc.page.width, doc.page.height).fill("#f8f9fa");

      // Border
      doc
        .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
        .stroke("#2563eb").lineWidth(2);

      // Inner border
      doc
        .rect(40, 40, doc.page.width - 80, doc.page.height - 80)
        .stroke("#3b82f6").lineWidth(1);

      // Title
      doc
        .fontSize(36)
        .font("Helvetica-Bold")
        .fillColor("#1e40af")
        .text("CERTIFICATE OF COMPLETION", 0, 120, { align: "center" });

      // Subtitle
      doc
        .fontSize(18)
        .font("Helvetica")
        .fillColor("#374151")
        .text("This is to certify that", 0, 180, { align: "center" });

      // Student name
      doc
        .fontSize(32)
        .font("Helvetica-Bold")
        .fillColor("#1f2937")
        .text(data.studentName, 0, 220, { align: "center" });

      // Course completion text
      doc
        .fontSize(18)
        .font("Helvetica")
        .fillColor("#374151")
        .text("has successfully completed the course", 0, 280, {
          align: "center",
        });

      // Course name
      doc
        .fontSize(24)
        .font("Helvetica-Bold")
        .fillColor("#2563eb")
        .text(data.courseName, 0, 320, { align: "center" });

      // Completion date
      doc
        .fontSize(16)
        .font("Helvetica")
        .fillColor("#6b7280")
        .text(
          `Completed on ${data.completionDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}`,
          0,
          380,
          { align: "center" }
        );

      // Instructor signature area
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .fillColor("#374151")
        .text("Instructor", 150, 450);

      doc.fontSize(12).font("Helvetica").text(data.instructorName, 150, 470);

      // Certificate ID
      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#9ca3af")
        .text(
          `Certificate ID: ${data.certificateId}`,
          0,
          doc.page.height - 80,
          { align: "center" }
        );

      // Platform name
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fillColor("#2563eb")
        .text("LearnHQ Platform", 0, doc.page.height - 60, { align: "center" });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export function generateCertificateId(
  userId: string,
  courseId: string
): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const userHash = userId.slice(-4).toUpperCase();
  const courseHash = courseId.slice(-4).toUpperCase();
  return `CERT-${userHash}-${courseHash}-${timestamp}`;
}
