// server/index.js

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3005;
const RIOT_API_KEY = process.env.RIOT_API_KEY;

// Active CORS
app.use(cors());

// Mappings régionaux
// Pour l'API account, on utilise "europe", "americas", etc.
const accountRegionMapping = {
  euw: "europe",
  eune: "europe",
  na: "americas",
  kr: "asia",
  jp: "asia"
};

// Pour Summoner-V4, le domaine dépend de la région
const summonerRegionMapping = {
  euw: "euw1",
  eune: "eun1",
  na: "na1",
  kr: "kr",
  jp: "jp1"
};

// Pour Match-V5, on utilise aussi la région pour l'endpoint
const matchRegionMapping = {
  euw: "europe",
  eune: "europe",
  na: "americas",
  kr: "asia",
  jp: "asia"
};

/**
 * Endpoint : Récupérer le profil d’un joueur via Riot ID
 * URL : GET /api/summoner/:region/by-riot-id/:gameName/:tagLine
 */
app.get('/api/summoner/:region/by-riot-id/:gameName/:tagLine', async (req, res) => {
  const { region, gameName, tagLine } = req.params;
  // Vérifier que la région est supportée
  if (!accountRegionMapping[region] || !summonerRegionMapping[region]) {
    return res.status(400).json({ error: "Région non supportée." });
  }
  try {
    // Récupérer l'account pour obtenir le PUUID
    const accountUrl = `https://${accountRegionMapping[region]}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
    const accountRes = await axios.get(accountUrl, {
      headers: { 'X-Riot-Token': RIOT_API_KEY },
    });
    const puuid = accountRes.data.puuid;

    // Récupérer les infos du joueur via Summoner-V4
    const summonerUrl = `https://${summonerRegionMapping[region]}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
    const summonerRes = await axios.get(summonerUrl, {
      headers: { 'X-Riot-Token': RIOT_API_KEY },
    });
    res.json({
      ...summonerRes.data, // name, profileIconId, summonerLevel, id (encryptedSummonerId), etc.
      gameName: accountRes.data.gameName,
      tagLine: accountRes.data.tagLine,
      puuid,
    });
  } catch (error) {
    console.error('Erreur /by-riot-id :', error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.response ? error.response.data : error.message });
  }
});

/**
 * Endpoint : Récupérer le classement du joueur via encryptedSummonerId
 * URL : GET /api/league/:region/:encryptedSummonerId
 */
app.get('/api/league/:region/:encryptedSummonerId', async (req, res) => {
  const { region, encryptedSummonerId } = req.params;
  if (!summonerRegionMapping[region]) {
    return res.status(400).json({ error: "Région non supportée." });
  }
  try {
    const leagueUrl = `https://${summonerRegionMapping[region]}.api.riotgames.com/lol/league/v4/entries/by-summoner/${encryptedSummonerId}`;
    const leagueRes = await axios.get(leagueUrl, {
      headers: { 'X-Riot-Token': RIOT_API_KEY },
    });
    res.json(leagueRes.data);
  } catch (error) {
    console.error('Erreur /league :', error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.response ? error.response.data : error.message });
  }
});

/**
 * Endpoint : Récupérer l'historique des matchs récents via puuid
 * URL : GET /api/matches/:region/:puuid?count=5
 */
app.get('/api/matches/:region/:puuid', async (req, res) => {
  const { region, puuid } = req.params;
  const count = req.query.count || 5;
  if (!matchRegionMapping[region]) {
    return res.status(400).json({ error: "Région non supportée." });
  }
  try {
    const matchIdsUrl = `https://${matchRegionMapping[region]}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}`;
    const matchIdsRes = await axios.get(matchIdsUrl, {
      headers: { 'X-Riot-Token': RIOT_API_KEY },
    });

    const matchDetailsPromises = matchIdsRes.data.map(matchId =>
      axios.get(`https://${matchRegionMapping[region]}.api.riotgames.com/lol/match/v5/matches/${matchId}`, {
        headers: { 'X-Riot-Token': RIOT_API_KEY },
      })
    );
    const matchesRes = await Promise.all(matchDetailsPromises);

    const matchDetails = matchesRes.map(resp => {
      const info = resp.data.info;
      const participant = info.participants.find(p => p.puuid === puuid) || {};
      return {
        matchId: resp.data.metadata.matchId,
        championName: participant.championName,
        kills: participant.kills,
        deaths: participant.deaths,
        assists: participant.assists,
        win: participant.win,
        gameDuration: info.gameDuration,
        gameMode: info.gameMode,
        totalDamageDealt: participant.totalDamageDealtToChampions,
        visionScore: participant.visionScore,
        creepScore: (participant.totalMinionsKilled || 0) + (participant.neutralMinionsKilled || 0),
        queueId: info.queueId,
      };
    });

    res.json(matchDetails);
  } catch (error) {
    console.error('Erreur /matches :', error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.response ? error.response.data : error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
