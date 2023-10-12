const firebaseapp = require("firebase/app");
const firestore = require("firebase/firestore");
const crypto = require("crypto");
const buffer = require("buffer");
const { Agent } = require("undici");

const express = require("express");

const app = express();

app.use(express.json({ limit: "1mb", type: "*/*" }));

const firebaseConfig = {
  apiKey: "AIzaSyDf9ZiTBWf-sWY007WsKktMPewcrs07CWw",
  authDomain: "championslounge-f0f36.firebaseapp.com",
  projectId: "championslounge-f0f36",
  storageBucket: "championslounge-f0f36.appspot.com",
  messagingSenderId: "163156624093",
  appId: "1:163156624093:web:dfe860c8bb38a62b075134",
};

// Initialize Firebase
const fapp = firebaseapp.initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = firestore.getFirestore(fapp);

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

app.set("port", process.env.PORT || 3001);

app.get("*", (req, res) => {
  res.send("Madden Companion Exporter");
});

app.post("/:discord/:platform/:leagueId/leagueteams", (req, res) => {
  const { leagueTeamInfoList: teamsData } = req.body;
  if (!teamsData) {
    res.sendStatus(500);
    return;
  }
  let teams = {};
  const {
    params: { discord },
  } = req;
  teamsData.forEach(
    (t) =>
      (teams[t.teamId] = {
        teamName: t.displayName,
        abbr: t.abbrName,
        username: t.userName,
        division: t.divName,
        cityName: t.cityName,
      }),
  );
  firestore
    .setDoc(
      firestore.doc(db, "leagues", discord),
      {
        guild_id: discord,
        teams: teams,
      },
      { merge: true },
    )
    .then((_) => {
      console.log(`teams written with id`);
      res.sendStatus(200);
    })
    .catch((e) => {
      console.log(e);
      res.sendStatus(500);
    });
});

app.post("/:discord/:platform/:leagueId/standings", (req, res) => {
  res.sendStatus(200);
});

app.post(
  "/:discord/:platform/:leagueId/week/:weekType/:weekNum/:dataType",
  (req, res) => {
    const {
      params: { discord, weekType, weekNum, dataType },
    } = req;
    switch (dataType) {
      case "schedules": {
        const { gameScheduleInfoList: schedulesRaw } = req.body;
        if (!schedulesRaw) {
          res.sendStatus(500);
          return;
        }
        const schedules = {};
        schedules[weekType] = {};
        schedules[weekType][`week${weekNum}`] = schedulesRaw.map((game) => ({
          awayTeamId: game.awayTeamId,
          homeTeamId: game.homeTeamId,
          awayScore: game.awayScore,
          homeScore: game.homeScore,
          scheduleId: game.scheduleId,
        }));
        firestore
          .setDoc(
            firestore.doc(db, "leagues", discord),
            {
              guild_id: discord,
              schedules: schedules,
            },
            { merge: true },
          )
          .then((_) => {
            console.log(`schedule written with id`);
            res.sendStatus(200);
          })
          .catch((e) => {
            console.log(e);
            res.sendStatus(500);
          });
        break;
      }
      case "teamstats": {
        res.sendStatus(200);
        break;
      }
      case "defense": {
        res.sendStatus(200);
        break;
      }
      default: {
        res.sendStatus(200);
        break;
      }
    }
  },
);

// ROSTERS
app.post("/:username/:platform/:leagueId/freeagents/roster", (req, res) => {
  res.sendStatus(200);
});

app.post("/:username/:platform/:leagueId/team/:teamId/roster", (req, res) => {
  res.sendStatus(200);
});

//media
app.post("/media/:discord/:platform/:leagueId/leagueteams", (req, res) => {
  const { leagueTeamInfoList: teamsData } = req.body;
  if (!teamsData) {
    res.sendStatus(500);
    return;
  }

  let teams = {};
  const {
    params: { discord },
  } = req;
  teamsData.forEach(
    (t) =>
      (teams[t.teamId] = {
        teamName: t.displayName,
        abbr: t.abbrName,
        username: t.userName,
        division: t.divName,
        cityName: t.cityName,
      }),
  );
  firestore
    .setDoc(
      firestore.doc(db, "media", discord),
      {
        guild_id: discord,
        teams: teams,
      },
      { merge: true },
    )
    .then((_) => {
      console.log(`teams written with id`);
      res.sendStatus(200);
    })
    .catch((e) => {
      console.log(e);
      res.sendStatus(500);
    });
});

app.post("/media/:discord/:platform/:leagueId/standings", (req, res) => {
  res.sendStatus(200);
});

function stringify(obj) {
  return JSON.stringify(obj);
}

app.post(
  "/media/:discord/:platform/:leagueId/week/:weekType/:weekNum/:dataType",
  (req, res) => {
    const {
      params: { discord, weekType, weekNum, dataType },
    } = req;
    switch (dataType) {
      case "schedules": {
        const { gameScheduleInfoList: schedulesRaw } = req.body;
        if (!schedulesRaw) {
          res.sendStatus(500);
          return;
        }

        const schedules = {};
        schedules[weekType] = {};
        schedules[weekType][`week${weekNum}`] = schedulesRaw.map((game) => ({
          awayTeamId: game.awayTeamId,
          homeTeamId: game.homeTeamId,
          awayScore: game.awayScore,
          homeScore: game.homeScore,
          scheduleId: game.scheduleId,
        }));
        firestore
          .setDoc(
            firestore.doc(db, "media", discord),
            {
              guild_id: discord,
              schedules: schedules,
            },
            { merge: true },
          )
          .then((_) => {
            console.log(`schedule written with id`);
            res.sendStatus(200);
          })
          .catch((e) => {
            console.log(e);
            res.sendStatus(500);
          });
        break;
      }
      case "teamstats": {
        const { teamStatInfoList: teamStats } = req.body;
        if (!teamStats) {
          res.sendStatus(500);
          return;
        }

        const stats = {};
        stats["team-stats"] = teamStats.reduce((s, stat) => {
          s[stat.teamId] = stringify({
            defFumRec: stat.defFumRec,
            defIntsRec: stat.defIntsRec,
            defPtsPerGame: stat.defPtsPerGame,
            defSacks: stat.defSacks,
            off3rdDownConvPct: stat.off3rdDownConvPct,
            off4thDownConvPct: stat.off4thDownConvPct,
            offFumLost: stat.offFumLost,
            offIntsLost: stat.offIntsLost,
            offPassTDs: stat.offPassTDs,
            offPassYds: stat.offPassYds,
            offRedZonePct: stat.offRedZonePct,
            offRushTDs: stat.offRushTDs,
            offRushYds: stat.offRushYds,
            offSacks: stat.offSacks,
            offTotalYds: stat.offTotalYds,
            tODiff: stat.tODiff,
          });
          return s;
        }, {});
        firestore
          .setDoc(
            firestore.doc(db, "media", discord, weekType, `week${weekNum}`),
            {
              ...stats,
            },
            { merge: true },
          )
          .then((_) => {
            console.log(`stats written with id`);
            res.sendStatus(200);
          })
          .catch((e) => {
            console.log(e);
            res.sendStatus(500);
          });

        break;
      }
      case "defense": {
        const { playerDefensiveStatInfoList: defensiveStats } = req.body;
        if (!defensiveStats) {
          res.sendStatus(500);
          return;
        }

        const stats = {};
        stats["player-stats"] = defensiveStats.reduce((s, stat) => {
          s[stat.rosterId] = {
            stats: stringify({
              defForcedFum: stat.defForcedFum,
              defInts: stat.defInts,
              defSacks: stat.defSacks,
              defTDs: stat.defTDs,
              defTotalTackles: stat.defTotalTackles,
            }),
            teamId: stat.teamId,
          };
          return s;
        }, {});
        firestore
          .setDoc(
            firestore.doc(db, "media", discord, weekType, `week${weekNum}`),
            {
              ...stats,
            },
            { merge: true },
          )
          .then((_) => {
            console.log(`stats written with id`);
            res.sendStatus(200);
          })
          .catch((e) => {
            console.log(e);
            res.sendStatus(500);
          });

        break;
      }
      default: {
        const property = `player${capitalizeFirstLetter(dataType)}StatInfoList`;
        const playerStats = req.body[property];
        if (!playerStats) {
          res.sendStatus(500);
          return;
        }

        const stats = {};
        stats["player-stats"] = playerStats.reduce((s, stat) => {
          const recStats = {
            recCatches: stat.recCatches,
            recTDs: stat.recTDs,
            recYds: stat.recYds,
          };
          const passStats = {
            passComp: stat.passComp,
            passAtt: stat.passAtt,
            passInts: stat.passInts,
            passTDs: stat.passTDs,
            passSacks: stat.passSacks,
            passYds: stat.passYds,
          };
          const rushStats = {
            rushFum: stat.rushFum,
            rushTDs: stat.rushTDs,
            rushYds: stat.rushYds,
            rushYdsAfterContact: stat.rushYdsAfterContact,
          };
          const kickerStats = {
            fGMade: stat.fGMade,
            fGAtt: stat.fGAtt,
          };
          const allStats = {
            ...recStats,
            ...passStats,
            ...rushStats,
            ...kickerStats,
          };
          Object.keys(allStats).forEach(
            (key) => allStats[key] === undefined && delete allStats[key],
          );
          s[stat.rosterId] = {
            teamId: stat.teamId,
          };
          s[stat.rosterId][`stats${dataType}`] = stringify(allStats);
          return s;
        }, {});
        firestore
          .setDoc(
            firestore.doc(db, "media", discord, weekType, `week${weekNum}`),
            {
              ...stats,
            },
            { merge: true },
          )
          .then((_) => {
            console.log(`stats written with id`);
            res.sendStatus(200);
          })
          .catch((e) => {
            console.log(e);
            res.sendStatus(500);
          });

        break;
      }
    }
  },
);

// ROSTERS
app.post(
  "/media/:username/:platform/:leagueId/freeagents/roster",
  (req, res) => {
    res.sendStatus(200);
  },
);

app.post(
  "/media/:discord/:platform/:leagueId/team/:teamId/roster",
  (req, res) => {
    const {
      params: { discord, teamId },
    } = req;
    const { rosterInfoList } = req.body;
    if (!rosterInfoList) {
      res.sendStatus(500);
      return;
    }

    let teams = {};
    teams[teamId] = {};
    teams[teamId]["roster"] = rosterInfoList.reduce((s, player) => {
      s[player.rosterId] = {
        name: `${player.firstName} ${player.lastName}`,
        college: player.college,
        position: player.position,
      };
      return s;
    }, {});
    firestore
      .setDoc(
        firestore.doc(db, "media", discord),
        {
          teams: teams,
        },
        { merge: true },
      )
      .then((_) => {
        console.log(`roster written with id`);
        res.sendStatus(200);
      })
      .catch((e) => {
        console.log(e);
        res.sendStatus(500);
      });
  },
);

const TWO_DIGIT_YEAR = "24";
const YEAR = "2024";

const VALID_ENTITLEMENTS = (a) => ({
  xone: `MADDEN_${a}XONE`,
  ps4: `MADDEN_${a}PS4`,
  pc: `MADDEN_${a}PC`,
  ps5: `MADDEN_${a}PS5`,
  xbsx: `MADDEN_${a}XBSX`,
  stadia: `MADDEN_${a}SDA`,
});

const ENTITLEMENT_TO_SYSTEM = (a) => ({
  [`MADDEN_${a}XONE`]: "xone",
  [`MADDEN_${a}PS4`]: "ps4",
  [`MADDEN_${a}PC`]: "pc",
  [`MADDEN_${a}PS5`]: "ps5",
  [`MADDEN_${a}XBSX`]: "xbsx",
  [`MADDEN_${a}SDA`]: "stadia",
});

const BLAZE_SERVICE = (a) => ({
  xone: `madden-${a}-xone-gen4`,
  ps4: `madden-${a}-ps4-gen4`,
  pc: `madden-${a}-pc-gen5`,
  ps5: `madden-${a}-ps5-gen5`,
  xbsx: `madden-${a}-xbsx-gen5`,
  stadia: `madden-${a}-stadia-gen5`,
});
const BLAZE_PRODUCT_NAME = (a) => ({
  xone: `madden-${a}-xone-mca`,
  ps4: `madden-${a}-ps4-mca`,
  pc: `madden-${a}-pc-mca`,
  ps5: `madden-${a}-ps5-mca`,
  xbsx: `madden-${a}-xbsx-mca`,
  stadia: `madden-${a}-stadia-mca`,
});

async function refreshToken(guild_id) {
  const docSnap = await firestore.getDoc(
    firestore.doc(db, "leagues", guild_id),
  );
  if (!docSnap.exists()) {
    throw new Error(`No league found for ${guild_id}, export in MCA first`);
  }
  const league = docSnap.data();
  const tokenInfo = league.madden_server;
  const now = new Date();
  console.log(tokenInfo);
  if (tokenInfo.accessToken && now > tokenInfo.expiry) {
    //refresh token
    const res1 = await fetch(`https://accounts.ea.com/connect/token`, {
      method: "POST",
      headers: {
        "Accept-Charset": "UTF-8",
        "User-Agent":
          "Dalvik/2.1.0 (Linux; U; Android 13; sdk_gphone_x86_64 Build/TE1A.220922.031)",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Accept-Encoding": "gzip",
      },
      body: `grant_type=refresh_token&client_id=MaddenCompanionApp19&client_secret=U02zL2khwlgFdODLWCyLPmccOc5EiPBBYcEwCqKDTWBrZj2Fwcx4b4Zd9rsA6lHLkIU4qlVvNh84olij&release_type=prod&refresh_token=${tokenInfo.refreshToken}}&authentication_source=317239&token_format=JWS`,
    });
    const res1Json = await res1.json();
    console.log(res1Json);
    const {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expiresIn,
    } = res1Json;
    const expiry = new Date(new Date().getTime() + expiresIn * 1000);
    await firestore.setDoc(
      firestore.doc(db, "leagues", guild_id),
      {
        madden_server: {
          accessToken,
          refreshToken,
          expiry,
        },
      },
      { merge: true },
    );
  }
}

const BLAZE_SESSION_EXPIRY = 1140;

async function getBlazeSession(guild_id) {
  const docSnap = await firestore.getDoc(
    firestore.doc(db, "leagues", guild_id),
  );
  if (!docSnap.exists()) {
    throw new Error(`No league found for ${guild_id}, export in MCA first`);
  }

  const league = docSnap.data();
  const tokenInfo = league.madden_server;
  const now = new Date();
  if (
    !tokenInfo.sessionKey ||
    (tokenInfo.blazeExpiry && now > tokenInfo.blazeExpiry)
  ) {
    const res1 = await fetch(
      `https://wal2.tools.gos.bio-iad.ea.com/wal/authentication/login`,
      {
        // EA is on legacy SSL SMH LMAO ALSO
        dispatcher: new Agent({
          connect: {
            rejectUnauthorized: false,
            secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
          },
        }),
        method: "POST",
        headers: {
          "Accept-Charset": "UTF-8",
          Accept: "application/json",
          "X-BLAZE-ID": tokenInfo.blazeService,
          "X-BLAZE-VOID-RESP": "XML",
          "X-Application-Key": "MADDEN-MCA",
          "Content-Type": "application/json",
          "User-Agent":
            "Dalvik/2.1.0 (Linux; U; Android 13; sdk_gphone_x86_64 Build/TE1A.220922.031)",
        },
        body: JSON.stringify({
          accessToken: tokenInfo.accessToken,
          productName: tokenInfo.blazeProductName,
        }),
      },
    );
    const res1Json = await res1.json();
    const {
      userLoginInfo: {
        sessionKey,
        personaDetails: { personaId: blazeId },
      },
    } = res1Json;
    tokenInfo.sessionKey = sessionKey;
    const blazeExpiry = new Date(
      new Date().getTime() + BLAZE_SESSION_EXPIRY * 1000,
    );
    tokenInfo.blazeSessionExpiry = blazeExpiry;
    tokenInfo.blazeId = blazeId;
    console.log(tokenInfo);
    await firestore.setDoc(
      firestore.doc(db, "leagues", guild_id),
      {
        madden_server: tokenInfo,
      },
      { merge: true },
    );
  }
}

function calculateMessageAuthData(blazeId, requestId) {
  const rand4bytes = crypto.randomBytes(4);
  const requestData = JSON.stringify({
    staticData: "05e6a7ead5584ab4",
    requestId: requestId,
    blazeId: blazeId,
  });
  const staticBytes = buffer.Buffer.from(
    "634203362017bf72f70ba900c0aa4e6b",
    "hex",
  );

  const xorHash = crypto
    .createHash("md5")
    .update(rand4bytes)
    .update(staticBytes)
    .digest();
  const requestBuffer = buffer.Buffer.from(requestData, "utf-8");
  const scrambledBytes = requestBuffer.map((b, i) => b ^ xorHash[i % 16]);
  const authDataBytes = buffer.Buffer.concat([rand4bytes, scrambledBytes]);
  const staticAuthCode = buffer.Buffer.from(
    "3a53413521464c3b6531326530705b70203a2900",
    "hex",
  );

  const authCode = crypto
    .createHash("md5")
    .update(staticAuthCode)
    .update(authDataBytes)
    .digest("base64");
  const authData = authDataBytes.toString("base64");
  const authType = 17039361;
  return { authData, authCode, authType };
}

async function makeBlazeRequest(guild_id, blazeRequest) {
  const docSnap = await firestore.getDoc(
    firestore.doc(db, "leagues", guild_id),
  );
  if (!docSnap.exists()) {
    throw new Error(`No league found for ${guild_id}, export in MCA first`);
  }

  const league = docSnap.data();
  const tokenInfo = league.madden_server;
  if (!tokenInfo.sessionKey) {
    throw new Error("no session key");
  }
  const requestId = tokenInfo.blazeRequestId || 1;
  const authData = calculateMessageAuthData(tokenInfo.blazeId, requestId);
  blazeRequest.messageAuthData = authData;
  // const messageExpiration = Math.floor(new Date().getTime() / 1000);
  // blazeRequest.messageExpirationTime = messageExpiration;
  // blazeRequest.deviceId = "MCA4b35d75Vm-MCA";
  // blazeRequest.ipAddress = "127.0.0.1";
  const body = JSON.stringify({
    apiVersion: 2,
    clientDevice: 3,
    requestInfo: JSON.stringify(blazeRequest),
  });
  console.log(body);
  const res1 = await fetch(
    `https://wal2.tools.gos.bio-iad.ea.com/wal/mca/Process/${tokenInfo.sessionKey}`,
    {
      // EA is on legacy SSL SMH LMAO ALSO
      dispatcher: new Agent({
        connect: {
          rejectUnauthorized: false,
          secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
        },
      }),
      method: "POST",
      headers: {
        "Accept-Charset": "UTF-8",
        Accept: "application/json",
        "X-BLAZE-ID": tokenInfo.blazeService,
        "X-BLAZE-VOID-RESP": "XML",
        "X-Application-Key": "MADDEN-MCA",
        "Content-Type": "application/json",
        "User-Agent":
          "Dalvik/2.1.0 (Linux; U; Android 13; sdk_gphone_x86_64 Build/TE1A.220922.031)",
      },
      body: body,
    },
  );
  tokenInfo.blazeRequestId = requestId + 1;
  await firestore.setDoc(
    firestore.doc(db, "leagues", guild_id),
    {
      madden_server: tokenInfo,
    },
    { merge: true },
  );
  const txtResponse = await res1.text();
  try {
    return JSON.parse(txtResponse);
  } catch (e) {
    console.log(txtResponse);
    throw new Error("failed blaze request");
  }
}

app.post("/:discord/linkea", async (req, res, next) => {
  const {
    params: { discord },
  } = req;
  const { persona, token, gameConsole } = req.body;
  const consoleAbbr = ENTITLEMENT_TO_SYSTEM(TWO_DIGIT_YEAR)[gameConsole];
  console.log(req.body);
  try {
    const locationUrl = await fetch(
      `https://accounts.ea.com/connect/auth?hide_create=true&release_type=prod&response_type=code&redirect_uri=http://127.0.0.1/success&client_id=MaddenCompanionApp19&machineProfileKey=MCA4b35d75Vm-MCA&authentication_source=317239&access_token=${token}&persona_id=${persona.personaId}&persona_namespace=${persona.namespaceName}`,
      {
        redirect: "manual",
        headers: {
          "Upgrade-Insecure-Requests": "1",

          "User-Agent":
            "Mozilla/5.0 (Linux; Android 13; sdk_gphone_x86_64 Build/TE1A.220922.031; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/103.0.5060.71 Mobile Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
          "X-Requested-With": "com.ea.gp.madden19companionapp",
          "Sec-Fetc-Site": "none",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-User": "?1",
          "Sec-Fetch-Dest": "document",
          "Accept-Encoding": "gzip, deflate",
          "Accept-Language": "en-US,en;q=0,9",
        },
      },
    )
      .then((res5) => {
        return res5.headers.get("Location");
      })
      .catch(console.warn);

    console.log(locationUrl);
    const code = new URLSearchParams(
      locationUrl.replace("http://127.0.0.1/success", ""),
    ).get("code");
    console.log(code);
    const res1 = await fetch(`https://accounts.ea.com/connect/token`, {
      method: "POST",
      headers: {
        "Accept-Charset": "UTF-8",
        "User-Agent":
          "Dalvik/2.1.0 (Linux; U; Android 13; sdk_gphone_x86_64 Build/TE1A.220922.031)",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Accept-Encoding": "gzip",
      },
      body: `authentication_source=317239&code=${code}&grant_type=authorization_code&token_format=JWS&release_type=prod&client_secret=U02zL2khwlgFdODLWCyLPmccOc5EiPBBYcEwCqKDTWBrZj2Fwcx4b4Zd9rsA6lHLkIU4qlVvNh84olij&redirect_uri=http://127.0.0.1/success&client_id=MaddenCompanionApp19`,
    });
    const res1Json = await res1.json();
    console.log(res1Json);
    const {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expiresIn,
    } = res1Json;
    const expiry = new Date(new Date().getTime() + expiresIn * 1000);
    const blazeService = BLAZE_SERVICE(YEAR)[consoleAbbr];
    const blazeProductName = BLAZE_PRODUCT_NAME(YEAR)[consoleAbbr];

    await firestore.setDoc(
      firestore.doc(db, "leagues", discord),
      {
        madden_server: {
          accessToken,
          refreshToken,
          expiry,
          blazeService,
          blazeProductName,
        },
      },
      { merge: true },
    );
    res.status(200).json({});
  } catch (e) {
    next(e);
  }
});

app.post("/:discord/getleagues", async (req, res, next) => {
  const {
    params: { discord },
  } = req;
  try {
    await refreshToken(discord);
    await getBlazeSession(discord);
    const messageExpiration = Math.floor(new Date().getTime() / 1000);
    const leagueResponse = await makeBlazeRequest(discord, {
      messsageExpirationTime: messageExpiration,
      deviceId: "MCA4b35d75Vm-MCA",
      commandName: "Mobile_GetMyLeagues",
      componentId: 2060,
      commandId: 801,
      ipAddress: "127.0.0.1",
      requestPayload: "{}",
      componentName: "careermode",
    });
    console.log(leagueResponse);
    const {
      responseInfo: {
        value: { leagues: maddenLeagues },
      },
    } = leagueResponse;
    const slimmedLeagues = maddenLeagues.map((m) => ({
      leagueId: m.leagueId,
      leagueName: m.leagueName,
      userTeamName: m.userTeamName,
    }));
    res.status(200).json(slimmedLeagues);
  } catch (e) {
    next(e);
  }
});

app.listen(app.get("port"), () =>
  console.log("Madden Data is running on port", app.get("port")),
);
