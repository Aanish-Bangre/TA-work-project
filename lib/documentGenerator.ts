import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface StudentData {
  [key: string]: any;
}

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

// Helper function to determine document type based on student result
export function getStudentDocumentType(student: StudentData): 'RLE' | 'RPV' | null {
  const result = student.RSLT?.toString().toUpperCase() || '';
  const res = student.RES?.toString().toUpperCase() || '';
  
  // RLE is for students who passed normally
  // RPV is for re-verification/improvement cases
  if (result.includes('PASS') || res.includes('PASS')) {
    return 'RLE';
  } else if (result.includes('ATKT') || result.includes('FAIL') || res.includes('ATKT')) {
    return 'RPV';
  }
  
  // Default to RLE if result is present
  return result ? 'RLE' : 'RPV';
}

export function generateRPV(student: StudentData) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('RESULT PASS VERIFICATION (RPV)', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Mumbai University', 105, 28, { align: 'center' });
  
  // Student Information Box
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Student Information', 14, 40);
  
  const studentInfo = [
    ['Name', student.NAME || 'N/A'],
    ['Seat Number', student.SEAT_NO?.toString() || 'N/A'],
    ['College Number', student.COLL_NO?.toString() || 'N/A'],
    ['Gender', student.SEX === 1 ? 'Male' : student.SEX === 2 ? 'Female' : 'N/A'],
    ['Result', student.RSLT || 'N/A'],
  ];

  autoTable(doc, {
    startY: 45,
    head: [],
    body: studentInfo,
    theme: 'grid',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 130 }
    }
  });

  // Academic Performance
  let currentY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Semester-wise Performance', 14, currentY);
  
  currentY += 5;

  const semesterData = [];
  for (let i = 1; i <= 6; i++) {
    const sgp = student[`SGP${i}`];
    const credits = student[`C${i}`];
    const sgpCredit = student[`S${i}C${i}`];
    
    if (sgp !== undefined && sgp !== null) {
      semesterData.push([
        `Semester ${i}`,
        sgp?.toString() || 'N/A',
        credits?.toString() || 'N/A',
        sgpCredit?.toString() || 'N/A'
      ]);
    }
  }

  autoTable(doc, {
    startY: currentY,
    head: [['Semester', 'SGP', 'Credits', 'SGP × Credits']],
    body: semesterData,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [66, 139, 202] }
  });

  // CGPA
  currentY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`CGPA: ${student.CGPA || 'N/A'}`, 14, currentY);
  
  if (student.GCGPA) {
    doc.text(`GCGPA: ${student.GCGPA}`, 100, currentY);
  }

  // Subject-wise Marks
  currentY += 10;
  doc.setFontSize(11);
  doc.text('Subject-wise Marks', 14, currentY);
  
  currentY += 5;

  const subjectData = [];
  for (let i = 1; i <= 6; i++) {
    const paperCode = student[`P${i}_CD`];
    const theory = student[`P${i}_T`];
    const internal = student[`P${i}_I`];
    
    if (paperCode || theory || internal) {
      subjectData.push([
        `Paper ${i}`,
        paperCode?.toString() || 'N/A',
        theory?.toString() || 'N/A',
        internal?.toString() || 'N/A',
        (theory && internal) ? (theory + internal).toString() : 'N/A'
      ]);
    }
  }

  autoTable(doc, {
    startY: currentY,
    head: [['Paper', 'Code', 'Theory', 'Internal', 'Total']],
    body: subjectData,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [66, 139, 202] }
  });

  // Footer
  currentY = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Generated on: ' + new Date().toLocaleDateString(), 14, currentY);
  doc.text('This is a computer-generated document', 14, currentY + 5);

  // Signature section
  currentY += 20;
  doc.line(14, currentY, 80, currentY);
  doc.text('Teacher Signature', 14, currentY + 5);
  
  doc.line(130, currentY, 196, currentY);
  doc.text('HOD Signature', 130, currentY + 5);

  return doc;
}

export function generateRLE(student: StudentData) {
  const doc = new jsPDF('p', 'mm', 'a4');
  
  // Main border
  doc.setLineWidth(0.8);
  doc.rect(5, 5, 200, 287);
  
  // Header - University Logo Area (placeholder)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('UNIVERSITY OF MUMBAI', 105, 15, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Result Ledger Entry', 105, 22, { align: 'center' });
  
  // Horizontal line under header
  doc.setLineWidth(0.5);
  doc.line(10, 26, 200, 26);
  
  // Student Information Section
  let y = 32;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  
  // Create a structured layout matching the RLE format
  doc.text('Seat No:', 12, y);
  doc.setFont('helvetica', 'normal');
  doc.text(student.SEAT_NO?.toString() || '', 35, y);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Name:', 100, y);
  doc.setFont('helvetica', 'normal');
  doc.text(student.NAME || '', 115, y);
  
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('College:', 12, y);
  doc.setFont('helvetica', 'normal');
  doc.text(student.COLL_NO?.toString() || '', 35, y);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Result:', 100, y);
  doc.setFont('helvetica', 'normal');
  doc.text(student.RSLT || '', 115, y);
  
  y += 8;
  
  // Semester Performance Table
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('SEMESTER WISE PERFORMANCE', 12, y);
  y += 2;
  
  // Build semester table with all papers for each semester
  const semesterTableData = [];
  
  for (let sem = 1; sem <= 6; sem++) {
    const sgp = student[`SGP${sem}`];
    const credits = student[`C${sem}`];
    
    if (sgp !== undefined && sgp !== null) {
      // Add semester header row
      semesterTableData.push([
        { content: `SEMESTER ${sem}`, colSpan: 7, styles: { fontStyle: 'bold', fillColor: [230, 230, 230], halign: 'left' } }
      ]);
      
      // Add papers for this semester
      for (let paper = 1; paper <= 6; paper++) {
        const paperCode = student[`P${paper}_CD`];
        const theory = student[`P${paper}_T`];
        const internal = student[`P${paper}_I`];
        const theoryRemark = student[`P${paper}_T_RM`] || '';
        const internalRemark = student[`P${paper}_I_RM`] || '';
        
        if (paperCode || theory || internal) {
          const total = (theory || 0) + (internal || 0);
          semesterTableData.push([
            paperCode?.toString() || '',
            theory?.toString() || '',
            theoryRemark,
            internal?.toString() || '',
            internalRemark,
            total > 0 ? total.toString() : '',
            ''
          ]);
        }
      }
      
      // Add semester summary row
      semesterTableData.push([
        { content: 'Semester Total', colSpan: 5, styles: { fontStyle: 'bold', halign: 'right' } },
        { content: `SGP: ${sgp}`, styles: { fontStyle: 'bold' } },
        { content: `Credits: ${credits || ''}`, styles: { fontStyle: 'bold' } }
      ]);
    }
  }
  
  autoTable(doc, {
    startY: y,
    head: [['Paper Code', 'Theory', 'T.Rmk', 'Internal', 'I.Rmk', 'Total', 'Grade']],
    body: semesterTableData,
    theme: 'grid',
    styles: { 
      fontSize: 8, 
      cellPadding: 1.5,
      lineWidth: 0.1,
      lineColor: [0, 0, 0]
    },
    headStyles: { 
      fillColor: [200, 200, 200],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 25, halign: 'center' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 20, halign: 'center' },
      6: { cellWidth: 20, halign: 'center' }
    },
    margin: { left: 12, right: 12 }
  });
  
  y = doc.lastAutoTable.finalY + 8;
  
  // Overall Performance Summary
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('OVERALL PERFORMANCE', 12, y);
  y += 2;
  
  const summaryTableData = [
    ['CGPA', student.CGPA?.toString() || 'N/A'],
    ['Grade', student.GCGPA?.toString() || 'N/A'],
    ['Result', student.RES || 'N/A'],
    ['Remark', student.FREM || 'N/A']
  ];
  
  autoTable(doc, {
    startY: y,
    body: summaryTableData,
    theme: 'grid',
    styles: { 
      fontSize: 9, 
      cellPadding: 2,
      lineWidth: 0.1
    },
    columnStyles: {
      0: { 
        fontStyle: 'bold', 
        cellWidth: 50,
        fillColor: [240, 240, 240]
      },
      1: { 
        cellWidth: 50,
        fontStyle: 'bold'
      }
    },
    margin: { left: 12 }
  });
  
  y = doc.lastAutoTable.finalY + 15;
  
  // Signature Section
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  // Date
  doc.text('Date: ' + new Date().toLocaleDateString('en-GB'), 12, y);
  
  y += 10;
  
  // Signature lines
  doc.setLineWidth(0.3);
  doc.line(12, y, 60, y);
  doc.line(75, y, 123, y);
  doc.line(138, y, 186, y);
  
  y += 4;
  doc.text('Teacher Signature', 20, y);
  doc.text('HOD Signature', 85, y);
  doc.text('Principal Signature', 145, y);
  
  // Footer
  y += 10;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.text('This is a computer generated document', 105, y, { align: 'center' });

  return doc;
}

export function downloadPDF(doc: jsPDF, filename: string) {
  doc.save(filename);
}

export function viewPDF(doc: jsPDF) {
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, '_blank');
}
