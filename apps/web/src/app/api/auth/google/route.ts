import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import prisma from '../../../../lib/prisma';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { credential } = body;

    if (!credential) {
      return NextResponse.json(
        { error: 'Google credential is required' },
        { status: 400 }
      );
    }

    // 1. Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.sub) {
      return NextResponse.json(
        { error: 'Invalid Google token' },
        { status: 401 }
      );
    }

    const { sub: googleId, email, name, picture } = payload;

    // 2. Find or create user
    //    Priority: match by googleId, then by email, then create new
    let user = await prisma.user.findUnique({
      where: { googleId },
    });

    if (!user && email) {
      // Check if a user with this email already exists (account linking)
      user = await prisma.user.findUnique({
        where: { email },
      });

      if (user) {
        // Link existing account to Google
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId, image: picture || undefined },
        });
      }
    }

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          googleId,
          email: email || undefined,
          name: name || undefined,
          image: picture || undefined,
        },
      });
    }

    // 3. Issue JWT (same format as phone auth)
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image,
      },
    });
  } catch (error: any) {
    console.error('Google auth error:', error);

    if (
      error.message?.includes('Token used too late') ||
      error.message?.includes('Invalid token') ||
      error.message?.includes('Wrong number of segments')
    ) {
      return NextResponse.json(
        { error: 'Google token expired or invalid. Please try again.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
