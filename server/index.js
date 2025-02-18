require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;
const RIOT_API_KEY = process.env.RIOT_API_KEY;

app.use(cors());

// Mappings
const accountRegionMapping = {
  euw: "europe",
  eune: "europe",
  na: "americas",
  kr: "asia",
  jp: "asia"
};
const summonerRegionMapping = {
  euw: "euw1",
  eune: "eun1",
  na: "na1",
  kr: "kr",
  jp: "jp1"
};
const matchRegionMapping = {
  euw: "europe",
  eune: "europe",
  na: "americas",
  kr: "asia",
  jp: "asia"
};

// Petit endpoint racine pour éviter "Cannot GET /"
app.get('/', (req, res) => {
  res.send('Hello from Aatrox-themed scoreboard server!');
});

/**
 * 1) Récupérer le profil d’un joueur via Riot ID
 * GET /api/summoner/:region/by-riot-id/:gameName/:tagLine
 */
app.get('/api/summoner/:region/by-riot-id/:gameName/:tagLine', async (req, res) => {
  const { region, gameName, tagLine } = req.params;

  if (!accountRegionMapping[region] || !summonerRegionMapping[region]) {
    return res.status(400).json({ message: "Région non supportée ou invalide." });
  }

  try {
    // 1) PUUID
    const accountUrl = `https://${accountRegionMapping[region]}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
    const accountRes = await axios.get(accountUrl, {
      headers: { 'X-Riot-Token': RIOT_API_KEY }
    });
    const puuid = accountRes.data.puuid;

    // 2) Summoner info
    const summonerUrl = `https://${summonerRegionMapping[region]}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
    const summonerRes = await axios.get(summonerUrl, {
      headers: { 'X-Riot-Token': RIOT_API_KEY }
    });

    res.json({
      ...summonerRes.data,
      gameName: accountRes.data.gameName,
      tagLine: accountRes.data.tagLine,
      puuid
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    if (error.response) {
      return res.status(error.response.status).json({
        message: error.response.data.status?.message || "Impossible de récupérer le profil."
      });
    }
    res.status(500).json({ message: "Erreur interne lors de la récupération du profil." });
  }
});

/**
 * 2) Récupérer les infos de classement
 * GET /api/league/:region/:encryptedSummonerId
 */
app.get('/api/league/:region/:encryptedSummonerId', async (req, res) => {
  const { region, encryptedSummonerId } = req.params;
  if (!summonerRegionMapping[region]) {
    return res.status(400).json({ message: "Région non supportée ou invalide." });
  }

  try {
    const leagueUrl = `https://${summonerRegionMapping[region]}.api.riotgames.com/lol/league/v4/entries/by-summoner/${encryptedSummonerId}`;
    const leagueRes = await axios.get(leagueUrl, {
      headers: { 'X-Riot-Token': RIOT_API_KEY }
    });
    res.json(leagueRes.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    if (error.response) {
      return res.status(error.response.status).json({
        message: error.response.data.status?.message || "Impossible de récupérer les infos de rang."
      });
    }
    res.status(500).json({ message: "Erreur interne lors de la récupération des infos de rang." });
  }
});

/**
 * 3) Récupérer l'historique de matchs, scoreboard style
 * GET /api/matches/:region/:puuid?count=5
 */
app.get('/api/matches/:region/:puuid', async (req, res) => {
  const { region, puuid } = req.params;
  const count = req.query.count || 5;

  if (!matchRegionMapping[region]) {
    return res.status(400).json({ message: "Région non supportée ou invalide." });
  }

  try {
    // 1) IDs de matchs
    const matchIdsUrl = `https://${matchRegionMapping[region]}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}`;
    const matchIdsRes = await axios.get(matchIdsUrl, {
      headers: { 'X-Riot-Token': RIOT_API_KEY }
    });

    // 2) Détails de chaque match
    const matchDetailsPromises = matchIdsRes.data.map(matchId =>
      axios.get(`https://${matchRegionMapping[region]}.api.riotgames.com/lol/match/v5/matches/${matchId}`, {
        headers: { 'X-Riot-Token': RIOT_API_KEY }
      })
    );
    const matchesRes = await Promise.all(matchDetailsPromises);

    // 3) Construire un scoreboard
    const matchDetails = matchesRes.map(resp => {
      const info = resp.data.info;
      const metadata = resp.data.metadata;
      const participants = info.participants;

      // On regroupe participants par teamId
      const team100 = participants.filter(p => p.teamId === 100);
      const team200 = participants.filter(p => p.teamId === 200);

      // On récupère la team info (pour connaître la victoire/défaite)
      const teamStats100 = info.teams.find(t => t.teamId === 100);
      const teamStats200 = info.teams.find(t => t.teamId === 200);

      return {
        matchId: metadata.matchId,
        gameMode: info.gameMode,
        gameDuration: info.gameDuration,
        queueId: info.queueId,

        // scoreboard complet
        teams: [
          {
            teamId: 100,
            win: teamStats100?.win || false,
            objectives: teamStats100?.objectives || {},
            participants: team100.map(p => ({
              summonerName: p.summonerName,
              championName: p.championName,
              kills: p.kills,
              deaths: p.deaths,
              assists: p.assists,
              goldEarned: p.goldEarned,
              totalDamageDealtToChampions: p.totalDamageDealtToChampions,
              visionScore: p.visionScore,
              summoner1Id: p.summoner1Id,
              summoner2Id: p.summoner2Id,
              item0: p.item0,
              item1: p.item1,
              item2: p.item2,
              item3: p.item3,
              item4: p.item4,
              item5: p.item5,
              item6: p.item6,
              creepScore: (p.totalMinionsKilled || 0) + (p.neutralMinionsKilled || 0),
              puuid: p.puuid // si besoin
            }))
          },
          {
            teamId: 200,
            win: teamStats200?.win || false,
            objectives: teamStats200?.objectives || {},
            participants: team200.map(p => ({
              summonerName: p.summonerName,
              championName: p.championName,
              kills: p.kills,
              deaths: p.deaths,
              assists: p.assists,
              goldEarned: p.goldEarned,
              totalDamageDealtToChampions: p.totalDamageDealtToChampions,
              visionScore: p.visionScore,
              summoner1Id: p.summoner1Id,
              summoner2Id: p.summoner2Id,
              item0: p.item0,
              item1: p.item1,
              item2: p.item2,
              item3: p.item3,
              item4: p.item4,
              item5: p.item5,
              item6: p.item6,
              creepScore: (p.totalMinionsKilled || 0) + (p.neutralMinionsKilled || 0),
              puuid: p.puuid
            }))
          }
        ]
      };
    });

    res.json(matchDetails);
  } catch (error) {
    console.error(error.response?.data || error.message);
    if (error.response) {
      return res.status(error.response.status).json({
        message: error.response.data.status?.message || "Impossible de récupérer l'historique de matchs."
      });
    }
    res.status(500).json({ message: "Erreur interne lors de la récupération des matchs." });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
