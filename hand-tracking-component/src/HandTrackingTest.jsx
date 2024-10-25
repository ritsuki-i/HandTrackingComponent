import React, { useEffect, useRef } from 'react';

// MediaPipe Handsと関連ライブラリのインポート
import { Hands } from '@mediapipe/hands';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { HAND_CONNECTIONS } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

function HandTrackingTest() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cursorRef = useRef(null);

  let isDragging = false;
  let lastX = null;
  let lastY = null;

  useEffect(() => {
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext('2d');
    const customCursor = cursorRef.current;

    // Handsソリューションの初期化
    const hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        },
      });
      
    hands.setOptions({
      maxNumHands: 1, // 手の検出を片手に設定
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults(onResults);

    // カメラの初期化
    const camera = new Camera(videoElement, {
      onFrame: async () => {
        await hands.send({ image: videoElement });
      },
      width: 1280,
      height: 720,
    });
    camera.start();

    function onResults(results) {
      // キャンバスのクリア
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

      // 元の映像を描画
      canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvasElement.width,
        canvasElement.height
      );

      // ランドマークが検出された場合
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];

        // 手のランドマークを描画
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
          color: '#00FF00',
          lineWidth: 5,
        });
        drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 2 });

        // 各ランドマークにポイントを表示
        for (let i = 0; i < landmarks.length; i++) {
          const x = landmarks[i].x * canvasElement.width;
          const y = landmarks[i].y * canvasElement.height;

          // ポイントを描画
          canvasCtx.beginPath();
          canvasCtx.arc(x, y, 5, 0, 2 * Math.PI);
          canvasCtx.fillStyle = '#FFFF00'; // ポイントの色
          canvasCtx.fill();
          canvasCtx.stroke();
        }

        // 指先の座標を取得
        const thumbTip = landmarks[4]; // 親指の先端
        const indexFingerTip = landmarks[8]; // 人差し指の先端
        const middleFingerTip = landmarks[12]; // 中指の先端
        const ringFingerTip = landmarks[16]; // 薬指の先端
        const littleFingerTip = landmarks[20]; // 小指の先端

        // 画面サイズに合わせて座標をスケーリング
        const x1 = thumbTip.x * canvasElement.width;
        const y1 = thumbTip.y * canvasElement.height;
        const x2 = indexFingerTip.x * canvasElement.width;
        const y2 = indexFingerTip.y * canvasElement.height;
        const x3 = middleFingerTip.x * canvasElement.width;
        const y3 = middleFingerTip.y * canvasElement.height;
        const x4 = ringFingerTip.x * canvasElement.width;
        const y4 = ringFingerTip.y * canvasElement.height;
        const x5 = littleFingerTip.x * canvasElement.width;
        const y5 = littleFingerTip.y * canvasElement.height;

        // 2点間の距離を計算
        const thumb_index_distance = Math.hypot(x2 - x1, y2 - y1); // 親指と人差し指の距離
        const index_middle_distance = Math.hypot(x3 - x2, y3 - y2); // 中指と人差し指の距離

        const error_distance1 = Math.hypot(x1 - x4, y1 - y4);
        const error_distance2 = Math.hypot(x2 - x4, y2 - y4);
        const error_distance3 = Math.hypot(x3 - x4, y3 - y4);

        // 誤差検知
        if (
          error_distance1 >= 50 &&
          error_distance2 >= 50 &&
          error_distance3 >= 50
        ) {
          // しきい値以下ならドラッグ状態に入る
          if (thumb_index_distance <= 40) {
            isDragging = true;

            canvasCtx.beginPath();
            canvasCtx.arc((x1 + x2) / 2, (y1 + y2) / 2, 10, 0, 2 * Math.PI);
            canvasCtx.fillStyle = '#FF0000'; // ポイントの色
            canvasCtx.fill();
            canvasCtx.stroke();

            if (index_middle_distance > 40) {
              if (lastX !== null && lastY !== null) {
                const deltaX = (x1 + x2) / 2 - lastX;
                const deltaY = (y1 + y2) / 2 - lastY;
                window.scrollBy(deltaX * 2, -deltaY * 2); // スクロール量を調整
              }
              lastX = (x1 + x2) / 2;
              lastY = (y1 + y2) / 2;
            } else {
              // ドラッグ状態を解除
              isDragging = false;
              lastX = null;
              lastY = null;
            }
          }

          if (index_middle_distance <= 40) {
            canvasCtx.beginPath();
            canvasCtx.arc((x2 + x3) / 2, (y2 + y3) / 2, 10, 0, 2 * Math.PI);
            canvasCtx.fillStyle = '#0033ff'; // ポイントの色
            canvasCtx.fill();
            canvasCtx.stroke();

            // カスタムカーソルを表示
            customCursor.style.display = 'block';

            // カーソルの位置を更新
            const cursorX = (x2 + x3) / 2;
            const cursorY = (y2 + y3) / 2;
            customCursor.style.left = `${canvasElement.width - cursorX}px`;
            customCursor.style.top = `${cursorY}px`;

            if (thumb_index_distance <= 40) {
              canvasCtx.beginPath();
              canvasCtx.arc(
                (x1 + x2 + x3) / 3,
                (y1 + y2 + y3) / 3,
                10,
                0,
                2 * Math.PI
              );
              canvasCtx.fillStyle = '#fbff00'; // ポイントの色
              canvasCtx.fill();
              canvasCtx.stroke();
            }
          } else {
            // カスタムカーソルを非表示
            customCursor.style.display = 'none';
          }
        }
      } else {
        // 手が検出されない場合もドラッグ状態を解除
        isDragging = false;
        lastX = null;
        lastY = null;
      }
      canvasCtx.restore();
    }

    return () => {
      // クリーンアップ
      camera.stop();
      hands.close();
    };
  }, []);

  return (
    <div
      className="container"
      style={{ position: 'relative', width: '100vw', height: '100vh' }}
    >
      <video
        ref={videoRef}
        className="input_video"
        autoPlay
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          transform: 'scaleX(-1)', // ミラー表示
        }}
      ></video>
      <canvas
        ref={canvasRef}
        className="output_canvas"
        width="1280"
        height="720"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          transform: 'scaleX(-1)', // ミラー表示
        }}
      ></canvas>
      <div
        ref={cursorRef}
        className="custom-cursor"
        id="customCursor"
        style={{
          position: 'absolute',
          width: '10px',
          height: '10px',
          backgroundColor: 'blue',
          borderRadius: '50%',
          pointerEvents: 'none',
          transform: 'translate(-50%, -50%)',
          display: 'none', // 初期状態では非表示
        }}
      ></div>
    </div>
  );
}

export default HandTrackingTest;
