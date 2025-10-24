import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { join } from 'path';
import { readFileSync, writeFileSync } from 'fs';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const seatNo = searchParams.get('seatNo');

  if (!seatNo) {
    return NextResponse.json({ error: 'Seat number is required' }, { status: 400 });
  }

  try {
    // Read the Excel file from the public directory
    const filePath = join(process.cwd(), 'public', 'BMS6T.xlsx');
    const fileBuffer = readFileSync(filePath);
    
    // Parse the Excel file
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    // Find student by seat number
    const student = data.find((row: any) => row.SEAT_NO?.toString() === seatNo);
    
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    
    return NextResponse.json(student);
  } catch (error) {
    console.error('Error reading Excel file:', error);
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { seatNo, updates } = body;

    if (!seatNo) {
      return NextResponse.json({ error: 'Seat number is required' }, { status: 400 });
    }

    // Read the Excel file
    const filePath = join(process.cwd(), 'public', 'BMS6T.xlsx');
    const fileBuffer = readFileSync(filePath);
    
    // Parse the Excel file
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data: any[] = XLSX.utils.sheet_to_json(worksheet);
    
    // Find and update student by seat number
    const studentIndex = data.findIndex((row: any) => row.SEAT_NO?.toString() === seatNo.toString());
    
    if (studentIndex === -1) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Update the student record
    data[studentIndex] = { ...data[studentIndex], ...updates };

    // Convert back to worksheet
    const newWorksheet = XLSX.utils.json_to_sheet(data);
    workbook.Sheets[sheetName] = newWorksheet;

    // Write the updated workbook back to file
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    writeFileSync(filePath, buffer);

    return NextResponse.json({ 
      success: true, 
      message: 'Student data updated successfully',
      data: data[studentIndex]
    });
  } catch (error) {
    console.error('Error updating Excel file:', error);
    return NextResponse.json({ error: 'Failed to update data' }, { status: 500 });
  }
}
