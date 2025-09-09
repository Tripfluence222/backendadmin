import { NextResponse } from 'next/server';

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function badReq(message: string, details?: any) {
  return NextResponse.json(
    { success: false, error: { message, details } },
    { status: 400 }
  );
}

export function unauth(message = 'Unauthorized') {
  return NextResponse.json(
    { success: false, error: { message } },
    { status: 401 }
  );
}

export function forbidden(message = 'Forbidden') {
  return NextResponse.json(
    { success: false, error: { message } },
    { status: 403 }
  );
}

export function notFound(message = 'Not found') {
  return NextResponse.json(
    { success: false, error: { message } },
    { status: 404 }
  );
}

export function conflict(message: string, details?: any) {
  return NextResponse.json(
    { success: false, error: { message, details } },
    { status: 409 }
  );
}

export function serverErr(message = 'Internal server error', details?: any) {
  return NextResponse.json(
    { success: false, error: { message, details } },
    { status: 500 }
  );
}

export function rateLimited(message = 'Too many requests') {
  return NextResponse.json(
    { success: false, error: { message } },
    { status: 429 }
  );
}
