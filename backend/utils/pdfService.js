import PDFDocument from 'pdfkit';
import axios from 'axios';

// Helper to draw colored section header
const drawSectionHeader = (doc, title, color, symbol) => {
  const currentY = doc.y;
  
  // Draw colored rectangle background
  doc
    .fillColor(color)
    .rect(40, currentY, doc.page.width - 80, 35)
    .fill();
  
  // Draw section title with symbol
  doc
    .fillColor('white')
    .fontSize(14)
    .font('Helvetica-Bold')
    .text(`${symbol}  ${title}`, 50, currentY + 10);
  
  // Reset to black for content
  doc.fillColor('black').font('Helvetica');
  doc.moveDown(1.5);
};

// Helper to draw numbered list item with circular badge
const drawListItem = (doc, number, text, badgeColor = '#3b82f6') => {
  const currentY = doc.y;
  const badgeSize = 20;
  const textX = 70;
  
  // Draw circular badge
  doc
    .fillColor(badgeColor)
    .circle(50, currentY + badgeSize / 2, badgeSize / 2)
    .fill();
  
  // Draw number in badge
  doc
    .fillColor('white')
    .fontSize(10)
    .font('Helvetica-Bold')
    .text(number.toString(), 44, currentY + 5, { width: badgeSize, align: 'center' });
  
  // Draw item text
  doc
    .fillColor('black')
    .fontSize(11)
    .font('Helvetica')
    .text(text, textX, currentY, { width: doc.page.width - textX - 50 });
  
  doc.moveDown(0.3);
};

// Fetch logo image from URL
const fetchLogo = async (logoUrl) => {
  try {
    const response = await axios.get(logoUrl, {
      responseType: 'arraybuffer',
      timeout: 5000, // 5 second timeout
    });
    return Buffer.from(response.data);
  } catch (error) {
    console.error('Failed to fetch logo:', error.message);
    return null;
  }
};

export const generateReportPdf = ({ hospital, report, patient, assistantName }) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  const hospitalName = hospital?.name || 'Hospital';
  const assistant = assistantName || 'HealthAI';
  const primaryColor = hospital?.primaryColor || '#0f172a';
  const secondaryColor = hospital?.secondaryColor || '#0ea5e9';

  // === HEADER SECTION ===
  // Note: Logo fetching is async but PDFKit is sync-only
  // Logo feature temporarily disabled - would need different approach
  
  doc.moveDown(2);

  // Hospital name with colored underline
  doc
    .fontSize(24)
    .font('Helvetica-Bold')
    .fillColor(primaryColor)
    .text(hospitalName, { align: 'center' });
  
  // Draw underline
  const nameY = doc.y;
  doc
    .moveTo(150, nameY + 5)
    .lineTo(doc.page.width - 150, nameY + 5)
    .lineWidth(3)
    .strokeColor(secondaryColor)
    .stroke();
  
  doc.moveDown(0.5);
  
  // Assistant name
  doc
    .fontSize(12)
    .fillColor('#64748b')
    .font('Helvetica')
    .text(`AI Assistant: ${assistant}`, { align: 'center' });
  
  doc.moveDown(1.5);

  // Patient info box
  doc
    .fillColor('#f1f5f9')
    .rect(40, doc.y, doc.page.width - 80, 70)
    .fill();
  
  const infoY = doc.y + 10;
  doc
    .fillColor('#1e293b')
    .fontSize(11)
    .text(`Patient: ${patient?.name || 'Unknown'}`, 50, infoY)
    .text(`Email: ${patient?.email || '-'}`, 50, infoY + 20)
    .text(`Report Date: ${new Date(report.createdAt).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, 50, infoY + 40);
  
  doc.y += 70;
  doc.moveDown(1);

  // Risk level badge
  const riskColors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
    critical: '#dc2626'
  };
  const riskLevel = report.riskLevel || 'low';
  const riskColor = riskColors[riskLevel] || riskColors.low;
  
  doc
    .fillColor(riskColor)
    .roundedRect(40, doc.y, 150, 30, 5)
    .fill();
  
  doc
    .fillColor('white')
    .fontSize(12)
    .font('Helvetica-Bold')
    .text(`Risk Level: ${riskLevel.toUpperCase()}`, 50, doc.y + 8, { width: 140 });
  
  doc.fillColor('black').font('Helvetica');
  doc.moveDown(2);

  // === SUMMARY SECTION ===
  drawSectionHeader(doc, 'Summary', '#10b981', '📄');
  doc.fontSize(11).text(report.summary || 'No summary provided.', { align: 'justify' });
  doc.moveDown(1);

  // === POSSIBLE CONDITIONS ===
  if (Array.isArray(report.possibleConditions) && report.possibleConditions.length > 0) {
    drawSectionHeader(doc, 'Possible Conditions', '#f43f5e', '❤️');
    
    report.possibleConditions.forEach((condition, index) => {
      const probability = condition.probability 
        ? ` (${condition.probability})`
        : '';
      const text = `${condition.name || 'Condition'}${probability}${
        condition.notes ? '\n   ' + condition.notes : ''
      }`;
      drawListItem(doc, index + 1, text, '#f43f5e');
    });
    doc.moveDown(0.5);
  }

  // === RECOMMENDED TESTS ===
  if (Array.isArray(report.recommendedTests) && report.recommendedTests.length > 0) {
    drawSectionHeader(doc, 'Recommended Tests', '#8b5cf6', '🧪');
    
    report.recommendedTests.forEach((test, index) => {
      const priority = test.priority ? ` [${test.priority.toUpperCase()}]` : '';
      const text = `${test.name || 'Test'}${priority}${
        test.notes ? '\n   ' + test.notes : ''
      }`;
      drawListItem(doc, index + 1, text, '#8b5cf6');
    });
    doc.moveDown(0.5);
  }

  // === DIET PLAN ===
  if (Array.isArray(report.dietPlan) && report.dietPlan.length > 0) {
    drawSectionHeader(doc, 'Diet Plan', '#059669', '🍎');
    
    report.dietPlan.forEach((item, index) => {
      drawListItem(doc, index + 1, item, '#059669');
    });
    doc.moveDown(0.5);
  }

  // === WHAT TO AVOID ===
  if (Array.isArray(report.whatToAvoid) && report.whatToAvoid.length > 0) {
    drawSectionHeader(doc, 'What to Avoid', '#ea580c', '⚠️');
    
    report.whatToAvoid.forEach((item, index) => {
      drawListItem(doc, '✕', item, '#ea580c');
    });
    doc.moveDown(0.5);
  }

  // === HOME CARE ===
  if (Array.isArray(report.homeCare) && report.homeCare.length > 0) {
    drawSectionHeader(doc, 'Home Care Guidance', '#0284c7', '🏠');
    
    report.homeCare.forEach((item, index) => {
      drawListItem(doc, index + 1, item, '#0284c7');
    });
    doc.moveDown(0.5);
  }

  // === RECOMMENDED DOCTOR ===
  if (report.recommendedDoctor) {
    const doctor = report.recommendedDoctor;
    drawSectionHeader(doc, 'Recommended Doctor', '#6366f1', '🩺');
    
    doc
      .fontSize(13)
      .font('Helvetica-Bold')
      .text(doctor.name || 'N/A');
    
    doc.font('Helvetica').fontSize(11);
    
    if (doctor.specialization) {
      doc.text(`Specialization: ${doctor.specialization}`);
    }
    if (doctor.timings) {
      doc.text(`Available: ${doctor.timings}`);
    }
    if (doctor.description) {
      doc.moveDown(0.3);
      doc.fontSize(10).fillColor('#64748b').text(doctor.description);
      doc.fillColor('black').fontSize(11);
    }
    doc.moveDown(0.5);
  }

  // === FOOTER / DISCLAIMER ===
  doc.moveDown(2);
  
  // Draw separator line
  doc
    .moveTo(40, doc.y)
    .lineTo(doc.page.width - 40, doc.y)
    .lineWidth(1)
    .strokeColor('#cbd5e1')
    .stroke();
  
  doc.moveDown(0.5);
  
  doc
    .fontSize(9)
    .fillColor('#64748b')
    .text(
      '⚕️ This is an AI-generated pre-assessment report and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.',
      { align: 'center' }
    );

  doc.end();
  return doc;
};
