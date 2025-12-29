import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';
import DBConfig from './dbconfig';

SQLite.enablePromise(true);

interface Team {
  name: string;
  logo: string;
  themeColor: string;
}

export interface SimpleTeam {
  name: string;
  logo: string;
  themeColor: string;
  position: number;
}

interface TeamStanding {
  id: number;
  name: string;
  logo: string;
  themeColor: string;
  win: number;
  lose: number;
  tie: number;
  points: number;
  nrr: number;
  position: number;
}

export type GameEndResult =
  | { gameEnded: false }
  | {
      gameEnded: true;
      teams: {
        name: string;
        position: number;
      }[];
    };

export default class StandingsDB {
  private static dbInstance: SQLiteDatabase | null = null;

  public static async getDB(): Promise<SQLiteDatabase> {
    if (this.dbInstance) return this.dbInstance;

    this.dbInstance = await SQLite.openDatabase({
      name: 'standings.db',
      location: 'default',
    });

    return this.dbInstance;
  }

  public static async initStandingsTable() {
    const db = await StandingsDB.getDB();

    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS standings (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        logo TEXT,
        themeColor TEXT,
        win INTEGER DEFAULT 0,
       lose INTEGER DEFAULT 0,
       tie INTEGER DEFAULT 0,
       points INTEGER DEFAULT 0,
       nrr REAL DEFAULT 0
      )
    `);

    console.log('🟢 standings table initialized (empty)');
  }

  public static async seedTeams(initialTeams: Team[]) {
    const db = await StandingsDB.getDB();

    const [results] = await db.executeSql(
      'SELECT COUNT(*) as count FROM standings',
    );
    const count = results.rows.item(0).count;

    if (count > 0) {
      console.log('⚪ Standings already seeded, skipping...');
      return;
    }

    const insertPromises = initialTeams.map(team => {
      return db.executeSql(
        `INSERT INTO standings (name, logo, themeColor) VALUES (?, ?, ?)`,
        [team.name, team.logo, team.themeColor],
      );
    });

    await Promise.all(insertPromises);
    console.log('🟢 Standings seeded successfully!');
  }

  public static async getStandings(): Promise<TeamStanding[]> {
    const db = await StandingsDB.getDB();

    const [results] = await db.executeSql(
      `SELECT * FROM standings ORDER BY points DESC, nrr DESC`,
    );

    const standings: TeamStanding[] = [];
    const len = results.rows.length;

    for (let i = 0; i < len; i++) {
      const item = results.rows.item(i);
      standings.push({
        ...item,
        position: i + 1,
      });
    }

    console.log(standings);
    return standings;
  }

  public static async getUserPosition(): Promise<number | null> {
    try {
      const db = await StandingsDB.getDB();
      const userTeam = await DBConfig.getUserTeam();
      if (!userTeam) return null;

      const result = await db.executeSql(
        `SELECT name FROM standings ORDER BY points DESC, nrr DESC`,
      );

      const rows = result[0].rows;
      const teamNames: string[] = [];

      for (let i = 0; i < rows.length; i++) {
        teamNames.push(rows.item(i).name);
      }

      const index = teamNames.indexOf(userTeam.name);

      if (index === -1) return null;

      return index + 1;
    } catch (error) {
      console.log("error getting user's position", error);
      return null;
    }
  }

  public static async updateStanding(
    team1: string,
    team2: string,
    winningTeam: string,
    winningTeamNRR: number,
  ): Promise<GameEndResult> {
    try {
      const db = await this.getDB();

      const losingTeam = team1 === winningTeam ? team2 : team1;

      await db.executeSql(
        `UPDATE standings
       SET
         win = win + CASE WHEN name = ? THEN 1 ELSE 0 END,
         lose = lose + CASE WHEN name = ? THEN 1 ELSE 0 END,
         tie = tie + 0,
         points = points + CASE WHEN name = ? THEN 2 ELSE 0 END,
         nrr = nrr + CASE WHEN name = ? THEN ? ELSE ? END
       WHERE name IN (?, ?)`,
        [
          winningTeam,
          losingTeam,
          winningTeam,
          winningTeam,
          winningTeamNRR,
          -winningTeamNRR,
          team1,
          team2,
        ],
      );

      console.log(`🟢 Updated: ${winningTeam} beat ${losingTeam}`);

      const standings = await this.getStandings();

      const remainingTeams = standings
        .map(t => t.name)
        .filter(n => n !== team1 && n !== team2);

      for (let i = 0; i < remainingTeams.length; i += 2) {
        const t1 = remainingTeams[i];
        const t2 = remainingTeams[i + 1];
        if (!t2) break;

        const winner = Math.random() > 0.5 ? t1 : t2;
        const loser = winner === t1 ? t2 : t1;
        const nrrChange = parseFloat((Math.random() * 1.8 + 0.2).toFixed(2));

        await db.executeSql(
          `UPDATE standings
         SET
           win = win + CASE WHEN name = ? THEN 1 ELSE 0 END,
           lose = lose + CASE WHEN name = ? THEN 1 ELSE 0 END,
           tie = tie + 0,
           points = points + CASE WHEN name = ? THEN 2 ELSE 0 END,
           nrr = nrr + CASE WHEN name = ? THEN ? ELSE ? END
         WHERE name IN (?, ?)`,
          [winner, loser, winner, winner, nrrChange, -nrrChange, t1, t2],
        );
      }

      const finalStandings = await this.getStandings();

      const team1Data = finalStandings.find(t => t.name === team1);

      if (!team1Data) {
        return { gameEnded: false };
      }

      const matchesPlayed = team1Data.win + team1Data.lose + team1Data.tie;

      if (matchesPlayed === 7) {
        const team1Pos = finalStandings.findIndex(t => t.name === team1) + 1;
        const team2Pos = finalStandings.findIndex(t => t.name === team2) + 1;

        return {
          gameEnded: true,
          teams: [
            { name: team1, position: team1Pos },
            { name: team2, position: team2Pos },
          ],
        };
      }

      return { gameEnded: false };
    } catch (error) {
      console.log('❌ updateStanding ERROR:', error);
      return { gameEnded: false };
    }
  }

  public static async getTeamByPosition(
    position: number,
  ): Promise<SimpleTeam | null> {
    try {
      const db = await StandingsDB.getDB();

      const [results] = await db.executeSql(
        `SELECT name, logo, themeColor FROM standings ORDER BY points DESC, nrr DESC LIMIT 1 OFFSET ?`,
        [position - 1],
      );

      if (results.rows.length === 0) return null;

      const item = results.rows.item(0);

      return {
        name: item.name,
        logo: item.logo,
        themeColor: item.themeColor,
        position: position,
      };
    } catch (error) {
      console.log('❌ getTeamByPosition ERROR:', error);
      return null;
    }
  }

  public static async resetStandingsStats() {
    try {
      console.log('RESET FUNCTION CALLED');
      const db = await StandingsDB.getDB();

      const [results] = await db.executeSql(
        `SELECT id FROM standings ORDER BY id ASC`,
      );
      const rows = results.rows;
      const positions: number[] = [];
      for (let i = 0; i < rows.length; i++) {
        positions.push(i + 1);
      }

      for (let i = 0; i < rows.length; i++) {
        const id = rows.item(i).id;
        await db.executeSql(
          `UPDATE standings
          SET win = 0,
         lose = 0,
          tie = 0,
          points = 0,
          nrr = 0
          WHERE id = ?`,
          [id],
        );
      }

      console.log(
        '🟢 All standings stats reset and positions restored to initial order.',
      );
    } catch (error) {
      console.log('❌ resetStandingsStats ERROR:', error);
    }
  }

  public static async dropStandings(): Promise<void> {
    try {
      const db = await StandingsDB.getDB();

      await db.executeSql(`DROP TABLE IF EXISTS standings`);
      console.log('🟢 standings has been reset.');
    } catch (error) {
      console.log('❌ resetGame ERROR:', error);
    }
  }
}
