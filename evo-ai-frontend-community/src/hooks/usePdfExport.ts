import { useCallback } from 'react';
import html2pdf from 'html2pdf.js';

interface PdfExportOptions {
  filename?: string;
  margin?: number | [number, number, number, number];
  pageSize?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
  scale?: number;
}

export function usePdfExport() {
  const exportToPdf = useCallback(
    (
      elementId: string,
      options: PdfExportOptions = {}
    ) => {
      const {
        filename = 'documento.pdf',
        margin = 10,
        pageSize = 'a4',
        orientation = 'portrait',
        scale = 2,
      } = options;

      const element = document.getElementById(elementId);
      if (!element) {
        console.error(`Element with ID "${elementId}" not found`);
        return;
      }

      const pdfOptions: any = {
        margin,
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale },
        jsPDF: { orientation, format: pageSize },
      };

      html2pdf().set(pdfOptions).from(element).save();
    },
    []
  );

  const printElement = useCallback((elementId: string) => {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with ID "${elementId}" not found`);
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.error('Failed to open print window');
      return;
    }

    printWindow.document.write(element.innerHTML);
    printWindow.document.close();
    printWindow.print();
  }, []);

  return { exportToPdf, printElement };
}
