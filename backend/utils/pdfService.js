import PDFDocument from 'pdfkit';
import axios from 'axios';

// Clean Professional Medical Colors - Subtle palette
const COLORS = {
  primary: '#1e5a8e',      // Professional Blue
  text: '#2c3e50',         // Dark Gray Text
  textLight: '#6b7280',    // Light Gray Text
  border: '#e5e7eb',       // Light Border
  borderDark: '#d1d5db',   // Darker Border
  background: '#f9fafb',   // Very Light Background
  white: '#ffffff',
  
  // Risk colors - more subtle
  risk: {
    low: '#10b981',
    medium: '#f59e0b', 
    high: '#ef4444',
    critical: '#dc2626'
  }
};

// Simple Clean Header
const drawHeader = (doc, hospitalName, reportDate) => {
  const margin = 40;
  
  // Hospital name - clean and simple
  doc.fillColor(COLORS.primary)
     .fontSize(16)
     .font('Helvetica-Bold')
     .text(hospitalName, margin, margin);
  
  // Report title - right side
  doc.fontSize(9)
     .fillColor(COLORS.textLight)
     .font('Helvetica')
     .text('AI-POWERED HEALTH ASSESSMENT REPORT', margin, margin + 5, { 
       align: 'right',
       width: doc.page.width - 2 * margin
     });
  
  // Horizontal line
  doc.moveTo(margin, margin + 25)
     .lineTo(doc.page.width - margin, margin + 25)
     .strokeColor(COLORS.primary)
     .lineWidth(2)
     .stroke();
  
  doc.y = margin + 35;
};

// Patient Info - Clean Box
const drawPatientInfo = (doc, patient, reportDate, riskLevel) => {
  const margin = 40;
  const boxY = doc.y;
  
  // Simple border box
  doc.rect(margin, boxY, doc.page.width - 2 * margin, 60)
     .strokeColor(COLORS.border)
     .lineWidth(1)
     .stroke();
  
  // Left side - Patient Info
  doc.fillColor(COLORS.primary)
     .fontSize(9)
     .font('Helvetica-Bold')
     .text('PATIENT INFORMATION', margin + 10, boxY + 10);
  
  doc.fillColor(COLORS.text)
     .fontSize(9)
     .font('Helvetica')
     .text(`PATIENT NAME`, margin + 10, boxY + 25)
     .text(patient?.name || 'N/A', margin + 10, boxY + 35, { width: 150 })
     .text(`EMAIL`, margin + 170, boxY + 25)
     .text(patient?.email || 'N/A', margin + 170, boxY + 35, { width: 150 });
  
  // Right side - Report Details
  const rightX = doc.page.width - margin - 120;
  doc.fillColor(COLORS.text)
     .fontSize(8)
     .text(`REPORT ID`, rightX, boxY + 25)
     .text(`Rpt-${Date.now().toString().slice(-8)}`, rightX, boxY + 35)
     .fontSize(7)
     .fillColor(COLORS.textLight)
     .text(reportDate, rightX, boxY + 48);
  
  // Risk badge - small and clean
  const riskColor = COLORS.risk[riskLevel] || COLORS.risk.low;
  const riskLabel = riskLevel?.toUpperCase() || 'LOW';
  
  doc.roundedRect(rightX - 80, boxY + 8, 70, 18, 3)
     .fillAndStroke(riskColor, riskColor);
  
  doc.fillColor(COLORS.white)
     .fontSize(8)
     .font('Helvetica-Bold')
     .text(`${riskLabel} RISK`, rightX - 80, boxY + 13, { width: 70, align: 'center' });
  
  doc.y = boxY + 70;
};

// Section Header - Clean and Minimal
const drawSection = (doc, title, emoji) => {
  const margin = 40;
  const y = doc.y;
  
  // Left blue bar
  doc.rect(margin, y, 3, 20)
     .fill(COLORS.primary);
  
  // Section title
  doc.fillColor(COLORS.text)
     .fontSize(10)
     .font('Helvetica-Bold')
     .text(title.toUpperCase(), margin + 10, y + 4);
  
  doc.y = y + 25;
};

// Simple numbered list item
const drawNumberedItem = (doc, index, name, details, badge) => {
  const margin = 50;
  const y = doc.y;
  
  // Number circle - minimal
  doc.circle(margin + 8, y + 6, 8)
     .fillAndStroke(COLORS.white, COLORS.primary);
  
  doc.fillColor(COLORS.primary)
     .fontSize(8)
     .font('Helvetica-Bold')
     .text((index + 1).toString(), margin + 5, y + 3);
  
  // Item name
  doc.fillColor(COLORS.text)
     .fontSize(9)
     .font('Helvetica')
     .text(name, margin + 25, y + 2, { width: 330 });
  
  // Badge (probability or priority)
  if (badge) {
    const badgeColors = {
      'HIGH': COLORS.risk.high,
      'MEDIUM': COLORS.risk.medium,
      'LOW': COLORS.risk.low,
      'CRITICAL': COLORS.risk.critical
    };
    const badgeColor = badgeColors[badge.toUpperCase()] || COLORS.primary;
    
    doc.roundedRect(doc.page.width - 120, y + 1, 70, 12, 2)
       .fill(badgeColor);
    
    doc.fillColor(COLORS.white)
       .fontSize(7)
       .font('Helvetica-Bold')
       .text(badge.toUpperCase(), doc.page.width - 120, y + 4, { width: 70, align: 'center' });
  }
  
  // Details
  if (details) {
    doc.fillColor(COLORS.textLight)
       .fontSize(8)
       .font('Helvetica')
       .text(details, margin + 25, y + 13, { width: doc.page.width - margin - 80 });
    doc.y = y + 30;
  } else {
    doc.y = y + 18;
  }
};

// Simple bullet list
const drawBulletItem = (doc, text, color = COLORS.primary) => {
  const margin = 50;
  const y = doc.y;
  
  // Simple bullet
  doc.circle(margin + 8, y + 5, 2.5)
     .fill(color);
  
  // Text
  doc.fillColor(COLORS.text)
     .fontSize(9)
     .font('Helvetica')
     .text(text, margin + 18, y, { width: doc.page.width - margin - 60 });
  
  doc.moveDown(0.5);
};

// Doctor info - simple
const drawDoctorInfo = (doc, name, qualification, specialization) => {
  const margin = 50;
  const y = doc.y;
  
  doc.fillColor(COLORS.text)
     .fontSize(9)
     .font('Helvetica-Bold')
     .text(`Dr. ${name || 'Specialist Consultation Recommended'}`, margin + 8, y);
  
  if (qualification || specialization) {
    const details = [qualification, specialization].filter(Boolean).join(' • ');
    doc.fillColor(COLORS.textLight)
       .fontSize(8)
       .font('Helvetica')
       .text(details, margin + 8, y + 12, { width: doc.page.width - margin - 60 });
    doc.y = y + 28;
  } else {
    doc.y = y + 15;
  }
};

// Footer with disclaimer
const drawFooter = (doc) => {
  const margin = 40;
  
  // Add space if needed
  if (doc.y > doc.page.height - 80) {
    doc.addPage();
  }
  
  // Move to footer position
  const footerY = doc.page.height - 60;
  doc.y = footerY;
  
  // Thin line
  doc.moveTo(margin, footerY)
     .lineTo(doc.page.width - margin, footerY)
     .strokeColor(COLORS.border)
     .lineWidth(0.5)
     .stroke();
  
  // Disclaimer - simple text
  doc.fillColor(COLORS.textLight)
     .fontSize(7)
     .font('Helvetica')
     .text(
       'DISCLAIMER: This is an AI-generated pre-assessment report and is not a substitute for professional medical advice, diagnosis, or treatment. ' +
       'Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.',
       margin, footerY + 8,
       { width: doc.page.width - 2 * margin, align: 'center', lineGap: 1.5 }
     );
};

// Fetch logo image from URL
const fetchLogo = async (logoUrl) => {
  try {
    const response = await axios.get(logoUrl, {
      responseType: 'arraybuffer',
      timeout: 5000,
    });
    return Buffer.from(response.data);
  } catch (error) {
    console.error('Failed to fetch logo:', error.message);
    return null;
  }
};

export const generateReportPdf = ({ hospital, report, patient, assistantName }) => {
  // Create clean, single-page focused document
  const doc = new PDFDocument({ 
    margin: 40, 
    size: 'A4'
  });

  const hospitalName = hospital?.name || 'DHQ Narowal';
  const riskLevel = report.riskLevel || 'low';
  
  const reportDate = new Date(report.createdAt).toLocaleDateString('en-US', { 
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // HEADER
  drawHeader(doc, hospitalName, reportDate);
  doc.moveDown(0.3);
  
  // PATIENT INFO WITH RISK
  drawPatientInfo(doc, patient, reportDate, riskLevel);
  doc.moveDown(0.8);

  // CLINICAL SUMMARY
  drawSection(doc, 'Clinical Summary', '');
  doc.fillColor(COLORS.text)
     .fontSize(9)
     .font('Helvetica')
     .text(report.summary || 'No summary available.', 50, doc.y, {
       width: doc.page.width - 100,
       align: 'justify',
       lineGap: 2
     });
  doc.moveDown(0.8);

  // POSSIBLE CONDITIONS
  if (Array.isArray(report.possibleConditions) && report.possibleConditions.length > 0) {
    drawSection(doc, 'Possible Conditions', '');
    
    report.possibleConditions.forEach((condition, index) => {
      drawNumberedItem(
        doc,
        index,
        condition.name || 'Condition',
        condition.notes || null,
        condition.probability || null
      );
    });
    
    doc.moveDown(0.5);
  }

  // RECOMMENDED TESTS
  if (Array.isArray(report.recommendedTests) && report.recommendedTests.length > 0) {
    drawSection(doc, 'Recommended Diagnostic Tests', '');
    
    report.recommendedTests.forEach((test, index) => {
      drawNumberedItem(
        doc,
        index,
        test.name || 'Test',
        test.notes || null,
        test.priority || null
      );
    });
    
    doc.moveDown(0.5);
  }

  // Check available space before continuing
  const spaceRemaining = doc.page.height - doc.y - 70;
  
  // DIET RECOMMENDATIONS - in 2 columns if space allows
  if (Array.isArray(report.dietPlan) && report.dietPlan.length > 0 && spaceRemaining > 100) {
    drawSection(doc, 'Dietary Recommendations', '');
    
    report.dietPlan.slice(0, 4).forEach((item) => {
      drawBulletItem(doc, item, COLORS.primary);
    });
    
    doc.moveDown(0.5);
  }

  // PRECAUTIONS
  if (Array.isArray(report.whatToAvoid) && report.whatToAvoid.length > 0 && spaceRemaining > 60) {
    drawSection(doc, 'Precautions & Avoidances', '');
    
    report.whatToAvoid.slice(0, 4).forEach((item) => {
      drawBulletItem(doc, item, COLORS.risk.medium);
    });
    
    doc.moveDown(0.5);
  }

  // HOME CARE
  if (Array.isArray(report.homeCare) && report.homeCare.length > 0 && spaceRemaining > 60) {
    drawSection(doc, 'Home Care Instructions', '');
    
    report.homeCare.slice(0, 4).forEach((item) => {
      drawBulletItem(doc, item, COLORS.primary);
    });
    
    doc.moveDown(0.5);
  }

  // RECOMMENDED DOCTOR
  if (report.recommendedDoctor || report.recommendedDoctorName || 
      report.recommendedDoctorQualification || report.recommendedDoctorSpecialization) {
    drawSection(doc, 'Recommended Consultation', '');
    
    const doctorName = report.recommendedDoctorName || report.recommendedDoctor?.name || 'Medical Specialist';
    const qualification = report.recommendedDoctorQualification || report.recommendedDoctor?.qualification || '';
    const specialization = report.recommendedDoctorSpecialization || report.recommendedDoctor?.specialization || '';
    
    drawDoctorInfo(doc, doctorName, qualification, specialization);
    
    if (report.recommendedDoctor?.timings) {
      doc.fillColor(COLORS.textLight)
         .fontSize(8)
         .text(`Available: ${report.recommendedDoctor.timings}`, 58, doc.y);
      doc.moveDown(0.8);
    }
  }

  // FOOTER (always at bottom)
  drawFooter(doc);

  doc.end();
  return doc;
};
