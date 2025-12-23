import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

export interface Team {
  name: string;
  logo: string;
  theme: string;
}

export interface History {
  year: string;
  winner: string;
  logo: string;
  theme: string;
  ongoing: boolean;
}

export default class HistoryDB {
  private static dbInstance: SQLiteDatabase | null = null;

  public static async getDB(): Promise<SQLiteDatabase> {
    if (this.dbInstance) return this.dbInstance;

    this.dbInstance = await SQLite.openDatabase({
      name: 'history.db',
      location: 'default',
    });

    return this.dbInstance;
  }

  public static async initHistoryTable() {
    const db = await HistoryDB.getDB();

    await db.executeSql(`
    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year TEXT NOT NULL,
      ongoing INTEGER DEFAULT 1,
      name TEXT,
      logo TEXT,
      theme TEXT
    );
  `);

    const year = new Date().getFullYear().toString();

    const [result] = await db.executeSql(
      `SELECT * FROM history WHERE year = ?;`,
      [year],
    );
    if (result.rows.length === 0) {
      await db.executeSql(`INSERT INTO history (year) VALUES (?);`, [year]);
    }

    console.log('🟢 history table initialized');
  }

  public static async getCurrentSeason(): Promise<string> {
    try {
      const db = await HistoryDB.getDB();

      const [result] = await db.executeSql(
        `SELECT year FROM history WHERE ongoing = 1`,
      );

      if (result.rows.length > 0) {
        return result.rows.item(0).year;
      } else {
        return new Date().getFullYear().toString();
      }
    } catch (error) {
      console.log('error getting current season', error);
      return new Date().getFullYear().toString();
    }
  }

  public static async getHistory(): Promise<History[]> {
    try {
      const db = await HistoryDB.getDB();
      const [results] = await db.executeSql(
        `SELECT * FROM history ORDER BY year ASC`,
      );

      const history: History[] = [];
      const len = results.rows.length;

      for (let i = 0; i < len; i++) {
        const item = results.rows.item(i);
        history.push(item);
      }

      return history;
    } catch (error) {
      console.log('error getting hsitory', error);
      return [];
    }
  }

  public static async dropHistory(): Promise<void> {
    try {
      const db = await HistoryDB.getDB();

      await db.executeSql(`DROP TABLE IF EXISTS history`);
      console.log('🟢 history has been reset.');
    } catch (error) {
      console.log('❌ resetGame ERROR:', error);
    }
  }
}
