import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import fetchFromSpotify, { request } from '../../services/api';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { shuffle } from 'lodash';

const AUTH_ENDPOINT = 'https://nuod0t2zoe.execute-api.us-east-2.amazonaws.com/FT-Classroom/spotify-auth-token';
const TOKEN_KEY = 'whos-who-access-token';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  selectedGenre: string = '';
  selectedArtists: number = 0;
  selectedSongs: number = 0;
  track: any;
  artistChoices: any[] = [];
  trackList: any[] = [];
  imageList: any[] = [];
  authLoading: boolean = false;
  configLoading: boolean = false;
  songLoading: boolean = false;
  token: String = "";
  audioUrl: SafeUrl = '';

  incorrectGuesses: number = 0;
  gameOver: boolean = false;

  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.authLoading = true;
    const storedTokenString = localStorage.getItem(TOKEN_KEY);
    if (storedTokenString) {
      const storedToken = JSON.parse(storedTokenString);
      if (storedToken.expiration > Date.now()) {
        console.log('Token found in localstorage');
        this.authLoading = false;
        this.token = storedToken.value;
        this.route.queryParams.subscribe((params) => {
          this.selectedGenre = params['genre'];
          this.selectedArtists = params['numArtists'];
          this.selectedSongs = params['numSongs'];
           this.loadRandomTrack();
        });
        return;
      }
    }
    console.log('Sending request to AWS endpoint');
    request(AUTH_ENDPOINT).then(({ access_token, expires_in }) => {
      const newToken = {
        value: access_token,
        expiration: Date.now() + (expires_in - 20) * 1000,
      };
      localStorage.setItem(TOKEN_KEY, JSON.stringify(newToken));
      this.authLoading = false;
      this.token = newToken.value;
      this.route.queryParams.subscribe((params) => {
        this.selectedGenre = params['genre'];
        this.selectedArtists = params['numArtists'];
        this.selectedSongs = params['numSongs'];
         this.loadRandomTrack();
      });
    });
  }

  async loadRandomTrack(): Promise<void> {
    try {
      let track = null;
      let randomTracks = null;
      while (!track || !track.preview_url) {
        this.songLoading = true;
        const response = await fetchFromSpotify({
          token: this.token,
          endpoint: 'recommendations',
          params: {
            seed_genres: this.selectedGenre,
            limit: 20,
          },
        });
        this.songLoading = false;
        if (response.tracks.length > 0) {
          track = response.tracks[0];
          randomTracks = response.tracks;
        } else {
          console.log('No tracks found.');
          return;
        }
      }
      if (this.selectedSongs > 1 && track.artists[0].id) {
        await this.getSimilarTracks(track);
      }
      this.track = track;
      this.getRandomTracks(randomTracks);
      this.audioUrl = this.sanitizer.bypassSecurityTrustUrl(track.preview_url);
    } catch (error) {
      console.error('Error loading random track:', error);
    }
  }

  async getSimilarTracks(track: any) {
    try {
      const nameList: any[] = [];
      this.trackList.push(track);
      nameList.push(track.name);

      const artistID = track.artists[0].id;
      const artistResponse = await fetchFromSpotify({
        token: this.token,
        endpoint: `artists/${artistID}/top-tracks`,
        params: {
          market: 'US'
        }
      });
      const tracks = artistResponse.tracks;
      if (tracks.length > 0) {
        for (let currentTrack of tracks) {
          if (this.trackList.length >= this.selectedSongs) {
            break;
          }
          if (!nameList.includes(currentTrack.name)) {
            this.trackList.push(currentTrack);
            nameList.push(currentTrack.name);
          }
        }
      }
    } catch (error) {
      console.error('Error getting similar tracks:', error);
    }
  }

  getRandomTracks(randomTracks: any[]) {
    for (let element of randomTracks) {
      if (this.artistChoices.length >= this.selectedArtists) {
        this.artistChoices = shuffle(this.artistChoices);
        this.getArtistImages();
        break;
      }
      const artist = element.artists[0];
      let exists = false;
      this.artistChoices.forEach( (track: any) => {
        if (artist && artist.name && artist.name === track.name) {
          exists = true;
          return;
        }
      })
      if (!exists) {
        this.artistChoices.push(element);
      }
    }
  }

  async getArtistImages() {
    try {
      const artistIds: any[] = [];
      this.artistChoices.forEach( (artist: any) => {
        artistIds.push(artist.artists[0].id);
      })
      const url = artistIds.join();
      const artistResponse = await fetchFromSpotify({
        token: this.token,
        endpoint: `artists/`,
        params: {
          ids: url},
      });
      if (artistResponse.artists) {
        artistResponse.artists.forEach( (image: any) => {
          if (image.images[0].url) {
            this.imageList.push(image.images[0].url)
          } else {
            this.imageList.push("");
          }
        })
      }
    } catch (error) {
      console.error('Error getting images:', error);
    }
  }

  handleChoice(choice: boolean) {
    const temp = document.getElementById("result");
    if (choice && temp) {
      temp.textContent = "You Win!";
      this.gameOver = true;
    } else if (!choice && temp) {
      temp.textContent = "INCORRECT";
      this.incorrectGuesses++;
      if (this.incorrectGuesses >= this.selectedArtists - 1) {
        temp.textContent = "You Lose!";
        this.gameOver = true;
      }
    }
  }

  reloadPage() {
    window.location.reload();
  }
}