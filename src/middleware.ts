import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Security configuration
const ALLOWED_ORIGINS = [
  'https://play-form.vercel.app',
  'https://play.bb',
  'http://localhost:3000' // Development
]

const isDevelopment = process.env.NODE_ENV === 'development'

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin')
  const pathname = request.nextUrl.pathname
  
  // Development mode logging
  if (isDevelopment) {
    console.log(`🔧 DEV: Processing request to ${pathname} from origin: ${origin}`)
    
    // Log all headers in development for debugging
    const allHeaders: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      allHeaders[key] = value
    })
    console.log(`🔧 DEV: All request headers:`, allHeaders)
  }

  // CORS & Origin Protection
  if (origin) {
    // Block requests from unauthorized origins
    if (!ALLOWED_ORIGINS.includes(origin)) {
      if (isDevelopment) {
        console.log(`🚫 DEV: Blocked request from unauthorized origin: ${origin}`)
      }
      return new NextResponse('Forbidden: Unauthorized origin', { 
        status: 403,
        headers: {
          'Content-Type': 'text/plain',
        }
      })
    }
  }

  // Security: Block suspicious user agents (only in production)
  if (!isDevelopment) {
    const userAgent = request.headers.get('user-agent') || ''
    if (userAgent.includes('bot') || userAgent.includes('crawler') || userAgent.includes('spider')) {
      // Allow legitimate search engine bots
      if (!userAgent.includes('Googlebot') && !userAgent.includes('Bingbot')) {
        return new NextResponse('Forbidden: Suspicious user agent', { 
          status: 403,
          headers: {
            'Content-Type': 'text/plain',
          }
        })
      }
    }
  }

  // Security: Block requests with suspicious headers
  // Only block headers that are commonly used in attacks, not legitimate forwarding headers
  
  // Note: We now allow common legitimate headers from hosting providers by default
  // and only block truly malicious headers to reduce false positives
  
  const maliciousHeaders = [
    'x-forwarded-proto', // Can be used in protocol downgrade attacks
    'x-original-url', // Can be used in path traversal attacks
    'x-rewrite-url', // Can be used in path traversal attacks
    'x-custom-ip', // Custom headers that might be spoofed
    'x-original-host', // Can be used in host header attacks
  ]
  
  // Special handling for x-forwarded-for (common but can be spoofed)
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    // Check if it looks like a legitimate forwarding chain
    const ips = forwardedFor.split(',').map(ip => ip.trim())
    if (ips.length > 5) { // More than 5 IPs in chain is suspicious
      if (isDevelopment) {
        console.log(`⚠️ DEV: Suspicious x-forwarded-for chain length: ${ips.length}`)
      } else {
        return new NextResponse('Forbidden: Suspicious forwarding chain', { 
          status: 403,
          headers: {
            'Content-Type': 'text/plain',
          }
        })
      }
    }
  }
  
  // Check for multiple suspicious headers (more likely to be an attack)
  let suspiciousHeaderCount = 0
  for (const header of maliciousHeaders) {
    if (request.headers.get(header)) {
      suspiciousHeaderCount++
      if (isDevelopment) {
        console.log(`🔍 DEV: Found potentially suspicious header: ${header}`)
      }
    }
  }
  
  // Only block if multiple suspicious headers are present (reduces false positives)
  if (suspiciousHeaderCount >= 2) {
    if (isDevelopment) {
      console.log(`🚫 DEV: Blocked request with ${suspiciousHeaderCount} suspicious headers`)
    } else {
      return new NextResponse('Forbidden: Multiple suspicious headers detected', { 
        status: 403,
        headers: {
          'Content-Type': 'text/plain',
        }
      })
    }
  }
  
  // Additional security: Check for path traversal attempts in headers
  const pathTraversalPatterns = ['../', '..\\', '%2e%2e%2f', '%2e%2e%5c']
  for (const pattern of pathTraversalPatterns) {
    request.headers.forEach((value, key) => {
      if (value.toLowerCase().includes(pattern)) {
        if (isDevelopment) {
          console.log(`🚫 DEV: Detected potential path traversal in header ${key}: ${value}`)
        } else {
          return new NextResponse('Forbidden: Path traversal attempt detected', { 
            status: 403,
            headers: {
              'Content-Type': 'text/plain',
            }
          })
        }
      }
    })
  }
  
  // Check for excessive header size (potential header bombing attack)
  let totalHeaderSize = 0
  request.headers.forEach((value, key) => {
    totalHeaderSize += key.length + value.length
  })
  
  if (totalHeaderSize > 8192) { // 8KB limit
    if (isDevelopment) {
      console.log(`⚠️ DEV: Large headers detected: ${totalHeaderSize} bytes`)
    } else {
      return new NextResponse('Forbidden: Headers too large', { 
        status: 403,
        headers: {
          'Content-Type': 'text/plain',
        }
      })
    }
  }

  // Create response with security headers
  const response = NextResponse.next()
  
  // CORS Headers
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  
  // Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // Additional security headers (only in production)
  if (!isDevelopment) {
    response.headers.set('X-DNS-Prefetch-Control', 'off')
    response.headers.set('X-Download-Options', 'noopen')
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')
  }
  
  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}