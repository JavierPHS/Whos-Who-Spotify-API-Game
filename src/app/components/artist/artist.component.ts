import { Component, EventEmitter, Input, OnInit, Output, ElementRef } from '@angular/core';

@Component({
  selector: 'app-artist',
  templateUrl: './artist.component.html',
  styleUrls: ['./artist.component.css']
})
export class ArtistComponent implements OnInit {

  @Input() track: any;
  @Input() correctArtistTrack: any;
  @Input() artistImg: string = "";

  artistName: string = "";
  answer: boolean = false;

  @Input() gameOver: boolean = false;

  @Output() artistChoice: EventEmitter<any> = new EventEmitter();

  handleChoice() {
    if (this.correctArtistTrack.artists[0].name === this.track.artists[0].name) {
      console.log("CORRECT CHOICE");
      this.correctChoice();
      this.answer = true;
    } else {
      console.log("WRONG CHOICE");
      this.wrongChoice();
    }
    this.artistChoice.emit(this.answer);
  }
  

  constructor(private elementRef: ElementRef) { }

  ngOnInit(): void {
    const artist = this.track.artists[0];
    if (artist && artist.name) {
      this.artistName = artist.name;
    }
  }

  correctChoice() {
    const labelElement = this.elementRef.nativeElement.querySelector(`#artistButton`);
    if (labelElement) {
      labelElement.style.setProperty('background-color', '#177100');
    }
  }

  wrongChoice() {
    const labelElement = this.elementRef.nativeElement.querySelector(`#artistButton`);
    if (labelElement) {
      labelElement.style.setProperty('background-color', '#920000');
    }
  }
}
