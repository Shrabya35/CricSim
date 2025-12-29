import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';
import { predefinedTeams } from './predefinedTeams';

SQLite.enablePromise(true);

export interface Player {
  name: string;
  role: string;
  orderType: string;
  isCaptain: boolean;
  batting: number;
  bowling: number;
}

export interface Team {
  name: string;
  logo: string;
  themeColor: string;
  players: Player[];
}

export default class DBConfig {
  private static dbInstance: SQLiteDatabase | null = null;

  public static async getDB(): Promise<SQLiteDatabase> {
    if (this.dbInstance) return this.dbInstance;

    this.dbInstance = await SQLite.openDatabase({
      name: 'cricket_game.db',
      location: 'default',
    });

    return this.dbInstance;
  }

  public static async initUserDatabase() {
    const db = await DBConfig.getDB();

    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS user_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        selectedTeam TEXT,
        hasStartedGame INTEGER DEFAULT 0
      )
    `);

    const [result] = await db.executeSql('SELECT * FROM user_data LIMIT 1');

    if (result.rows.length === 0) {
      await db.executeSql(`
        INSERT INTO user_data (selectedTeam, hasStartedGame)
        VALUES (NULL, 0)
      `);

      console.log('🟢 user_data initialized (default row inserted)');
    } else {
      console.log('ℹ️ user_data already exists');
    }
  }

  public static async getSelectedUserTeam(): Promise<string | null> {
    const db = await DBConfig.getDB();

    const [result] = await db.executeSql(
      `SELECT selectedTeam FROM user_data LIMIT 1`,
    );

    if (result.rows.length > 0) {
      return result.rows.item(0).selectedTeam;
    }

    return null;
  }

  public static async hasGameStarted(): Promise<boolean> {
    try {
      const db = await DBConfig.getDB();

      const [result] = await db.executeSql(
        'SELECT hasStartedGame FROM user_data LIMIT 1',
      );

      if (result.rows.length === 0) {
        return false;
      }

      const hasStartedGame = result.rows.item(0).hasStartedGame;

      return hasStartedGame === 1;
    } catch (error) {
      console.error('Error checking hasGameStarted:', error);
      return false;
    }
  }

  public static async setGameStarted(started: boolean): Promise<void> {
    try {
      const db = await DBConfig.getDB();
      const value = started ? 1 : 0;

      await db.executeSql('UPDATE user_data SET hasStartedGame = ?', [value]);

      console.log(`Game started status set to: ${started}`);
    } catch (error) {
      console.error('Error updating hasGameStarted:', error);
    }
  }

  public static async startGame(selectedTeamName: string): Promise<void> {
    try {
      const db = await DBConfig.getDB();

      await db.executeSql(
        `UPDATE user_data
       SET selectedTeam = ?, hasStartedGame = 1
       WHERE id = 1`,
        [selectedTeamName],
      );

      console.log(`Game started with team: ${selectedTeamName}`);
    } catch (error) {
      console.error('❌ Error starting game:', error);
    }
  }

  public static async initMasterTeamsTable() {
    const db = await DBConfig.getDB();

    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS master_teams (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        logo TEXT,
        themeColor TEXT,
        players TEXT
      )
    `);

    console.log('🟢 master_teams table initialized (empty)');
  }

  public static async seedTeams(): Promise<
    { name: string; logo: string; themeColor: string }[]
  > {
    const seededTeams: { name: string; logo: string; themeColor: string }[] =
      [];

    try {
      const db = await DBConfig.getDB();
      await DBConfig.initMasterTeamsTable();

      const checkResult = await db.executeSql(
        'SELECT COUNT(*) as count FROM master_teams',
      );
      const count = checkResult[0].rows.item(0).count;

      if (count > 0) {
        console.log('ℹ️ master_teams table already seeded');
        return seededTeams;
      }

      for (const team of predefinedTeams) {
        const playersJson = JSON.stringify(team.players);
        await db.executeSql(
          `INSERT INTO master_teams (name, logo, themeColor, players)
         VALUES (?, ?, ?, ?)`,
          [team.name, team.logo, team.themeColor, playersJson],
        );

        seededTeams.push({
          name: team.name,
          logo: team.logo,
          themeColor: team.themeColor,
        });
      }

      console.log('🟢 master_teams table seeded successfully');
      return seededTeams;
    } catch (error) {
      console.error('❌ Error seeding master_teams:', error);
      return seededTeams;
    }
  }

  public static async getTeamByName(name: string): Promise<Team | null> {
    try {
      const db = await DBConfig.getDB();

      const [result] = await db.executeSql(
        'SELECT * FROM master_teams WHERE name = ? LIMIT 1',
        [name],
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows.item(0);

      const players: Player[] = JSON.parse(row.players);

      const team: Team = {
        name: row.name,
        logo: row.logo,
        themeColor: row.themeColor,
        players,
      };

      return team;
    } catch (error) {
      console.error(`Error fetching team "${name}":`, error);
      return null;
    }
  }

  public static async getUserTeam(): Promise<Team | null> {
    try {
      const db = await DBConfig.getDB();

      const [userResult] = await db.executeSql(
        'SELECT selectedTeam FROM user_data LIMIT 1',
      );

      if (userResult.rows.length === 0) {
        return null;
      }
      const selectedTeamName = userResult.rows.item(0).selectedTeam;
      if (!selectedTeamName) {
        return null;
      }
      console.log(`Fetched user team: ${selectedTeamName}`);

      return await DBConfig.getTeamByName(selectedTeamName);
    } catch (error) {
      console.error(`Error fetching user team":`, error);
      return null;
    }
  }

  public static async resetGame() {
    try {
      const db = await DBConfig.getDB();

      await db.executeSql(`DROP TABLE IF EXISTS master_teams`);

      await db.executeSql(`
      UPDATE user_data 
      SET selectedTeam = NULL,
          hasStartedGame = 0
    `);

      console.log('🟢 Game has been reset.');
      return true;
    } catch (error) {
      console.log('❌ resetGame ERROR:', error);
      return false;
    }
  }
}
