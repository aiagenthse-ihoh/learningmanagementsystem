import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportTableColumn {
  header: string;
  key?: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
}

export interface ExportOptions {
  filename: string;
  title: string;
  subtitle?: string;
  headers: string[];
  rows: (string | number)[][];
  columns?: ExportTableColumn[];
  companyName?: string;
  author?: string;
  orientation?: 'portrait' | 'landscape';
  summaryCards?: { label: string; value: string | number }[];
}

/**
 * Generate formatted, print-ready Excel file (.xls XML/HTML format)
 * Opens cleanly in Microsoft Excel, LibreOffice, and Google Sheets
 * with borders, colored headers, cell padding, and auto print setup.
 */
export function exportToExcelTable(options: ExportOptions) {
  const {
    filename,
    title,
    subtitle = '',
    headers,
    rows,
    companyName = 'LCMS ENTERPRISE - LEARNING & COMPETENCY MANAGEMENT SYSTEM',
    author = 'Super Admin / HR-L&D',
    summaryCards = [],
  } = options;

  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const summaryHtml =
    summaryCards.length > 0
      ? `
      <table style="margin-bottom: 16px; border-collapse: collapse; font-family: Calibri, Arial, sans-serif;">
        <tr>
          ${summaryCards
            .map(
              (card) => `
            <td style="border: 1px solid #0f766e; background-color: #f0fdfa; padding: 8px 14px; text-align: center;">
              <span style="font-size: 10pt; color: #0f766e; font-weight: bold; display: block;">${card.label}</span>
              <span style="font-size: 14pt; color: #134e4a; font-weight: bold; display: block; margin-top: 2px;">${card.value}</span>
            </td>
          `
            )
            .join('<td style="width: 10px;"></td>')}
        </tr>
      </table>
    `
      : '';

  const tableHeaderHtml = headers
    .map(
      (h) => `
      <th style="background-color: #0f766e; color: #ffffff; font-weight: bold; font-size: 11pt; padding: 10px 8px; border: 1px solid #115e59; text-align: left; vertical-align: middle;">
        ${h}
      </th>
    `
    )
    .join('');

  const tableRowsHtml = rows
    .map((row, idx) => {
      const bgColor = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
      const cells = row
        .map((cell) => {
          const stringVal = cell !== undefined && cell !== null ? String(cell) : '-';
          const isNum = typeof cell === 'number' || (!isNaN(Number(stringVal)) && stringVal.trim() !== '');
          const align = isNum && !stringVal.startsWith('0') && stringVal.length < 6 ? 'center' : 'left';
          return `
            <td style="padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 10pt; color: #1e293b; background-color: ${bgColor}; text-align: ${align}; vertical-align: middle;">
              ${stringVal}
            </td>
          `;
        })
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>${filename.slice(0, 30)}</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
                <x:FitToPage/>
                <x:Print>
                  <x:FitWidth>1</x:FitWidth>
                  <x:FitHeight>99</x:FitHeight>
                  <x:ValidPrinterInfo/>
                  <x:PaperSizeIndex>9</x:PaperSizeIndex>
                  <x:HorizontalResolution>600</x:HorizontalResolution>
                  <x:VerticalResolution>600</x:VerticalResolution>
                </x:Print>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        body { font-family: Calibri, Arial, Helvetica, sans-serif; }
        .company-header { font-size: 14pt; font-weight: bold; color: #0f766e; }
        .doc-title { font-size: 16pt; font-weight: bold; color: #0f172a; margin: 4px 0; }
        .doc-sub { font-size: 10pt; color: #64748b; margin-bottom: 12px; }
        .meta-table { margin-bottom: 14px; font-size: 9.5pt; color: #334155; }
        .data-table { border-collapse: collapse; width: 100%; }
        .sign-table { margin-top: 36px; border-collapse: collapse; }
      </style>
    </head>
    <body>
      <div class="company-header">${companyName}</div>
      <div class="doc-title">${title}</div>
      ${subtitle ? `<div class="doc-sub">${subtitle}</div>` : ''}

      <table class="meta-table" style="border: none; margin-bottom: 12px;">
        <tr>
          <td style="padding: 2px 8px 2px 0; font-weight: bold;">Tanggal Dokumen:</td>
          <td style="padding: 2px 20px 2px 0;">${dateStr} ${timeStr} WIB</td>
          <td style="padding: 2px 8px 2px 0; font-weight: bold;">Dicetak Oleh:</td>
          <td style="padding: 2px 0;">${author}</td>
        </tr>
        <tr>
          <td style="padding: 2px 8px 2px 0; font-weight: bold;">Total Data:</td>
          <td style="padding: 2px 20px 2px 0;">${rows.length} Baris</td>
          <td style="padding: 2px 8px 2px 0; font-weight: bold;">Status Berkas:</td>
          <td style="padding: 2px 0; color: #0f766e; font-weight: bold;">Resmi (Siap Cetak / Terverifikasi)</td>
        </tr>
      </table>

      ${summaryHtml}

      <table class="data-table">
        <thead>
          <tr>${tableHeaderHtml}</tr>
        </thead>
        <tbody>
          ${tableRowsHtml}
        </tbody>
      </table>

      <table class="sign-table" style="width: 100%; margin-top: 40px; page-break-inside: avoid;">
        <tr>
          <td style="width: 33%; text-align: center; vertical-align: top;">
            <p style="font-size: 10pt; margin: 0; color: #64748b;">Disiapkan Oleh,</p>
            <div style="height: 60px;"></div>
            <p style="font-size: 10pt; font-weight: bold; margin: 0; text-decoration: underline;">${author}</p>
            <p style="font-size: 9pt; color: #64748b; margin: 2px 0 0 0;">L&D Specialist</p>
          </td>
          <td style="width: 33%;"></td>
          <td style="width: 33%; text-align: center; vertical-align: top;">
            <p style="font-size: 10pt; margin: 0; color: #64748b;">Disetujui Oleh,</p>
            <div style="height: 60px;"></div>
            <p style="font-size: 10pt; font-weight: bold; margin: 0; text-decoration: underline;">Head of Human Capital</p>
            <p style="font-size: 9pt; color: #64748b; margin: 2px 0 0 0;">Superintendent HR & Training</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + htmlContent], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const safeName = filename.endsWith('.xls') || filename.endsWith('.xlsx') ? filename : `${filename}.xls`;
  link.setAttribute('download', safeName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate PDF document using jsPDF + autoTable
 * Clean corporate styling, header, footer, page numbering
 */
export function exportToPdfTable(options: ExportOptions) {
  const {
    filename,
    title,
    subtitle = '',
    headers,
    rows,
    orientation = rows[0]?.length > 6 ? 'landscape' : 'portrait',
    companyName = 'LCMS ENTERPRISE - LEARNING & COMPETENCY MANAGEMENT SYSTEM',
    author = 'Super Admin / HR-L&D',
  } = options;

  const doc = new jsPDF({
    orientation,
    unit: 'pt',
    format: 'a4',
  });

  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Top Accent Bar
  doc.setFillColor(15, 118, 110); // Teal 700
  doc.rect(0, 0, pageWidth, 6, 'F');

  // Company Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 118, 110);
  doc.text(companyName, 36, 26);

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text(title, 36, 46);

  // Subtitle & Metadata
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // Slate 500
  const subText = subtitle ? `${subtitle} | ` : '';
  doc.text(`${subText}Dicetak: ${dateStr} • Oleh: ${author} • Total: ${rows.length} Data`, 36, 62);

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(1);
  doc.line(36, 70, pageWidth - 36, 70);

  // AutoTable
  autoTable(doc, {
    startY: 78,
    head: [headers],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 118, 110], // Teal 700
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'left',
      cellPadding: 5,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      cellPadding: 4.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    styles: {
      overflow: 'linebreak',
      cellWidth: 'auto',
    },
    margin: { top: 78, bottom: 45, left: 36, right: 36 },
    didDrawPage: (data) => {
      // Footer page numbering
      const pageNumber = data.pageNumber;
      const totalPages = (doc as any).internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Halaman ${pageNumber} dari ${totalPages} — Dokumen Resmi LCMS Enterprise`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 16,
        { align: 'center' }
      );
    },
  });

  const safeName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  doc.save(safeName);
}

/**
 * Standard CSV export for backwards compatibility and raw data processing
 */
export function exportToCsv(filename: string, rows: (string | number)[][], headers: string[]) {
  const escapeCell = (cell: string | number | undefined | null) => {
    if (cell === undefined || cell === null) return '""';
    const stringVal = String(cell).replace(/"/g, '""');
    return `"${stringVal}"`;
  };

  const csvContent = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => row.map(escapeCell).join(',')),
  ].join('\r\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
