import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

export interface UserPlayers {
  name: string;
  role: string;
  orderType: string;
  isCaptain: boolean;
  batting: number;
  bowling: number;
  position: number;
  bowlingType?: string;
  played: number;
  totalPlayed: number;
  runs: number;
  wickets: number;
  totalRuns: number;
  totalWickets: number;
}

export type UserPlayerStat = UserPlayers & {
  stat: number;
};

export interface UpdatePlayerStats {
  name: string;
  runs: number;
  wickets: number;
}

export default class userPlayersDB {
  private static dbInstance: SQLiteDatabase | null = null;

  public static async getDB(): Promise<SQLiteDatabase> {
    if (this.dbInstance) return this.dbInstance;

    this.dbInstance = await SQLite.openDatabase({
      name: 'userPlayers.db',
      location: 'default',
    });

    return this.dbInstance;
  }

  public static async initUserPlayersTable() {
    const db = await userPlayersDB.getDB();

    await db.executeSql(`
    CREATE TABLE IF NOT EXISTS userPlayers (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT,
      orderType TEXT,
      isCaptain BOOL,
      batting INTEGER,
      bowling INTEGER,
      bowlingType TEXT,
      position INTEGER,
      played INTEGER DEFAULT 0,
      totalPlayed INTEGER DEFAULT 0,
      runs INTEGER DEFAULT 0,
      wickets INTEGER DEFAULT 0,
      totalRuns INTEGER DEFAULT 0,
      totalWickets INTEGER DEFAULT 0
    )
  `);

    console.log('🟢 players table initialized (empty)');
  }

  public static async seedPlayers(players: UserPlayers[]) {
    const db = await userPlayersDB.getDB();

    const [results] = await db.executeSql(
      'SELECT COUNT(*) as count FROM userPlayers',
    );
    const count = results.rows.item(0).count;

    if (count > 0) {
      console.log('⚪ players already seeded, skipping...');
      return;
    }

    const insertPromises = players.map((player, index) => {
      return db.executeSql(
        `INSERT INTO userPlayers 
        (name, role, orderType, isCaptain, batting, bowling, bowlingType, position, played, totalPlayed, runs, wickets, totalRuns, totalWickets)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          player.name,
          player.role ?? null,
          player.orderType ?? null,
          player.isCaptain ? 1 : 0,
          player.batting ?? 0,
          player.bowling ?? 0,
          player.bowlingType ?? null,
          index + 1,
          player.played ?? 0,
          player.totalPlayed ?? 0,
          player.runs ?? 0,
          player.wickets ?? 0,
          player.totalRuns ?? 0,
          player.totalWickets ?? 0,
        ],
      );
    });

    await Promise.all(insertPromises);
    console.log('🟢 userPlayers seeded successfully!');
  }

  public static async getPlayers(): Promise<UserPlayers[]> {
    const db = await userPlayersDB.getDB();

    const [results] = await db.executeSql(
      `SELECT * FROM userPlayers ORDER BY position ASC`,
    );

    const players: UserPlayers[] = [];
    const len = results.rows.length;

    for (let i = 0; i < len; i++) {
      const item = results.rows.item(i);
      players.push(item);
    }

    return players;
  }
  public static async updatePlayerPosition(name: string, newPosition: number) {
    const db = await userPlayersDB.getDB();

    await db.executeSql(
      `UPDATE userPlayers 
     SET position = ? 
     WHERE name = ?`,
      [newPosition, name],
    );

    console.log(`🟢 Updated ${name}'s position to ${newPosition}`);
  }
  public static async dropUserPlayer(): Promise<void> {
    try {
      const db = await userPlayersDB.getDB();

      await db.executeSql(`DROP TABLE IF EXISTS userPlayers`);
      console.log('🟢 user_players has been reset.');
    } catch (error) {
      console.log('❌ resetGame ERROR:', error);
    }
  }

  public static async updateUserPlayers(players: UpdatePlayerStats[]) {
    const db = await userPlayersDB.getDB();

    const updatePromises = players.map(async player => {
      const [results] = await db.executeSql(
        `SELECT played, totalPlayed, runs, wickets, totalRuns, totalWickets 
       FROM userPlayers 
       WHERE name = ?`,
        [player.name],
      );

      if (results.rows.length === 0) return;

      const item = results.rows.item(0);

      const newPlayed = (item.played ?? 0) + 1;
      const newTotalPlayed = (item.totalPlayed ?? 0) + 1;
      const newRuns = (item.runs ?? 0) + player.runs;
      const newTotalRuns = (item.totalRuns ?? 0) + player.runs;
      const newWickets = (item.wickets ?? 0) + player.wickets;
      const newTotalWickets = (item.totalWickets ?? 0) + player.wickets;

      await db.executeSql(
        `UPDATE userPlayers SET
        played = ?,
        totalPlayed = ?,
        runs = ?,
        totalRuns = ?,
        wickets = ?,
        totalWickets = ?
       WHERE name = ?`,
        [
          newPlayed,
          newTotalPlayed,
          newRuns,
          newTotalRuns,
          newWickets,
          newTotalWickets,
          player.name,
        ],
      );

      console.log(`🟢 Updated stats for ${player.name}`);
    });

    await Promise.all(updatePromises);
    console.log('🟢 All players updated successfully!');
  }

  public static async resetSeasonStats() {
    try {
      const db = await userPlayersDB.getDB();

      await db.executeSql(`
      UPDATE userPlayers
      SET played = 0,
          runs = 0,
          wickets = 0
    `);

      console.log(
        '🟢 Season stats reset for all players (played, runs, wickets).',
      );
    } catch (error) {
      console.log('❌ resetSeasonStats ERROR:', error);
    }
  }

  public static async getStatistics(
    season: 'Season' | 'Career',
    type: 'Bat' | 'Ball',
  ): Promise<UserPlayerStat[]> {
    const db = await userPlayersDB.getDB();

    let statColumn: keyof UserPlayers;
    let roleFilter = '';

    if (season === 'Season') {
      statColumn = type === 'Bat' ? 'runs' : 'wickets';
    } else {
      statColumn = type === 'Bat' ? 'totalRuns' : 'totalWickets';
    }

    if (type === 'Ball') {
      roleFilter = `WHERE role IN ('BOWL', 'AR')`;
    } else {
      roleFilter = `WHERE role IN ('BAT', 'AR', 'WK')`;
    }

    const [results] = await db.executeSql(
      `
    SELECT *
    FROM userPlayers
    ${roleFilter}
    ORDER BY position ASC
    `,
    );

    const players: UserPlayerStat[] = [];
    const len = results.rows.length;

    for (let i = 0; i < len; i++) {
      const item = results.rows.item(i) as UserPlayers;

      players.push({
        ...item,
        stat: item[statColumn] ?? 0,
      });
    }

    return players;
  }
}
