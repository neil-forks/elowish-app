import { NextRequest, NextResponse } from 'next/server';

// In-memory rate limiting (for production, use Redis or a proper rate limiting service)
const signupAttempts = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_ATTEMPTS = 5; // 5 attempts per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempts = signupAttempts.get(ip) || [];

  // Filter out attempts outside the time window
  const recentAttempts = attempts.filter(time => now - time < RATE_LIMIT_WINDOW);

  if (recentAttempts.length >= MAX_ATTEMPTS) {
    return false;
  }

  // Add current attempt
  recentAttempts.push(now);
  signupAttempts.set(ip, recentAttempts);

  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Log the signup (in production, this would save to database)
    console.log('=== NEW BETA SIGNUP ===');
    console.log('Email:', email);
    console.log('IP:', ip);
    console.log('Timestamp:', new Date().toISOString());
    console.log('=====================');

    // TODO: Save to database
    // Example for future implementation:
    // const { data, error } = await supabase
    //   .from('beta_signups')
    //   .insert([{ email, ip, created_at: new Date().toISOString() }]);
    //
    // if (error) {
    //   console.error('Database error:', error);
    //   return NextResponse.json(
    //     { error: 'Failed to save signup' },
    //     { status: 500 }
    //   );
    // }

    // Return success
    return NextResponse.json(
      { success: true, message: 'Successfully signed up for beta access' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
