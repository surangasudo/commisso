import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// A generic function to export data to CSV
export const exportToCsv = (data: any[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...data.map(item => headers.map(header => JSON.stringify(item[header])).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// A generic function to export data to Excel
export const exportToXlsx = (data: any[], filename: string) => {
    if (data.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    XLSX.writeFile(workbook, `${filename}.xlsx`);
};

// A generic function to export data to PDF
export const exportToPdf = (headers: string[], data: any[][], filename: string) => {
    const doc = new jsPDF();
    (doc as any).autoTable({
        head: [headers],
        body: data,
    });
    doc.save(`${filename}.pdf`);
};
