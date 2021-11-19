import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { tick } from '@angular/core/testing';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import { HandGestureService } from './hand-gesture.service';
import { EmojiList } from './emojis';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  @ViewChild('video') video: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('home') homeLink!: ElementRef<HTMLAnchorElement>;
  @ViewChild('about') aboutLink!: ElementRef<HTMLAnchorElement>;

  videoLoadComplete: boolean = false;
  activeEmoji: string = null;

  emoji$ = this._recognizer.gesture$.subscribe(_val => {
    if(_val && (_val !== this.activeEmoji) && EmojiList[_val]) {
      this.activeEmoji = EmojiList[_val];
    } else {
      console.log(_val);
    }
  });
  
  constructor(private _recognizer: HandGestureService) {
    // this._recognizer.gesture$
    //   .pipe(
    //     filter((value) => value === 'ok'),
    //     withLatestFrom(this.selection$)
    //   )
    //   .subscribe(([_, page]) => {console.log(page)});
  }

  get stream(): MediaStream {
    return this._recognizer.stream;
  }

  ngAfterViewInit(): void {
    tick;
    this.loadData();
  }

  loadData() {
    this._recognizer.initialize(
      this.canvas.nativeElement,
      this.video.nativeElement
    );
  }

  videoLoaded() {
    if(this.videoLoadComplete) {
      return;
    }
    this.loadData();
    this.videoLoadComplete = true;
  }

  ngOnDestroy() {
    this.video.nativeElement.remove();
  }
}