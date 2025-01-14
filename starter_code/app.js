const express = require('express');
const hbs = require('hbs');
const bodyParser = require('body-parser');
// require spotify-web-api-node package here:
const SpotifyWebApi = require('spotify-web-api-node');

require('dotenv').config();

const app = express();

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));


// setting the spotify-api goes here:
const clientId = process.env.API_CLIENT;
const clientSecret = process.env.API_SECRET;

const spotifyApi = new SpotifyWebApi({
    clientId: clientId,
    clientSecret: clientSecret
});

// Retrieve an access token
spotifyApi.clientCredentialsGrant()
    .then(data => {
        spotifyApi.setAccessToken(data.body['access_token']);
    })
    .catch(error => {
        console.log('Something went wrong when retrieving an access token', error);
    })



// the routes go here:
app.get('/', (req, res) => {
    res.render('index')
})

app.post('/artists', (req, res) => {
    spotifyApi.searchArtists(req.body.artist)
        .then(data => {
            let artist = data.body.artists.items;
            // console.log("The received data from the API: ", data.body.artists.items);
            res.render('artists', { artists: data.body.artists.items })
                // ----> 'HERE WHAT WE WANT TO DO AFTER RECEIVING THE DATA FROM THE API'
        })
        .catch(err => {
            console.log("The error while searching artists occurred: ", err);
        })
})

app.get('/albums/:artistId', (req, res, next) => {
    spotifyApi.getArtistAlbums(req.params.artistId).then(
        function(data) {
            res.render('albums', { albums: data.body.items })
        },
        function(err) {
            console.error(err);
        }
    );
});

app.get('/tracks/:trackId', (req, res, next) => {
    spotifyApi.getAlbumTracks(req.params.trackId, { limit: 5, offset: 1 })
        .then(function(data) {
            console.log(data.body);
            res.render('tracks', { tracks: data.body.items })
        }, function(err) {
            console.log('Something went wrong!', err);
        });
});


app.listen(3000, () => console.log("My Spotify project running on port 3000 🎧 🥁 🎸 🔊"));