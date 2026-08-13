import PDFDocument from "pdfkit";

// Renders plain-text content (produced by the planning chat) into a simple,
// consistent PDF: title, generated-on date, then body with basic heading
// detection (short ALL-CAPS or Title Case lines standing alone get styled
// as section headers). Good enough for v1 — swap for a templated layout
// per document type once real customers are asking for polish here.
export function renderDocumentPDF(title: string, body: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 56 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.font("Helvetica-Bold").fontSize(20).text(title, { align: "left" });
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#585B68")
      .text(`Generated ${new Date().toLocaleDateString("en-US", { dateStyle: "long" })}`);
    doc.moveDown(1.5);
    doc.fillColor("#20222B");

    const lines = body.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        doc.moveDown(0.5);
        continue;
      }
      const looksLikeHeading = trimmed.length < 60 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed);
      if (looksLikeHeading) {
        doc.moveDown(0.75);
        doc.font("Helvetica-Bold").fontSize(13).text(trimmed);
        doc.font("Helvetica").fontSize(11);
      } else {
        doc.fontSize(11).text(trimmed, { lineGap: 3 });
      }
    }

    doc.end();
  });
}
