const express = require("express");
const fetch = require('node-fetch');
const redis = require('redis');
const app = express()
const port = process.env.PORT || 5000;

const REDIS_PORT = process.env.REDIS_PORT || 6379;

const client = redis.createClient(REDIS_PORT);


app.get('/repos/:username', cache, getRepos);

// middleware function for fetching api

async function getRepos(req, res, next) {
    try {
        console.log("fetching data");

        const { username } = req.params;

        const response = await fetch(`https://api.github.com/users/${username}`);

        const data = await response.json();

        const public_repos = data.public_repos;

        // add this for catching

        client.setex(username, 36000, public_repos)


        res.send(setResponse(username, public_repos));



    } catch (err) {
        console.log(err)
    }
}

function setResponse(username, public_repos) {
    return `<h2> ${username} has ${public_repos} Gituhub repo`
}

function cache(req, res, next) {
    const { username } = req.params;
    client.get(username, (err, data) => {
        if (err) throw err;

        if (data != null) {
            res.send(setResponse(username, data))
        }
        else {
            next();  //next middleware function 
        }
    })
}



app.listen(port, () => {
    console.log(`listening to port ${port}`)
})



