import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// A generic function to export data to CSV
export const exportToCsv = (data: any[], filename: string) => {
    if (data.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csvOutput: string = XLSX.utils.sheet_to_csv(worksheet);
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvOutput);
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
    autoTable(doc, {
        head: [headers],
        body: data,
    });
    doc.save(`${filename}.pdf`);
};
