const firebaseapp = require('firebase/app');
const firestore = require('firebase/firestore');


const express = require('express');

const app = express();


const firebaseConfig = {
    apiKey: "AIzaSyDf9ZiTBWf-sWY007WsKktMPewcrs07CWw",
    authDomain: "championslounge-f0f36.firebaseapp.com",
    projectId: "championslounge-f0f36",
    storageBucket: "championslounge-f0f36.appspot.com",
    messagingSenderId: "163156624093",
    appId: "1:163156624093:web:dfe860c8bb38a62b075134"
};
  

// Initialize Firebase
const fapp = firebaseapp.initializeApp(firebaseConfig);


// Initialize Cloud Firestore and get a reference to the service
const db = firestore.getFirestore(fapp);

app.set('port', (process.env.PORT || 3001));

app.get('*', (req, res) => {
    res.send('Madden Companion Exporter');
});

app.post('/:discord/:platform/:leagueId/leagueteams', (req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        const { leagueTeamInfoList: teamsData } = JSON.parse(body)
        let teams = {}
        const {params: { discord }} = req;
        teamsData.forEach(t => teams[t.teamId] = {teamName: t.displayName, abbr: t.abbrName, username: t.userName, division: t.divName, cityName: t.cityName});
        firestore.setDoc(firestore.doc(db, "leagues", discord), {
            guild_id: discord,
            teams: teams,
        }, { merge: true }).then((_) => {
            console.log(`teams written with id`);
            res.sendStatus(200);
        }).catch(console.error);
        
    });
});

app.post('/:discord/:platform/:leagueId/standings', (req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        res.sendStatus(200);
    });
});

app.post(
    '/:discord/:platform/:leagueId/week/:weekType/:weekNum/:dataType',
    (req, res) => {
        const {
            params: { discord, weekType, weekNum, dataType },
        } = req;
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            switch (dataType) {
                case 'schedules': {
                    const { gameScheduleInfoList: schedulesRaw } = JSON.parse(body);
                    const schedules = {};
                    schedules[weekType] = {};
                    schedules[weekType][`week${weekNum}`] = schedulesRaw.map(game => ({awayTeamId: game.awayTeamId, homeTeamId: game.homeTeamId, awayScore: game.awayScore, homeScore: game.homeScore}))
                    firestore.setDoc(firestore.doc(db, "leagues", discord), {
                        guild_id: discord,
                        schedules: schedules,
                    }, { merge: true }).then((_) => {
                        console.log(`schedule written with id`);
                        res.sendStatus(200);
                    }).catch(console.error);
                }
                case 'teamstats': {
                    res.sendStatus(200);
                    break;
                }
                case 'defense': {
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
app.post('/:username/:platform/:leagueId/freeagents/roster', (req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        res.sendStatus(200);
    });    
});

app.post('/:username/:platform/:leagueId/team/:teamId/roster', (req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        res.sendStatus(200);
    });
});

app.listen(app.get('port'), () =>
    console.log('Madden Data is running on port', app.get('port'))
);
