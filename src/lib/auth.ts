import { NextRequest } from 'next/server';
import admin from 'firebase-admin';

export async function verifyFirebaseToken(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify the token with Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      displayName: decodedToken.name,
      emailVerified: decodedToken.email_verified,
    };
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    return null;
  }
}

export async function verifyFirebaseTokenFromCookie(request: NextRequest) {
  try {
    // Get the auth token from cookies
    const authToken = request.cookies.get('auth_token')?.value;
    if (!authToken) {
      return null;
    }

    // Verify the token with Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(authToken);
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      displayName: decodedToken.name,
      emailVerified: decodedToken.email_verified,
    };
  } catch (error) {
    console.error('Error verifying Firebase token from cookie:', error);
    return null;
  }
}
