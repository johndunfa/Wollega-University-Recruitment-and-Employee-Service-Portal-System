import mammoth from 'mammoth';
import pdf from 'pdf-parse';
import fs from 'fs/promises';
import path from 'path';

export async function extractTextFromPdf(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    return '';
  }
}

export async function extractTextFromDocx(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const result = await mammoth.extractRawText({ buffer: dataBuffer });
    return result.value;
  } catch (error) {
    console.error('Error extracting DOCX text:', error);
    return '';
  }
}

export async function extractTextFromTxt(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return data;
  } catch (error) {
    console.error('Error extracting TXT:', error);
    return '';
  }
}

export async function extractText(filePath) {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === '.pdf') {
    return await extractTextFromPdf(filePath);
  } else if (extension === '.docx') {
    return await extractTextFromDocx(filePath);
  } else if (extension === '.txt') {
    return await extractTextFromTxt(filePath);
  }
  return "";
}