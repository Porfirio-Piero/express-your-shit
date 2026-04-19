import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Proxy API requests to backend
  if (pathname.startsWith('/api/')) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;
    
    if (!apiUrl) {
      console.error('API_URL not configured');
      return new NextResponse(
        JSON.stringify({ error: 'API URL not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Construct the full backend URL
    const backendUrl = new URL(pathname + request.nextUrl.search, apiUrl);
    
    // Clone the request headers
    const requestHeaders = new Headers(request.headers);
    
    // Add CORS headers
    const response = NextResponse.rewrite(backendUrl, {
      request: {
        headers: requestHeaders,
      },
    });
    
    // Add CORS headers to response
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', '*');
    
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
};
