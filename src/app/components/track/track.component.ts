import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-track',
  templateUrl: './track.component.html',
  styleUrls: ['./track.component.css']
})
export class TrackComponent implements OnInit {

  @Input() track: any;
  audioUrl: SafeUrl = '';
  
  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    const track = this.track;
  if (track && track.preview_url) {
    this.audioUrl = this.sanitizer.bypassSecurityTrustUrl(track.preview_url);
    console.log(track);
  }
  }

}
