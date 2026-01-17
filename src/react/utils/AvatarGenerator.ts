// Simple avatar utility for generating consistent avatars per user/conversation
export class AvatarGenerator {
  private static colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', 
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43'
  ];

  private static avatarCache = new Map<string, { color: string; initials: string; }>();

  /**
   * Generate a consistent avatar for a given identifier
   */
  static generateAvatar(identifier: string, name?: string): { color: string; initials: string; } {
    // Check cache first
    if (this.avatarCache.has(identifier)) {
      return this.avatarCache.get(identifier)!;
    }

    // Generate consistent color based on identifier hash
    const hash = this.hashString(identifier);
    const colorIndex = hash % this.colors.length;
    const color = this.colors[colorIndex];

    // Generate initials
    const initials = name ? 
      name.split(' ').map(word => word.charAt(0)).join('').slice(0, 2).toUpperCase() :
      identifier.slice(0, 2).toUpperCase();

    const avatar = { color, initials };
    this.avatarCache.set(identifier, avatar);
    return avatar;
  }

  /**
   * Simple string hash function for consistent color selection
   */
  private static hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Clear avatar cache (useful for testing)
   */
  static clearCache(): void {
    this.avatarCache.clear();
  }
}