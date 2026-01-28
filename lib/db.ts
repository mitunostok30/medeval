import { db } from '@vercel/postgres';

export async function query(text: string, params: any[]) {
    const client = await db.connect();
    try {
        return await client.query(text, params);
    } finally {
        client.release();
    }
}

export default query;
