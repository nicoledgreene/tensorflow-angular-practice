import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as handpose from '@tensorflow-models/handpose';

import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
import { drawKeypoints } from './hand-renderer';
import { GE } from './fingerpose';

interface GestureMapInterface {
  [key: string]: Gesture
}

const GestureMap: GestureMapInterface = {
  thumbs_up: 'thumbs_up',
  victory: 'victory',
  thumbs_down: 'thumbs_down',
  high_five: 'high_five',
  shaka: 'shaka',
  love: 'love'
};

type Gesture =  'victory' | 'thumbs_up' | 'thumbs_down' | 'none' | 'high_five' | 'shaka' | 'love';
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

  //Initializes the canvas and video 
  initialize(canvas: HTMLCanvasElement, video: HTMLVideoElement): void {
    this._dimensions = [video.width, video.height];
    navigator.mediaDevices
      .getUserMedia({ video: true })
      //this is where we load the machine learning model
      .then((stream) => {
        this._stream = stream;
        //recognizes the hand pose and returns landmarks of individual fingers (from Tensorflow Handpose model)
        return handpose.load();
      })
      .then((model: handpose.HandPose) => {
        const context = canvas.getContext('2d');
        context?.clearRect(0, 0, video.width, video.height);
        //define context clue
        if(context) {
          context.strokeStyle = 'red';
          context.fillStyle = 'red';
        }

        context?.translate(canvas.width, 0);
        context?.scale(-1, 1);

        const runDetection = () => {
          model.estimateHands(video).then((predictions) => {
            // Render visual clue for the user for our context on the video frame
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
            //predictions returns the following array of objects:
            //[
            // {
              // {
              //   handInViewConfidence: 1, // The probability of a hand being present.
              //   boundingBox: { // The bounding box surrounding the hand.
              //     topLeft: [162.91, -17.42],
              //     bottomRight: [548.56, 368.23],
              //   },
              //   landmarks: [ // The 3D coordinates of each hand landmark.
              //     [472.52, 298.59, 0.00],
              //     [412.80, 315.64, -6.18],
              //     ...
              //   ],
              //   annotations: { // Semantic groupings of the `landmarks` coordinates.
              //     thumb: [
              //       [412.80, 315.64, -6.18]
              //       [350.02, 298.38, -7.14],
              //       ...
              //     ],
              //     ...
              //   }
            // }
            //]
            if (predictions && predictions[0] && predictions[0].handInViewConfidence >= 0.99) {
              // Each hand object contains a `landmarks` property,
              // which is an array of 21 3-D landmarks.
              drawKeypoints(context, predictions[0].landmarks);
              //If hands are detected, let's run our function to process the gesture and pass the finger landmarks
              this._processGesture(predictions[0].landmarks);
            }
            // tells the browser that you wish to perform an animation and requests that the browser calls a specified function to update an animation before the next repaint.
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
      }
    }
  }
}