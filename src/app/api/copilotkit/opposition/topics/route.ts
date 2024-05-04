import { NextRequest, NextResponse } from "next/server";
import { parse } from 'url';

import { getTopics } from './researchTopic';

export async function GET(req: NextRequest) {
    const { query } = parse(req.url, true);
    const { file, topic } = query;

    // const data = fakeResponses[file as string] as any;
    // if (data) {
    //     return NextResponse.json(data);
    // }
    return NextResponse.json(await getTopics(file!.toString(), topic!.toString()));
};