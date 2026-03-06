import admin from "./firebaseAdmin";
import { ITokenVerifier, DecodedToken } from "../../../ports/outbound/ITokenVerifier";

export class FirebaseTokenVerifier implements ITokenVerifier {
  async verifyToken(token: string): Promise<DecodedToken> {
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      return {  
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name
      };
    } catch (error) {
      console.error('Error verifying token:', error);
      throw new Error('Invalid token');
    }}
}