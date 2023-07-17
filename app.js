const firebaseapp = require("firebase/app");
const firestore = require("firebase/firestore");

const express = require("express");

const app = express();

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
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", () => {
    const { leagueTeamInfoList: teamsData } = JSON.parse(body);
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
        })
    );
    firestore
      .setDoc(
        firestore.doc(db, "leagues", discord),
        {
          guild_id: discord,
          teams: teams,
        },
        { merge: true }
      )
      .then((_) => {
        console.log(`teams written with id`);
        res.sendStatus(200);
      })
      .catch(console.error);
  });
});

app.post("/:discord/:platform/:leagueId/standings", (req, res) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", () => {
    res.sendStatus(200);
  });
});

app.post(
  "/:discord/:platform/:leagueId/week/:weekType/:weekNum/:dataType",
  (req, res) => {
    const {
      params: { discord, weekType, weekNum, dataType },
    } = req;
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      switch (dataType) {
        case "schedules": {
          const { gameScheduleInfoList: schedulesRaw } = JSON.parse(body);
          const schedules = {};
          schedules[weekType] = {};
          schedules[weekType][`week${weekNum}`] = schedulesRaw.map((game) => ({
            awayTeamId: game.awayTeamId,
            homeTeamId: game.homeTeamId,
            awayScore: game.awayScore,
            homeScore: game.homeScore,
	    scheduleId: game.scheduleId
          }));
          firestore
            .setDoc(
              firestore.doc(db, "leagues", discord),
              {
                guild_id: discord,
                schedules: schedules,
              },
              { merge: true }
            )
            .then((_) => {
              console.log(`schedule written with id`);
              res.sendStatus(200);
            })
            .catch(console.error);
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
    });
  }
);

// ROSTERS
app.post("/:username/:platform/:leagueId/freeagents/roster", (req, res) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", () => {
    res.sendStatus(200);
  });
});

app.post("/:username/:platform/:leagueId/team/:teamId/roster", (req, res) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", () => {
    res.sendStatus(200);
  });
});

//media
app.post("/media/:discord/:platform/:leagueId/leagueteams", (req, res) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", () => {
    const { leagueTeamInfoList: teamsData } = JSON.parse(body);
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
        })
    );
    firestore
      .setDoc(
        firestore.doc(db, "media", discord),
        {
          guild_id: discord,
          teams: teams,
        },
        { merge: true }
      )
      .then((_) => {
        console.log(`teams written with id`);
        res.sendStatus(200);
      })
      .catch(console.error);
  });
});

app.post("/media/:discord/:platform/:leagueId/standings", (req, res) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", () => {
    res.sendStatus(200);
  });
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
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      switch (dataType) {
        case "schedules": {
          const { gameScheduleInfoList: schedulesRaw } = JSON.parse(body);
          const schedules = {};
          schedules[weekType] = {};
          schedules[weekType][`week${weekNum}`] = schedulesRaw.map((game) => ({
            awayTeamId: game.awayTeamId,
            homeTeamId: game.homeTeamId,
            awayScore: game.awayScore,
            homeScore: game.homeScore,
	    scheduleId: game.scheduleId
          }));
          firestore
            .setDoc(
              firestore.doc(db, "media", discord),
              {
                schedules: schedules,
              },
              { merge: true }
            )
            .then((_) => {
              console.log(`schedule written with id`);
              res.sendStatus(200);
            })
            .catch(console.error);
          break;
        }
        case "teamstats": {
          const { teamStatInfoList: teamStats } = JSON.parse(body);
          const stats = {};
          stats[weekType] = {};
          stats[weekType][`week${weekNum}`] = {};
          stats[weekType][`week${weekNum}`]["team-stats"] = teamStats.reduce(
            (s, stat) => {
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
            },
            {}
          );
          firestore
            .setDoc(
              firestore.doc(db, "media", discord),
              {
                stats: stats,
              },
              { merge: true }
            )
            .then((_) => {
              console.log(`stats written with id`);
              res.sendStatus(200);
            })
            .catch(console.error);
          break;
        }
        case "defense": {
          const { playerDefensiveStatInfoList: defensiveStats } =
            JSON.parse(body);
          const stats = {};
          stats[weekType] = {};
          stats[weekType][`week${weekNum}`] = {};
          stats[weekType][`week${weekNum}`]["player-stats"] =
            defensiveStats.reduce((s, stat) => {
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
              firestore.doc(db, "media", discord),
              {
                stats: stats,
              },
              { merge: true }
            )
            .then((_) => {
              console.log(`stats written with id`);
              res.sendStatus(200);
            })
            .catch(console.error);
          break;
        }
        default: {
          const property = `player${capitalizeFirstLetter(
            dataType
          )}StatInfoList`;
          const playerStats = JSON.parse(body)[property];
          const stats = {};
          stats[weekType] = {};
          stats[weekType][`week${weekNum}`] = {};
          stats[weekType][`week${weekNum}`]["player-stats"] =
            playerStats.reduce((s, stat) => {
              const recStats = {
                recCatches: stat.recCatches,
                recTDs: stat.recTDs,
                recYds: stat.recYds,
              };
              const passStats = {
                passCompPct: stat.passCompPct,
                passInts: stat.passInts,
                passTDs: stat.passTDs,
                passSacks: stat.passSacks,
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
                (key) => allStats[key] === undefined && delete allStats[key]
              );
              s[stat.rosterId] = {
                stats: stringify(allStats),
                teamId: stat.teamId,
              };
              return s;
            }, {});
          firestore
            .setDoc(
              firestore.doc(db, "media", discord),
              {
                stats: stats,
              },
              { merge: true }
            )
            .then((_) => {
              console.log(`stats written with id`);
              res.sendStatus(200);
            })
            .catch(console.error);
          break;
        }
      }
    });
  }
);

// ROSTERS
app.post(
  "/media/:username/:platform/:leagueId/freeagents/roster",
  (req, res) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      res.sendStatus(200);
    });
  }
);

app.post(
  "/media/:discord/:platform/:leagueId/team/:teamId/roster",
  (req, res) => {
    const {
      params: { discord, teamId },
    } = req;
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      const { rosterInfoList } = JSON.parse(body);
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
          { merge: true }
        )
        .then((_) => {
          console.log(`roster written with id`);
          res.sendStatus(200);
        })
        .catch(console.error);
    });
  }
);

app.listen(app.get("port"), () =>
  console.log("Madden Data is running on port", app.get("port"))
);
