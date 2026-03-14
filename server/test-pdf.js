const pdfImport = require('pdf-parse');
const fs = require('fs');
const path = require('path');

console.log('Type of pdfImport:', typeof pdfImport);
console.log('Keys of pdfImport:', Object.keys(pdfImport));

const filePath = path.join('uploads', '1773428277628-Receipt_Details_Report_2025-11-17 (1).pdf');

async function main() {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const parser = new pdfImport.PDFParse({ data: dataBuffer });
        
        const result = await parser.getText();
        console.log('Success! Extracted text length:', result.text.length);
        console.log('Preview:', result.text.substring(0, 100));
        await parser.destroy();
    } catch (error) {
        console.error('Error:', error.message || error);
    }
}

main();
