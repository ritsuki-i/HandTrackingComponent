// AirCursor.jsx

import React, { useEffect, useRef, useState } from 'react';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { HAND_CONNECTIONS } from '@mediapipe/hands';
import { color } from 'framer-motion';

const AirCursor = () => {
    // Refs for video, canvas, and cursors
    const videoRef = useRef(null);
    const handsRef = useRef(null);
    const canvasRef = useRef(null);
    const redCursorRef = useRef(null);
    const blueCursorRef = useRef(null);
    const yellowCursorRef = useRef(null);
    const lastClickRef = useRef({ x: null, y: null });

    // State for managing UI
    const [showPopup, setShowPopup] = useState(false);
    const [showSystem, setShowSystem] = useState(false);
    const [showVideo, setShowVideo] = useState(false);
    const [videoPosition, setVideoPosition] = useState('bottom-right'); // default position
    const [instructionsConfirmed, setInstructionsConfirmed] = useState(false);


    // Refs for drag state
    const lastXRef = useRef(null);
    const lastYRef = useRef(null);
    const isDraggingRef = useRef(false);

    // Ref to store canvasRect
    const canvasRectRef = useRef({ left: 0, top: 0, width: 0, height: 0 });

    // スクロール位置を保持するリファレンスを作成
    const scrollYRef = useRef(0);

    // クリックイベントのある要素を取得
    /**
 * 指定した座標にあるクリック可能な要素を取得します。
 * @param {number} x - ビューポートのX座標
 * @param {number} y - ビューポートのY座標
 * @returns {Element|null} - クリック可能な要素、存在しない場合は null
 */
    const getClickableElement = (x, y) => {
        // 指定した座標にあるすべての要素を取得（上から下へ）
        const elements = document.elementsFromPoint(x, y);
        const interactiveTags = ['button', 'a', 'input', 'select', 'textarea', 'label'];

        for (let element of elements) {
            const tagName = element.tagName.toLowerCase();
            const role = element.getAttribute('role');

            // インタラクティブなタグまたは role="button" を持つ要素をチェック
            if (
                interactiveTags.includes(tagName) ||
                role === 'button'
            ) {
                // 要素が非表示でないこと、かつ無効化されていないことを確認
                if (
                    !element.disabled &&
                    element.offsetParent !== null
                ) {
                    return element;
                }
            }
        }

        return null;
    };


    useEffect(() => {
        // Function to update canvasRectRef
        const updateCanvasRect = () => {
            if (canvasRef.current) {
                canvasRectRef.current = canvasRef.current.getBoundingClientRect();
            }
        };

        // スクロール位置を追跡するuseEffect
        const handleScroll = () => {
            scrollYRef.current = window.scrollY;
            // Canvasの位置も更新
            updateCanvasRect();
            // デバッグ用にスクロール位置をログに出力
            console.log('Current Scroll Y:', scrollYRef.current);
        };

        // スクロールイベントリスナーを追加
        window.addEventListener('scroll', handleScroll);

        // 初期スクロール位置を設定
        handleScroll();

        // HandsとCameraの初期化はshowSystemがtrueのときにのみ行う
        if (!showSystem) return;

        const videoElement = videoRef.current;
        const canvasElement = canvasRef.current;
        const canvasCtx = canvasElement.getContext('2d');
        const redCursor = redCursorRef.current;
        const blueCursor = blueCursorRef.current;
        const yellowCursor = yellowCursorRef.current;

        // Resize canvas to window size
        const resizeCanvas = () => {
            canvasElement.width = window.innerWidth;
            canvasElement.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        if (!handsRef.current) {
            handsRef.current = new Hands({
                locateFile: (file) => {
                    // 非SIMD バージョンを使用する場合は以下を使用
                    // return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file.replace('_simd', '')}`;

                    // SIMD バージョンを使用する場合は以下を使用
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                },
            });
            handsRef.current.onResults(onResults);
        }

        if (handsRef.current) {
            handsRef.current.setOptions({
                maxNumHands: 1, // Detect one hand
                modelComplexity: 1,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5,
            });
        }

        // Initialize Camera
        const cameraInstance = new Camera(videoElement, {
            onFrame: async () => {
                try {
                    await handsRef.current.send({ image: videoElement });
                } catch (error) {
                    console.error('Hands send error:', error);
                }
            },
            width: 1280,
            height: 720,
        });
        cameraInstance.start();

        // Function to handle results from Hands
        function onResults(results) {
            // Clear and set up canvas
            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
            // ミラー表示をキャンバスコンテキストで行わない

            // Fill background with white
            canvasCtx.fillStyle = '#ffffff00';
            canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);

            // If landmarks are detected
            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                const landmarks = results.multiHandLandmarks[0];

                // Optional: Draw hand landmarks and connectors
                // drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
                //     color: '#00FF00',
                //     lineWidth: 5,
                // });
                // drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 2 });

                // Get fingertips
                const thumbTip = landmarks[4];
                const indexFingerTip = landmarks[8];
                const middleFingerTip = landmarks[12];
                const ringFingerTip = landmarks[16];
                const littleFingerTip = landmarks[20];

                // Scale coordinates
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

                // Calculate distances
                const thumb_index_distance = Math.hypot(x2 - x1, y2 - y1);
                const index_middle_distance = Math.hypot(x3 - x2, y3 - y2);

                const error_distance1 = Math.hypot(x1 - x4, y1 - y4);
                const error_distance2 = Math.hypot(x2 - x4, y2 - y4);
                const error_distance3 = Math.hypot(x3 - x4, y3 - y4);

                // Error detection
                if (
                    error_distance1 >= 50 &&
                    error_distance2 >= 50 &&
                    error_distance3 >= 50
                ) {
                    // If thumb and index finger are close
                    if (thumb_index_distance <= 40) {
                        isDraggingRef.current = true;

                        // Draw red point
                        canvasCtx.beginPath();
                        canvasCtx.arc((x1 + x2) / 2, (y1 + y2) / 2, 10, 0, 2 * Math.PI);
                        canvasCtx.fillStyle = '#FF0000';
                        canvasCtx.fill();
                        canvasCtx.stroke();

                        // Show and position blue cursor
                        redCursor.style.display = 'block';
                        const redCursorX = (x2 + x3) / 2;
                        const redCursorY = (y2 + y3) / 2;
                        redCursor.style.left = `${canvasElement.width - redCursorX}px`; // No mirroring
                        redCursor.style.top = `${redCursorY + scrollYRef.current}px`;

                        // Handle scrolling
                        if (index_middle_distance > 40) {
                            if (lastXRef.current !== null && lastYRef.current !== null) {
                                const deltaX = (x1 + x2) / 2 - lastXRef.current;
                                const deltaY = (y1 + y2) / 2 - lastYRef.current;
                                window.scrollBy(deltaX * 2, -deltaY * 2);
                            }
                            lastXRef.current = (x1 + x2) / 2;
                            lastYRef.current = (y1 + y2) / 2;
                        } else {
                            // Stop dragging
                            isDraggingRef.current = false;
                            lastXRef.current = null;
                            lastYRef.current = null;
                        }
                    } else {
                        // Stop dragging if thumb and index are not close
                        isDraggingRef.current = false;
                        lastXRef.current = null;
                        lastYRef.current = null;
                    }

                    // If index and middle finger are close
                    if (index_middle_distance <= 40) {
                        // Draw blue point
                        canvasCtx.beginPath();
                        canvasCtx.arc((x2 + x3) / 2, (y2 + y3) / 2, 10, 0, 2 * Math.PI);
                        canvasCtx.fillStyle = '#0033ff';
                        canvasCtx.fill();
                        canvasCtx.stroke();

                        // Show and position blue cursor
                        blueCursor.style.display = 'block';
                        const blueCursorX = (x2 + x3) / 2;
                        const blueCursorY = (y2 + y3) / 2;
                        blueCursor.style.left = `${canvasElement.width - blueCursorX}px`; // No mirroring
                        blueCursor.style.top = `${blueCursorY + scrollYRef.current}px`;

                        // If thumb and index are also close, draw yellow point
                        if (thumb_index_distance <= 40) {
                            canvasCtx.beginPath();
                            canvasCtx.arc(
                                (x1 + x2 + x3) / 3,
                                (y1 + y2 + y3) / 3,
                                10,
                                0,
                                2 * Math.PI
                            );
                            canvasCtx.fillStyle = '#fbff00';
                            canvasCtx.fill();
                            canvasCtx.stroke();

                            // Show and position yellow cursor
                            yellowCursor.style.display = 'block';
                            const yellowCursorX = (x1 + x2 + x3) / 3;
                            const yellowCursorY = (y1 + y2 + y3) / 3;
                            yellowCursor.style.left = `${canvasElement.width - yellowCursorX}px`; // No mirroring
                            yellowCursor.style.top = `${yellowCursorY + scrollYRef.current}px`;

                            // 座標をビューポート座標系に変換
                            const canvasRect = canvasElement.getBoundingClientRect();
                            const cursorXClient = canvasRect.left + (canvasElement.width - yellowCursorX) / canvasElement.width * canvasRect.width;
                            const cursorYClient = canvasRect.top + yellowCursorY / canvasElement.height * canvasRect.height;

                            // デバッグログ
                            console.log('Yellow Cursor Client Coordinates:', cursorXClient, cursorYClient);

                            // 要素を取得
                            const element = getClickableElement(cursorXClient, cursorYClient);
                            console.log('Element at cursor:', element);

                            // deltaClick の計算
                            const deltaClick = lastClickRef.current.x === null || lastClickRef.current.y === null ||
                                Math.hypot(cursorXClient - lastClickRef.current.x, cursorYClient + scrollYRef.current - lastClickRef.current.y) > 10;

                            if (deltaClick && element) {
                                // クリックイベントを作成
                                const clickEvent = new MouseEvent('click', {
                                    view: window,
                                    bubbles: true,
                                    cancelable: true,
                                });

                                // 取得した要素にクリックイベントをディスパッチ
                                element.dispatchEvent(clickEvent);
                                console.log('Click event dispatched to:', element);

                                // 最後のクリック位置を更新
                                lastClickRef.current = { x: cursorXClient, y: cursorYClient + scrollYRef.current };
                            }
                        } else {
                            // Hide yellow cursor if thumb and index are not close
                            yellowCursor.style.display = 'none';
                        }
                    } else {
                        // Hide blue and yellow cursors if index and middle are not close
                        blueCursor.style.display = 'none';
                        yellowCursor.style.display = 'none';
                    }
                } else {
                    // Hide cursors and reset dragging
                    isDraggingRef.current = false;
                    lastXRef.current = null;
                    lastYRef.current = null;
                    blueCursor.style.display = 'none';
                    yellowCursor.style.display = 'none';
                    redCursor.style.display = 'none';
                }
            } else {
                // Hide cursors and reset dragging if no hand detected
                isDraggingRef.current = false;
                lastXRef.current = null;
                lastYRef.current = null;
                blueCursor.style.display = 'none';
                yellowCursor.style.display = 'none';
                redCursor.style.display = 'none';
            }

            canvasCtx.restore();
        }

        return () => {
            // Cleanup on unmount
            cameraInstance.stop();
            if (handsRef.current) {
                handsRef.current.close();
                handsRef.current = null;
            }
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [showSystem]); // showVideoを依存から外す

    // Function to handle starting the system
    const handleStartSystem = () => {
        setShowPopup(false);
        setShowSystem(true);
    };

    // Function to handle configuration submission
    const handleConfigurationSubmit = (e) => {
        e.preventDefault();
        setShowPopup(false);
        setShowSystem(true);
    };

    // Function to get video style based on position
    const getVideoStyle = () => {
        const baseStyle = {
            position: 'fixed',
            width: '320px',
            height: '180px',
            transform: 'scaleX(-1)', // Mirror display
            border: '2px solid #ccc',
            borderRadius: '8px',
            zIndex: 1000, // Ensure video is on top
            opacity: showVideo ? 1 : 0, // showVideo に基づいて表示/非表示を設定
            pointerEvents: 'none', // 動画に対するポインタイベントを無効化
        };

        switch (videoPosition) {
            case 'top-left':
                return { ...baseStyle, top: '10px', left: '10px' };
            case 'top-right':
                return { ...baseStyle, top: '10px', right: '10px' };
            case 'bottom-left':
                return { ...baseStyle, bottom: '10px', left: '10px' };
            case 'bottom-right':
                return { ...baseStyle, bottom: '10px', right: '10px' };
            default:
                return { ...baseStyle, bottom: '10px', right: '10px' };
        }
    };

    return (
        <>
            {/* Initial Button */}
            {!showSystem && (
                <button
                    onClick={() => setShowPopup(true)}
                >
                    ハンドトラッキングシステムを使用する
                </button>
            )}

            {/* Configuration Popup */}
            {showPopup && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 2000,
                    }}
                >
                    <div
                        style={{
                            backgroundColor: '#fff',
                            padding: '30px',
                            borderRadius: '10px',
                            width: '500px',
                            boxShadow: '0 0 10px rgba(0,0,0,0.3)',
                            color: '#000',
                            position: 'relative',
                        }}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setShowPopup(false)}
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: 'none',
                                border: 'none',
                                fontSize: '30px',
                                cursor: 'pointer',
                            }}
                        >
                            ×
                        </button>

                        {/* Usage Instructions */}
                        <div style={{ marginBottom: '20px' }}>
                            <h3>このシステムの使い方</h3>
                            <ul>
                                <li>
                                    親指と人差し指のみを合わせると<span style={{ color: 'red' }}>●</span>が出現します。そのとき画面をつかんでスクロールすることができます。
                                </li>
                                <li>
                                    人差し指と中指を合わせると<span style={{ color: 'blue' }}>●</span>が出現します。これはマウスのポインタの役割を持っています。
                                </li>
                                <li>
                                    <span style={{ color: 'blue' }}>●</span>が出現しているときに追加で親指を合わせると<span style={{ color: 'yellow' }}>●</span>が出現します。そのときクリックイベントが発生します。
                                </li>
                            </ul>
                        </div>

                        <form onSubmit={handleConfigurationSubmit}>
                            {/* Confirmation Checkbox */}
                            <div style={{ marginBottom: '20px' }}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={instructionsConfirmed}
                                        onChange={(e) => setInstructionsConfirmed(e.target.checked)}
                                    />
                                    {' '}操作説明を確認しました
                                </label>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={showVideo}
                                        onChange={(e) => setShowVideo(e.target.checked)}
                                    />{' '}
                                    Webカメラの描画を表示する
                                </label>
                            </div>

                            {showVideo && (
                                <div style={{ marginBottom: '20px' }}>
                                    <label>Webカメラの表示位置:</label>
                                    <div>
                                        <label>
                                            <input
                                                type="radio"
                                                value="top-left"
                                                checked={videoPosition === 'top-left'}
                                                onChange={(e) => setVideoPosition(e.target.value)}
                                            />{' '}
                                            左上
                                        </label>
                                    </div>
                                    <div>
                                        <label>
                                            <input
                                                type="radio"
                                                value="top-right"
                                                checked={videoPosition === 'top-right'}
                                                onChange={(e) => setVideoPosition(e.target.value)}
                                            />{' '}
                                            右上
                                        </label>
                                    </div>
                                    <div>
                                        <label>
                                            <input
                                                type="radio"
                                                value="bottom-left"
                                                checked={videoPosition === 'bottom-left'}
                                                onChange={(e) => setVideoPosition(e.target.value)}
                                            />{' '}
                                            左下
                                        </label>
                                    </div>
                                    <div>
                                        <label>
                                            <input
                                                type="radio"
                                                value="bottom-right"
                                                checked={videoPosition === 'bottom-right'}
                                                onChange={(e) => setVideoPosition(e.target.value)}
                                            />{' '}
                                            右下
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Show the Start button only if instructions are confirmed */}
                            {instructionsConfirmed && (
                                <div style={{ textAlign: 'center' }}>
                                    <button
                                        type="submit"
                                        style={{
                                            padding: '10px 20px',
                                            fontSize: '16px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        開始
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}



            {/* Hand Tracking System Overlay */}
            {showSystem && (
                <>
                    <video
                        ref={videoRef}
                        className="input_video"
                        autoPlay
                        playsInline
                        muted
                        style={getVideoStyle()}
                    ></video>

                    {/* Canvas Element */}
                    <canvas
                        ref={canvasRef}
                        className="output_canvas"
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            transform: 'scaleX(-1)', // ミラー表示を削除
                            zIndex: -1,
                        }}
                    ></canvas>

                    {/* Red Cursor */}
                    <div
                        ref={redCursorRef}
                        style={{
                            position: 'absolute', // Absolute positioning relative to container
                            width: '10px',
                            height: '10px',
                            backgroundColor: 'red',
                            borderRadius: '50%',
                            pointerEvents: 'none',
                            transform: 'translate(-50%, -50%)',
                            display: 'none',
                            zIndex: 1000,
                        }}
                    ></div>

                    {/* Blue Cursor */}
                    <div
                        ref={blueCursorRef}
                        style={{
                            position: 'absolute', // Absolute positioning relative to container
                            width: '10px',
                            height: '10px',
                            backgroundColor: 'blue',
                            borderRadius: '50%',
                            pointerEvents: 'none',
                            transform: 'translate(-50%, -50%)',
                            display: 'none',
                            zIndex: 1000,
                        }}
                    ></div>

                    {/* Yellow Cursor */}
                    <div
                        ref={yellowCursorRef}
                        style={{
                            position: 'absolute', // Absolute positioning relative to container
                            width: '10px', // サイズを大きく
                            height: '10px',
                            backgroundColor: 'yellow',
                            borderRadius: '50%',
                            pointerEvents: 'auto', // イベントを受け取れるように
                            transform: 'translate(-50%, -50%)',
                            display: 'none',
                            zIndex: 1001, // 前面に表示
                            cursor: 'pointer', // ポインターに変更
                        }}
                    ></div>
                </>
            )}
        </>
    );
};
export default AirCursor;