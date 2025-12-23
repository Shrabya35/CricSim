import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';
import StandingsDB from './standings';

SQLite.enablePromise(true);

export interface fixtures {
  completed: boolean;
  yourTeam: string;
  yourLogo: string;
  oppTeam: string;
  oppLogo: string;
  yourRun?: number;
  yourWicket?: number;
  oppRun?: number;
  oppWicket?: number;
  winText?: string;
}

export default class FixturesDB {
  private static dbInstance: SQLiteDatabase | null = null;

  public static async getDB(): Promise<SQLiteDatabase> {
    if (this.dbInstance) return this.dbInstance;

    this.dbInstance = await SQLite.openDatabase({
      name: 'fixtures.db',
      location: 'default',
    });

    return this.dbInstance;
  }

  public static async initFixturesTable() {
    const db = await FixturesDB.getDB();

    await db.executeSql(`
    CREATE TABLE IF NOT EXISTS fixtures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    completed BOOLEAN DEFAULT 0,
    yourTeam TEXT NOT NULL,
    yourLogo TEXT NOT NULL,
    oppTeam TEXT NOT NULL,
    oppLogo TEXT NOT NULL,
    yourRun INTEGER,
    yourWicket INTEGER,
    oppRun INTEGER,
    oppWicket INTEGER,
    winText TEXT
);

  `);

    console.log('🟢 fixtures table initialized');
  }

  public static async setFixtures(selectedTeam: string) {
    const db = await FixturesDB.getDB();

    const teams = await StandingsDB.getStandings();

    const yourTeam = teams.find(t => t.name === selectedTeam);

    if (!yourTeam) {
      console.error('❌ Selected team not found:', selectedTeam);
      return;
    }

    const opponents = teams.filter(t => t.name !== selectedTeam);

    for (const opp of opponents) {
      await db.executeSql(
        `INSERT INTO fixtures 
        (completed, yourTeam, yourLogo, oppTeam, oppLogo) 
        VALUES (?, ?, ?, ?, ?)
      `,
        [0, yourTeam.name, yourTeam.logo, opp.name, opp.logo],
      );
    }

    console.log('🟢 Fixtures created for:', selectedTeam);
  }

  public static async getFixtures(): Promise<fixtures[]> {
    const db = await FixturesDB.getDB();

    const [result] = await db.executeSql(
      `SELECT * FROM fixtures ORDER BY id ASC`,
    );

    const list: fixtures[] = [];

    for (let i = 0; i < result.rows.length; i++) {
      list.push(result.rows.item(i));
    }

    return list;
  }

  public static async GetNextOpponent(): Promise<string | null> {
    try {
      const db = await FixturesDB.getDB();

      const [result] = await db.executeSql(
        `SELECT oppTeam 
       FROM fixtures 
       WHERE completed = 0 
       ORDER BY id ASC 
       LIMIT 1`,
      );

      if (result.rows.length === 0) return null;

      return result.rows.item(0).oppTeam;
    } catch (error) {
      console.log('GetNextOpponent ERROR:', error);
      return null;
    }
  }

  public static async markFirstIncompleteFixtureCompleted(
    yourRun: number,
    yourWicket: number,
    oppRun: number,
    oppWicket: number,
    winText: string,
  ): Promise<void> {
    try {
      const db = await FixturesDB.getDB();

      await db.executeSql(
        `UPDATE fixtures
       SET completed = 1,
           yourRun = ?,
           yourWicket = ?,
           oppRun = ?,
           oppWicket = ?,
           winText = ?
       WHERE id = (
         SELECT id FROM fixtures
         WHERE completed = 0
         ORDER BY id ASC
         LIMIT 1
       )`,
        [yourRun, yourWicket, oppRun, oppWicket, winText],
      );

      console.log(
        '🟢 First incomplete fixture marked as completed with stats.',
      );
    } catch (error) {
      console.log('❌ markFirstIncompleteFixtureCompleted ERROR:', error);
    }
  }

  public static async dropFixtures(): Promise<void> {
    try {
      const db = await FixturesDB.getDB();

      await db.executeSql(`DROP TABLE IF EXISTS fixtures`);
      console.log('🟢 fixtures has been reset.');
    } catch (error) {
      console.log('❌ resetGame ERROR:', error);
    }
  }
}
