import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse } from 'next/server';
import path from 'path';

export async function GET(req: NextApiRequest, res: NextApiResponse) {
    // console.log(req.url)
    const parameter = (new URL(req.url || ""));
    // console.log(parameter)
    const file = parameter.searchParams.get('filename');

    if (!file) {
        return NextResponse.json({ error: 'No file parameter in the URL' });
    }

    const filePath = path.join('/home/mconvert/Code/RIAU-MVP/markdown/', file + ".md");
    try {
        const data = await fs.promises.readFile(filePath, 'utf8');
        return NextResponse.json({ data });
    } catch (err: any) {
        return NextResponse.json({ error: err.message });
    }
}