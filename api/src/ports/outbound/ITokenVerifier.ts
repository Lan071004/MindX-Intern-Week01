export interface DecodedToken {
  uid: string;
  email?: string;
  name?: string;
}

export interface ITokenVerifier {
  verifyToken(token: string): Promise<DecodedToken>;
}