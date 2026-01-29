import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { DEFAULT_TEACHERS } from '@/constants';

export async function GET() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS teachers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        designation TEXT NOT NULL,
        subject TEXT NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS evaluations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        student_id TEXT NOT NULL,
        student_email TEXT NOT NULL,
        teacher_id TEXT NOT NULL,
        phase TEXT NOT NULL,
        ratings JSONB NOT NULL,
        is_role_model BOOLEAN NOT NULL,
        learning_env JSONB NOT NULL,
        clinical_skills JSONB,
        hostel JSONB,
        reside_in_hostel BOOLEAN NOT NULL,
        qualitative_problems TEXT,
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(student_id, teacher_id)
      );
    `;

    // Check if teachers exist, if not insert defaults
    const { rows: existingTeachers } = await sql`SELECT id FROM teachers LIMIT 1`;
    if (existingTeachers.length === 0) {
      for (const t of DEFAULT_TEACHERS) {
        await sql`
                    INSERT INTO teachers (id, name, designation, subject)
                    VALUES (${t.id}, ${t.name}, ${t.designation}, ${t.subject})
                    ON CONFLICT (id) DO NOTHING;
                `;
      }
    }

    return NextResponse.json({ message: "Database initialized and seeded successfully" });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
