import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { DEFAULT_TEACHERS } from '@/constants';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { rows } = await sql`SELECT * FROM teachers`;
        if (rows.length === 0) {
            return NextResponse.json(DEFAULT_TEACHERS);
        }
        return NextResponse.json(rows);
    } catch (error) {
        return NextResponse.json(DEFAULT_TEACHERS);
    }
}

export async function POST(request: Request) {
    try {
        const { name, designation, subject } = await request.json();
        const id = 'T' + Date.now();
        await sql`
      INSERT INTO teachers (id, name, designation, subject)
      VALUES (${id}, ${name}, ${designation}, ${subject})
    `;
        return NextResponse.json({ success: true, id });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
