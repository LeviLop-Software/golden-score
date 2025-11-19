import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * PDF Generation Library
 * Creates PDF reports for company data
 * 
 * ⚠️ STATUS: NOT FUNCTIONAL - Hebrew font support required
 * Current implementation does not properly render Hebrew text.
 * jsPDF requires custom Hebrew font integration before this can be used.
 * 
 * TODO: Add Hebrew font support for jsPDF (critical)
 * TODO: Add company logo
 * TODO: Add charts/graphs
 * TODO: Fix RTL text direction
 */

/**
 * Export company data as PDF
 * @param {Object} company - Company data object
 */
export function exportCompanyPdf(company) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(22);
  doc.text('Company Report', 105, 20, { align: 'center' });
  
  // Company Name
  doc.setFontSize(18);
  doc.text(company.name || company.corporationName || 'N/A', 105, 35, { align: 'center' });

  // Add line
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 42, 190, 42);

  // Company Details
  let yPos = 55;
  doc.setFontSize(12);

  const details = [
    ['Registration Number', company.registrationNumber || 'N/A'],
    ['Type', company.type || 'N/A'],
    ['Status', company.status || 'N/A'],
  ];

  // Add address if available
  const address = company._raw?.['כתובת'] || company._raw?.['עיר'] || '';
  if (address) {
    details.push(['Address', address]);
  }

  // Add founding date if available
  const foundingDate = company._raw?.['תאריך_רישום'] || company._raw?.['תאריך רישום'] || '';
  if (foundingDate) {
    details.push(['Founding Date', foundingDate]);
  }

  // Add business field if available
  const businessField = company._raw?.['תחום'] || company._raw?.['ענף'] || '';
  if (businessField) {
    details.push(['Business Field', businessField]);
  }

  // Create table with autoTable
  doc.autoTable({
    startY: yPos,
    head: [['Field', 'Value']],
    body: details,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      fontSize: 12,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 11,
      cellPadding: 5,
    },
  });

  // Add footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(
      `Generated on ${new Date().toLocaleDateString('he-IL')}`,
      105,
      285,
      { align: 'center' }
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      105,
      290,
      { align: 'center' }
    );
  }

  // Generate filename
  const filename = `company-${company.registrationNumber || 'report'}-${Date.now()}.pdf`;
  
  // Save PDF
  doc.save(filename);
}

/**
 * Generate PDF with multiple companies comparison
 * @param {Array} companies - Array of company objects
 * @param {string} filename - Output filename
 */
export function generateComparisonReport(companies, filename = 'comparison-report.pdf') {
  // TODO: Implement comparison report
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Companies Comparison', 20, 20);

  // TODO: Add comparison table
  const tableData = companies.map((company) => [
    company.name || 'N/A',
    company.score?.toString() || 'N/A',
    company.industry || 'N/A',
  ]);

  doc.autoTable({
    head: [['Company', 'Score', 'Industry']],
    body: tableData,
    startY: 30,
  });

  doc.save(filename);
}

/**
 * Export company data as PDF with charts
 * @param {Object} data - Complete data object with company and metrics
 * @param {string} filename - Output filename
 */
export function exportDetailedReport(data, filename = 'detailed-report.pdf') {
  // TODO: Add chart images to PDF
  // TODO: Add multiple pages for comprehensive report
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Detailed Company Analysis', 20, 20);

  // TODO: Implement detailed report sections
  
  doc.save(filename);
}
