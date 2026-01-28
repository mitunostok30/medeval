import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            studentId,
            studentEmail,
            teacherId,
            phase,
            ratings,
            isRoleModel,
            learningEnv,
            clinicalSkills,
            hostel,
            resideInHostel,
            qualitativeProblems
        } = body;

        // Check for duplicate
        const existing = await sql`
      SELECT id FROM evaluations 
      WHERE student_id = ${studentId} AND teacher_id = ${teacherId}
    `;

        if (existing.rowCount && existing.rowCount > 0) {
            return NextResponse.json({ error: 'You have already evaluated this teacher.' }, { status: 400 });
        }

        await sql`
      INSERT INTO evaluations (
        student_id, student_email, teacher_id, phase, ratings, 
        is_role_model, learning_env, clinical_skills, hostel, 
        reside_in_hostel, qualitative_problems
      ) VALUES (
        ${studentId}, ${studentEmail}, ${teacherId}, ${phase}, ${JSON.stringify(ratings)}, 
        ${isRoleModel}, ${JSON.stringify(learningEnv)}, ${JSON.stringify(clinicalSkills)}, 
        ${JSON.stringify(hostel)}, ${resideInHostel}, ${qualitativeProblems}
      )
    `;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET() {
    try {
        const { rows } = await sql`SELECT * FROM evaluations ORDER BY timestamp DESC`;

        // Transform rows to match EvaluationRecord interface
        const evaluations = rows.map(row => ({
            id: row.id,
            timestamp: new Date(row.timestamp).getTime(),
            phase: row.phase,
            teacherId: row.teacher_id,
            studentId: row.student_id,
            studentEmail: row.student_email,
            ratings: row.ratings,
            isRoleModel: row.is_role_model,
            learningEnv: row.learning_env,
            clinicalSkills: row.clinical_skills,
            hostel: row.hostel,
            resideInHostel: row.reside_in_hostel,
            qualitativeProblems: row.qualitative_problems
        }));

        return NextResponse.json(evaluations);
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
