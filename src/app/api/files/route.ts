import fs from 'fs';
import { NextResponse } from "next/server";
import path from "path";

export async function GET() {
  return NextResponse.json({  allFiles:getAllFiles() });
};

export function getAllFiles() {
  const allFiles = fs.readdirSync(path.join(process.cwd(), "assets/"))
    .map((file) => {
      return file.substring(0, file.lastIndexOf("."));
    });
  return allFiles;
}