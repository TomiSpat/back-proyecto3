import { hashSync, compareSync } from 'bcrypt';

export class HashHelper {
  static hash(password: string): string {
    return hashSync(password, 10);
  }

  static compare(password: string, hashedPassword: string): boolean {
    return compareSync(password, hashedPassword);
  }
}
