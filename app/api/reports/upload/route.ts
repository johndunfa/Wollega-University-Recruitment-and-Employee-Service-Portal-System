// app/api/reports/upload/route.ts

import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { connectToDatabase } from '@/lib/mongodb';
import Report from '../../../../models/Report'; 


import { existsSync } from 'fs';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const reportFile = formData.get('report') as File;

    const employeeId = formData.get('employeeId')?.toString();
    const name = formData.get('name')?.toString();
    const department = formData.get('department')?.toString();

    if (!reportFile || !employeeId || !name || !department) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();

    const bytes = await reportFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, reportFile.name);
    await writeFile(filePath, buffer);

    const report = new Report({
      employeeId,
      name,
      department,
      fileName: reportFile.name,
      filePath: `/uploads/${reportFile.name}`,
    });

    await report.save();

    return NextResponse.json({ message: 'Report uploaded successfully' });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ message: 'Failed to upload' }, { status: 500 });
  }
}
