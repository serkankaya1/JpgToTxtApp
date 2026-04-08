import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br />');
}

export async function createPdfFromSelection(selectedText: string): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const directory = `${RNFS.DocumentDirectoryPath}/ocr-pdfs`;
  const fileName = `ocr_${timestamp}`;
  await RNFS.mkdir(directory);

  const html = `
    <html>
      <body style="font-family: sans-serif; padding: 20px;">
        <h1>OCR Export</h1>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        <hr />
        <p>${escapeHtml(selectedText)}</p>
      </body>
    </html>
  `;

  const pdf = await RNHTMLtoPDF.convert({
    html,
    fileName,
    directory: 'Documents/ocr-pdfs',
  });

  if (!pdf.filePath) {
    throw new Error('PDF file path was not returned.');
  }

  return pdf.filePath;
}
