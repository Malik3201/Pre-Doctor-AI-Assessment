import PDFDocument from 'pdfkit';

export const generateReportPdf = ({ hospital, report, patient, assistantName }) => {
  const doc = new PDFDocument({ margin: 40 });

  const hospitalName = hospital?.name || 'Hospital';
  const assistant = assistantName || 'HealthAI';

  doc.fontSize(20).text(hospitalName, { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(12).text(`Assistant: ${assistant}`, { align: 'center' });
  doc.moveDown(1);

  doc.fontSize(12).text(`Patient: ${patient?.name || 'Unknown'}`);
  doc.text(`Email: ${patient?.email || '-'}`);
  doc.text(`Report Date: ${new Date(report.createdAt).toLocaleString()}`);
  doc.moveDown(1);

  doc.fontSize(14).text(`Risk Level: ${(report.riskLevel || 'unknown').toUpperCase()}`);
  doc.moveDown(0.5);

  doc.fontSize(13).text('Summary', { underline: true });
  doc.fontSize(12).text(report.summary || 'No summary provided.');
  doc.moveDown(0.5);

  if (Array.isArray(report.possibleConditions) && report.possibleConditions.length > 0) {
    doc.fontSize(13).text('Possible Conditions', { underline: true });
    report.possibleConditions.forEach((condition, index) => {
      const probability =
        typeof condition.probability === 'number'
          ? ` (p≈${Math.round(condition.probability * 100)}%)`
          : '';
      doc.fontSize(12).text(`${index + 1}. ${condition.name || 'Condition'}${probability}`);
      if (condition.notes) {
        doc.fontSize(10).text(`   Notes: ${condition.notes}`);
      }
    });
    doc.moveDown(0.5);
  }

  if (Array.isArray(report.recommendedTests) && report.recommendedTests.length > 0) {
    doc.fontSize(13).text('Recommended Tests', { underline: true });
    report.recommendedTests.forEach((test, index) => {
      doc
        .fontSize(12)
        .text(
          `${index + 1}. ${test.name || 'Test'} [${(test.priority || 'medium').toUpperCase()}]`
        );
      if (test.notes) {
        doc.fontSize(10).text(`   Notes: ${test.notes}`);
      }
    });
    doc.moveDown(0.5);
  }

  if (Array.isArray(report.dietPlan) && report.dietPlan.length > 0) {
    doc.fontSize(13).text('Diet Plan', { underline: true });
    report.dietPlan.forEach((item, index) => {
      doc.fontSize(12).text(`${index + 1}. ${item}`);
    });
    doc.moveDown(0.5);
  }

  if (Array.isArray(report.whatToAvoid) && report.whatToAvoid.length > 0) {
    doc.fontSize(13).text('What to Avoid', { underline: true });
    report.whatToAvoid.forEach((item, index) => {
      doc.fontSize(12).text(`${index + 1}. ${item}`);
    });
    doc.moveDown(0.5);
  }

  if (Array.isArray(report.homeCare) && report.homeCare.length > 0) {
    doc.fontSize(13).text('Home Care Suggestions', { underline: true });
    report.homeCare.forEach((item, index) => {
      doc.fontSize(12).text(`${index + 1}. ${item}`);
    });
    doc.moveDown(0.5);
  }

  if (report.recommendedDoctor) {
    const doctor = report.recommendedDoctor;
    doc.fontSize(13).text('Recommended Doctor', { underline: true });
    doc.fontSize(12).text(`Name: ${doctor.name || 'N/A'}`);
    if (doctor.specialization) {
      doc.text(`Specialization: ${doctor.specialization}`);
    }
    if (doctor.timings) {
      doc.text(`Timings: ${doctor.timings}`);
    }
    doc.moveDown(0.5);
  }

  doc.moveDown(1);
  doc
    .fontSize(9)
    .text(
      'AI-generated pre-assessment, not a final diagnosis. Please consult a licensed doctor for actual medical advice.',
      { align: 'center' }
    );

  doc.end();
  return doc;
};

