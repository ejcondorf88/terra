declare module 'speakeasy' {
  export interface Secret {
    base32: string;
    otpauth_url?: string;
  }

  export function generateSecret(options: { name: string; issuer: string; length: number }): Secret;
  export const totp: {
    verify(options: { secret: string; encoding: string; token: string }): boolean;
  };
}
