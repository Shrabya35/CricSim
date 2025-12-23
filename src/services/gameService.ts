import DBConfig from '../database/dbconfig';
import FixturesDB from '../database/fixturesDB';
import HistoryDB from '../database/historyDB';
import StandingsDB from '../database/standings';
import userPlayersDB from '../database/userPlayersDB';

const resetGame = async () => {
  try {
    await DBConfig.resetGame();
    await FixturesDB.dropFixtures();
    await HistoryDB.dropHistory();
    await StandingsDB.dropStandings();
    await userPlayersDB.dropUserPlayer();
    console.log('game reset successfull');
  } catch (error) {
    console.log('game reset failed', error);
  }
};

const getNextMatch = async () => {
  try {
    const yourTeam = await DBConfig.getUserTeam();
    const yourPlayers = await userPlayersDB.getPlayers();
    const opponent = await FixturesDB.GetNextOpponent();
    const oppTeam = opponent ? await DBConfig.getTeamByName(opponent) : null;

    return { yourTeam, yourPlayers, oppTeam };
  } catch (error) {
    console.log('error getting next match', error);
    return null;
  }
};

export const gameService = { resetGame, getNextMatch };
