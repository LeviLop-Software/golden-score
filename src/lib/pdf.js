import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * PDF Generation Library
 * Creates PDF reports for company data
 * TODO: Add company logo
 * TODO: Add charts/graphs
 * TODO: Add custom styling/branding
 * TODO: Add Hebrew font support for jsPDF
 */

/**
 * Generate PDF report for a company
 * @param {Object} company - Company data
 * @param {string} filename - Output filename
 */
export function generateCompanyReport(company, filename = 'company-report.pdf') {
  // TODO: Add Hebrew font support
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.text('Company Report', 20, 20);

  // Company Name
  doc.setFontSize(16);
  doc.text(company.name || 'N/A', 20, 35);

  // Company Details
  doc.setFontSize(12);
  let yPos = 50;

  const details = [
    ['Score', company.score?.toString() || 'N/A'],
    ['Industry', company.industry || 'N/A'],
    ['Location', company.location || 'N/A'],
    ['Employees', company.employees?.toString() || 'N/A'],
  ];

  details.forEach(([label, value]) => {
    doc.text(`${label}: ${value}`, 20, yPos);
    yPos += 10;
  });

  // TODO: Add table with autoTable
  // doc.autoTable({
  //   head: [['Metric', 'Value']],
  //   body: details,
  //   startY: 70,
  // });

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
