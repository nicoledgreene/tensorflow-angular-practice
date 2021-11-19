import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as handpose from '@tensorflow-models/handpose';

import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
import { drawKeypoints } from './hand-renderer';
import { GE } from './fingere-gesture';

interface GestureMapInterface {
  [key: string]: Gesture
}

const GestureMap: GestureMapInterface = {
  thumbs_up: 'thumbs_up',
  victory: 'victory',
  thumbs_down: 'thumbs_down',
  high_five: 'high_five'
};

type Gesture =  'victory' | 'thumbs_up' | 'thumbs_down' | 'none' | 'high_five';
type Size = [number, number];
type Point = [number, number];
type Rect = { topLeft: [number, number]; bottomRight: [number, number] };

@Injectable({
  providedIn: 'root',
})
export class HandGestureService {

  private _gesture$ = new BehaviorSubject<Gesture>('none');
  readonly gesture$ = this._gesture$.asObservable();

  private _stream!: MediaStream;
  private _dimensions!: Size;
  private _lastGesture!: any;

  get stream(): MediaStream {
    return this._stream;
  }

  initialize(canvas: HTMLCanvasElement, video: HTMLVideoElement): void {
    this._dimensions = [video.width, video.height];
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        this._stream = stream;
        return handpose.load();
      })
      .then((model) => {
        const context = canvas.getContext('2d');
        context?.clearRect(0, 0, video.width, video.height);
        if(context) {
          context.strokeStyle = 'red';
          context.fillStyle = 'red';
        }

        context?.translate(canvas.width, 0);
        context?.scale(-1, 1);
        const runDetection = () => {
          model.estimateHands(video).then((predictions) => {
            // Render
            context?.drawImage(
              video,
              0,
              0,
              video.width,
              video.height,
              0,
              0,
              canvas.width,
              canvas.height
            );
            if (predictions && predictions[0]) {
              drawKeypoints(context, predictions[0].landmarks);
              this._processGesture(predictions[0].landmarks);
            }
            requestAnimationFrame(runDetection);
          });
        };
        runDetection();
      })
      .catch((err) => {
        console.error(err);
      });
  }

  private _processGesture(landmarks: any) {
    // Set up gesture estimator, estimate for confidence level of 9 or higher
    const { gestures } = GE.estimate(landmarks, 9) || [];
    for (const g of gestures) {
      if(g.name !== this._lastGesture) {
        this._lastGesture = g.name;
        this._gesture$.next(g.name); 
        console.log(g);
      }
    }
  }
}