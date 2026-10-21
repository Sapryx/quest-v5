import { SQLiteStorage } from 'expo-sqlite/kv-store';
import { z } from 'zod';

// Нереляционное хранилище документов (замена Realm, недоступного в Expo Go):
// объекты целиком хранятся как JSON по ключу «коллекция:id» и проверяются схемой при чтении
const storage = new SQLiteStorage('documents.db');

export class DocumentCollection<T extends { id: string }> {
  constructor(
    private readonly name: string,
    private readonly schema: z.ZodType<T>,
  ) {}

  private key(id: string) {
    return `${this.name}:${id}`;
  }

  async put(document: T) {
    await storage.setItemAsync(this.key(document.id), JSON.stringify(this.schema.parse(document)));
  }

  async get(id: string): Promise<T | null> {
    const raw = await storage.getItemAsync(this.key(id));
    return raw === null ? null : this.schema.parse(JSON.parse(raw));
  }

  async all(): Promise<T[]> {
    const prefix = `${this.name}:`;
    const keys = (await storage.getAllKeysAsync()).filter((key) => key.startsWith(prefix));
    const documents: (T | null)[] = await Promise.all(keys.map((key) => this.get(key.slice(prefix.length))));
    return documents.filter((d) => d !== null);
  }
}
