import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";

import { AppComponent } from "./app.component";
import { HomeComponent } from "./home/home.component";
import { GameComponent } from './game/game.component';
import { TrackComponent } from './components/track/track.component';
import { ArtistComponent } from './components/artist/artist.component';

const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "game", component: GameComponent },
];

@NgModule({
  declarations: [AppComponent, HomeComponent, GameComponent, TrackComponent, ArtistComponent],
  imports: [BrowserModule, FormsModule, RouterModule.forRoot(routes)],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
