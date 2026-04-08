const prefixes = ['truck', 'cargo', 'route', 'atlas', 'haul', 'drive', 'fleet', 'move'];

export function generateLogin(): string {
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${number}`;
}

export function generatePassword(): string {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 9; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
}
