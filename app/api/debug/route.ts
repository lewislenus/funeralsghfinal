import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get Next.js build information 
    const nextData = {
      version: process.env.NEXT_VERSION || 'unknown',
      buildId: process.env.BUILD_ID || 'unknown',
      environment: process.env.NODE_ENV || 'unknown'
    };
    
    // Return debug information
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      nextjs: nextData,
      // Add more debug info as needed
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
