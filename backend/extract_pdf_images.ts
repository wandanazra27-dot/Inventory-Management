import * as fs from 'fs';
import * as path from 'path';
// @ts-ignore
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

const pdfPaths = [
    path.join(__dirname, '..', 'List Product #1.pdf'),
    path.join(__dirname, '..', 'List Product #2.pdf'),
    path.join(__dirname, '..', 'List Product #3.pdf'),
];

const outDir = path.join(__dirname, 'pdf_images');
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

async function extractImagesAndText(pdfPath: string) {
    if (!fs.existsSync(pdfPath)) {
        console.log(`Skipping ${pdfPath}, not found.`);
        return;
    }
    console.log(`Processing ${path.basename(pdfPath)}...`);
    const loadingTask = pdfjsLib.getDocument(pdfPath);
    const pdfDocument = await loadingTask.promise;
    
    for (let pageNum = 1; pageNum <= Math.min(2, pdfDocument.numPages); pageNum++) { // Test only 2 pages first
        const page = await pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const texts = textContent.items.map((item: any) => item.str).join(' ');
        console.log(`Page ${pageNum} length: ${texts.length} chars`);
        
        const opList = await page.getOperatorList();
        let imgCount = 0;
        for (let i = 0; i < opList.fnArray.length; i++) {
            if (opList.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
                imgCount++;
            }
        }
        console.log(`Page ${pageNum} has ${imgCount} images.`);
    }
}

async function main() {
    for (const p of pdfPaths) {
        await extractImagesAndText(p);
    }
    console.log('Finished preliminary extraction check.');
}

main().catch(console.error);
