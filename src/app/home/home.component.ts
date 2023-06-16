import { Component, OnInit } from "@angular/core";
import fetchFromSpotify, { request } from "../../services/api";
import { Router } from '@angular/router';

const AUTH_ENDPOINT =
  "https://nuod0t2zoe.execute-api.us-east-2.amazonaws.com/FT-Classroom/spotify-auth-token";
const TOKEN_KEY = "whos-who-access-token";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit {

  genres: String[] = ["House", "Alternative", "J-Rock", "R&B"];
  selectedGenre: String = "";
  selectedNumberOfSongs: number = 1;
  selectedNumberOfArtists: number = 2;
  authLoading: boolean = false;
  configLoading: boolean = false;
  token: String = "";

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.authLoading = true;
    const storedTokenString = localStorage.getItem(TOKEN_KEY);
    const storedGenre = localStorage.getItem('selectedGenre');
    const storedNumArtists = localStorage.getItem('selectedNumberOfArtists');
    const storedNumSongs = localStorage.getItem('selectedNumberOfSongs');
  
    if(storedNumSongs){
      this.selectedNumberOfSongs = parseInt(storedNumSongs);
    }
    if (storedNumArtists) {
      this.selectedNumberOfArtists = parseInt(storedNumArtists);
    }
    if (storedGenre) {
      this.selectedGenre = storedGenre;
    }
    if (storedTokenString) {
      const storedToken = JSON.parse(storedTokenString);
      if (storedToken.expiration > Date.now()) {
        console.log("Token found in localstorage");
        this.authLoading = false;
        this.token = storedToken.value;
        this.loadGenres(storedToken.value);
        return;
      }
    }
    console.log("Sending request to AWS endpoint");
    request(AUTH_ENDPOINT).then(({ access_token, expires_in }) => {
      const newToken = {
        value: access_token,
        expiration: Date.now() + (expires_in - 20) * 1000,
      };
      localStorage.setItem(TOKEN_KEY, JSON.stringify(newToken));
      this.authLoading = false;
      this.token = newToken.value;
      this.loadGenres(newToken.value);
    });
  }

  loadGenres = async (t: any) => {
    this.configLoading = true;
    const response = await fetchFromSpotify({
      token: t,
      endpoint: "recommendations/available-genre-seeds",
    });
    console.log(response);
    this.genres = response.genres;
    this.configLoading = false;
  };

  setNumberOfArtists(selectedNumArtists: number) {
    this.selectedNumberOfArtists = selectedNumArtists;
    localStorage.setItem('selectedNumberOfArtists', selectedNumArtists.toString());
  }
  
  setNumberOfSongs(selectedSongs: number){
    this.selectedNumberOfSongs = selectedSongs;
    localStorage.setItem('selectedNumberOfSongs', selectedSongs.toString());
  }

  setGenre(selectedGenre: any) {
    this.selectedGenre = selectedGenre;
    localStorage.setItem('selectedGenre', selectedGenre);
    console.log(this.selectedGenre);
  }

  startGame() {
    if (this.selectedGenre) {
      this.router.navigate(['/game'], {
        queryParams: {
          genre: this.selectedGenre,
          numSongs: this.selectedNumberOfSongs,
          numArtists: this.selectedNumberOfArtists
        }
      });
    }
  }
  
}
