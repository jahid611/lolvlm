require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;
const RIOT_API_KEY = process.env.RIOT_API_KEY; // Assurez-vous de définir cette variable dans .env si besoin

app.use(cors());

// Mappings de région
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

/**
 * Endpoint 1 : Récupérer le profil via Riot ID
 * GET /api/summoner/:region/by-riot-id/:gameName/:tagLine
 */
app.get('/api/summoner/:region/by-riot-id/:gameName/:tagLine', async (req, res) => {
  const { region, gameName, tagLine } = req.params;

  if (!accountRegionMapping[region] || !summonerRegionMapping[region]) {
    return res.status(400).json({ message: "Région non supportée ou invalide." });
  }

  try {
    // 1) Récupérer le PUUID via Account-V1
    const accountUrl = `https://${accountRegionMapping[region]}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
    const accountRes = await axios.get(accountUrl, {
      headers: { 'X-Riot-Token': RIOT_API_KEY }
    });
    const puuid = accountRes.data.puuid;

    // 2) Récupérer les infos Summoner-V4
    const summonerUrl = `https://${summonerRegionMapping[region]}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
    const summonerRes = await axios.get(summonerUrl, {
      headers: { 'X-Riot-Token': RIOT_API_KEY }
    });

    // Fusion des données
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
 * Endpoint 2 : Récupérer les infos de classement
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
 * Endpoint 3 : Récupérer l'historique de matchs
 * GET /api/matches/:region/:puuid?count=5
 */
app.get('/api/matches/:region/:puuid', async (req, res) => {
  const { region, puuid } = req.params;
  const count = req.query.count || 5;

  if (!matchRegionMapping[region]) {
    return res.status(400).json({ message: "Région non supportée ou invalide." });
  }

  try {
    // 1) Récupérer les IDs de matchs
    const matchIdsUrl = `https://${matchRegionMapping[region]}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}`;
    const matchIdsRes = await axios.get(matchIdsUrl, {
      headers: { 'X-Riot-Token': RIOT_API_KEY }
    });

    // 2) Récupérer les détails de chaque match
    const matchDetailsPromises = matchIdsRes.data.map(matchId =>
      axios.get(`https://${matchRegionMapping[region]}.api.riotgames.com/lol/match/v5/matches/${matchId}`, {
        headers: { 'X-Riot-Token': RIOT_API_KEY }
      })
    );
    const matchesRes = await Promise.all(matchDetailsPromises);

    // 3) Construire un tableau d'objets simplifiés
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
        queueId: info.queueId
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
