
// src/app/api/auth/google/redirect/route.ts

import { generateAuthUrl } from '@/lib/google';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {

  // TODO: Replace with actual user UID from session
  const uid = '1234';
  
  const url = generateAuthUrl(uid);
  return NextResponse.redirect(url);
}
