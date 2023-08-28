import { NextResponse } from 'next/server';
// there is issue with nextjs that we can't retrieve the current url inside server component. 
// so we are using this middleware to set the current url in the request header.
export async function middleware(request: Request) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-url', request.url);
    return NextResponse.next({
        request: {
            headers: requestHeaders,
        }
    });
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ]
}