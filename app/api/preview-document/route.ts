import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyToken } from "@/lib/jwt";

interface Student {
  id: number;
  seat_no: string;
  coll_no: string;
  name: string;
  sex: string;
  session: string;

  p1_cd: string | null;
  p1_t: string | null;
  p1_i: string | null;
  p2_cd: string | null;
  p2_t: string | null;
  p2_i: string | null;
  p3_cd: string | null;
  p3_t: string | null;
  p3_i: string | null;
  p4_cd: string | null;
  p4_t: string | null;
  p4_i: string | null;
  p5_cd: string | null;
  p5_t: string | null;
  p5_i: string | null;
  p6_cd: string | null;
  p6_t: string | null;
  p6_i: string | null;

  c1: string | null;
  sgp1: string | null;
  c2: string | null;
  sgp2: string | null;
  c3: string | null;
  sgp3: string | null;
  c4: string | null;
  sgp4: string | null;
  c5: string | null;
  sgp5: string | null;
  c6: string | null;
  sgp6: string | null;

  cgpa: string | null;
  gcgpa: string | null;
  rslt: string | null;
  res: string | null;
  frem: string | null;
}

export async function POST(req: NextRequest) {
  try {
    // Verify token
    const token = req.cookies.get('auth-token')?.value || 
                  req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'coordinator') {
      return NextResponse.json({ error: 'Only coordinators can preview documents' }, { status: 403 });
    }

    const { seat_no } = await req.json();

    if (!seat_no) {
      return NextResponse.json(
        { error: "Student seat number required" },
        { status: 400 }
      );
    }

    // Fetch student from Supabase
    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('seat_no', seat_no)
      .single();

    if (error || !student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // Prepare data for preview
    const documentData = {
      candidate_name: student.name || "-",
      candidate_no: student.seat_no || "-",
      college_no: student.coll_no || "-",
      session: student.session || "-",
      sex: student.sex || "-",

      // Paper codes
      p1_cd: student.p1_cd || "-",
      p2_cd: student.p2_cd || "-",
      p3_cd: student.p3_cd || "-",
      p4_cd: student.p4_cd || "-",
      p5_cd: student.p5_cd || "-",
      p6_cd: student.p6_cd || "-",

      // Theory marks
      p1_t: student.p1_t || "-",
      p2_t: student.p2_t || "-",
      p3_t: student.p3_t || "-",
      p4_t: student.p4_t || "-",
      p5_t: student.p5_t || "-",
      p6_t: student.p6_t || "-",

      // Internal marks
      p1_i: student.p1_i || "-",
      p2_i: student.p2_i || "-",
      p3_i: student.p3_i || "-",
      p4_i: student.p4_i || "-",
      p5_i: student.p5_i || "-",
      p6_i: student.p6_i || "-",

      // Credits
      c1: student.c1 || "-",
      c2: student.c2 || "-",
      c3: student.c3 || "-",
      c4: student.c4 || "-",
      c5: student.c5 || "-",
      c6: student.c6 || "-",

      // SGPs
      sgp1: student.sgp1 || "-",
      sgp2: student.sgp2 || "-",
      sgp3: student.sgp3 || "-",
      sgp4: student.sgp4 || "-",
      sgp5: student.sgp5 || "-",
      sgp6: student.sgp6 || "-",

      cgpa: student.cgpa || "-",
      gcgpa: student.gcgpa || "-",
      percentage: student.cgpa ? (parseFloat(student.cgpa) * 10).toFixed(2) : "-",
      
      rslt: student.rslt || "-",
      res: student.res || "-",
      frem: student.frem || "-",
    };

    return NextResponse.json(documentData, { status: 200 });
  } catch (error: any) {
    console.error("Preview Document Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch document data" },
      { status: 500 }
    );
  }
}
