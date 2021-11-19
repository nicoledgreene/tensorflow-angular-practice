// @ts-ignore
import * as fp from 'fingerpose';

const thumbsDownGesture = new fp.GestureDescription('thumbs_down');
//Expect the thumb to be stretched out and pointing down:
thumbsDownGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl);
thumbsDownGesture.addDirection(fp.Finger.Thumb, fp.FingerDirection.VerticalDown, 1.0);
// This will define that a thumb pointing downwards will result in the highest score (1.0) for this gesture. If the thumb is angled to diagonal down left / right we can somehow still accept it, albeit with a lower score (0.9).
thumbsDownGesture.addDirection(fp.Finger.Thumb, fp.FingerDirection.DiagonalDownLeft, 0.9);
thumbsDownGesture.addDirection(fp.Finger.Thumb, fp.FingerDirection.DiagonalDownRight, 0.9);
// do this for all other fingers
// All other fingers are expected to be fully curled. For this gesture it doesn't really matter which direction the curled fingers are pointing at therefore only the curl description is added. Same as above, it's recommended to accept half curled fingers too, with a little bit lower score.
for(let finger of [fp.Finger.Index, fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky]) {
  thumbsDownGesture.addCurl(finger, fp.FingerCurl.FullCurl, 1.0);
  thumbsDownGesture.addCurl(finger, fp.FingerCurl.HalfCurl, 0.9);
}

const highFiveGesture = new fp.GestureDescription('high_five');
//Expect all fingers to be pointing diagonally up or straight up
for(let finger of [fp.Finger.Thumb, fp.Finger.Index, fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky])  {
  highFiveGesture.addDirection(finger, fp.FingerDirection.VerticalUp, 1.0);
  highFiveGesture.addDirection(finger, fp.FingerDirection.DiagonalUpLeft, 1.0);
  highFiveGesture.addDirection(finger, fp.FingerDirection.DiagonalUpRight, 1.0);
}

const shakaGesture = new fp.GestureDescription('shaka');
//expect thumb and pinky to be diagonal out
for(let finger of [fp.Finger.Thumb, fp.Finger.Pinky])  {
  shakaGesture.addDirection(finger, fp.FingerDirection.DiagonalUpLeft, 1.0);
  shakaGesture.addDirection(finger, fp.FingerDirection.DiagonalUpRight, 1.0);

}
//expect other 3 fingers to be curled
for(let finger of [fp.Finger.Index, fp.Finger.Middle, fp.Finger.Ring])  {
  shakaGesture.addCurl(finger, fp.FingerCurl.FullCurl, 1.0);
  shakaGesture.addCurl(finger, fp.FingerCurl.HalfCurl, 0.8);

}

const loveGesture = new fp.GestureDescription('love');
//expect thumb to be vertically up
loveGesture.addDirection(fp.Finger.Thumb, fp.FingerDirection.DiagonalUpLeft, 1.0);
loveGesture.addDirection(fp.Finger.Thumb, fp.FingerDirection.DiagonalUpRight, 1.0);
loveGesture.addDirection(fp.Finger.Thumb, fp.FingerDirection.VerticalUp, 0.8);

//expect index and pinky to be up
for(let finger of [fp.Finger.Index, fp.Finger.Pinky])  {
  loveGesture.addDirection(finger, fp.FingerDirection.VerticalUp, 1.0);
  loveGesture.addDirection(finger, fp.FingerDirection.DiagonalUpLeft, 0.8);
  loveGesture.addDirection(finger, fp.FingerDirection.DiagonalUpRight, 0.8);
}
//expect other 2 fingers to be curled
for(let finger of [fp.Finger.Middle, fp.Finger.Ring])  {
  loveGesture.addCurl(finger, fp.FingerCurl.FullCurl, 1.0);
  loveGesture.addCurl(finger, fp.FingerCurl.HalfCurl, 0.8);
}

export const GE = new fp.GestureEstimator([
  fp.Gestures.VictoryGesture,
  fp.Gestures.ThumbsUpGesture,
  thumbsDownGesture,
  highFiveGesture,
  shakaGesture,
  loveGesture
]);