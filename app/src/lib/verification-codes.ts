// Store pending verification codes in memory (short-lived)
// In production, use Redis for distributed storage
export const pendingCodes = new Map<
  string,
  { userId: string; channel: string; senderId: string; expiresAt: number }
>();
