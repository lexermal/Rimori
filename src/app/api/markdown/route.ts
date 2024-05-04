import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse } from 'next/server';
import path from 'path';

export async function GET(req: NextApiRequest, res: NextApiResponse) {
    const parameter = (new URL(req.url || ""));
    const file = parameter.searchParams.get('filename');

    if (!file) {
        return NextResponse.json({ error: 'No file parameter in the URL' });
    }

    try {
        return NextResponse.json({ data: await getFileContent(file) });
    } catch (err: any) {
        return NextResponse.json({ error: err.message });
    }
}

export async function getFileContent(filename: string): Promise<string> {
    const filePath = path.join('/home/mconvert/Code/RIAU-MVP/markdown/', filename + ".md");
    return await fs.promises.readFile(filePath, 'utf8');
}