// HandTrackingDemo.jsx

import React, { useEffect, useRef, useState } from 'react';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { HAND_CONNECTIONS } from '@mediapipe/hands';

const HandTrackingDemo = () => {
    // Refs for video, canvas, and cursors
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const redCursorRef = useRef(null);
    const blueCursorRef = useRef(null);
    const yellowCursorRef = useRef(null);

    // State for managing UI
    const [showPopup, setShowPopup] = useState(false);
    const [showSystem, setShowSystem] = useState(false);
    const [showVideo, setShowVideo] = useState(false);
    const [videoPosition, setVideoPosition] = useState('bottom-right'); // default position

    // Refs for drag state
    const lastXRef = useRef(null);
    const lastYRef = useRef(null);
    const isDraggingRef = useRef(false);

    useEffect(() => {
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

        // Initialize Hands
        const hands = new Hands({
            locateFile: (file) => {
                // 非SIMD バージョンを使用する場合は以下を使用
                // return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file.replace('_simd', '')}`;
                
                // SIMD バージョンを使用する場合は以下を使用
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            },
        });

        hands.setOptions({
            maxNumHands: 1, // Detect one hand
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });

        hands.onResults(onResults);

        // Initialize Camera
        const cameraInstance = new Camera(videoElement, {
            onFrame: async () => {
                try {
                    await hands.send({ image: videoElement });
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
            canvasCtx.fillStyle = '#FFFFFF';
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
                        const cursorX = (x2 + x3) / 2;
                        const cursorY = (y2 + y3) / 2;
                        blueCursor.style.left = `${canvasElement.width - cursorX}px`; // No mirroring
                        blueCursor.style.top = `${cursorY}px`;

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
                            yellowCursor.style.top = `${yellowCursorY}px`;
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
            hands.close();
            window.removeEventListener('resize', resizeCanvas);
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
            position: 'absolute',
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
                    style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        padding: '20px 40px',
                        fontSize: '18px',
                        cursor: 'pointer',
                        zIndex: 1000,
                    }}
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
                            width: '400px',
                            boxShadow: '0 0 10px rgba(0,0,0,0.3)',
                        }}
                    >
                        <h2 style={{ textAlign: 'center' }}>設定</h2>
                        <form onSubmit={handleConfigurationSubmit}>
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
                            zIndex: 999,
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
                            width: '10px',
                            height: '10px',
                            backgroundColor: 'yellow',
                            borderRadius: '50%',
                            pointerEvents: 'none',
                            transform: 'translate(-50%, -50%)',
                            display: 'none',
                            zIndex: 1000,
                        }}
                    ></div>
                </>
            )}
        </>
    ); 
};
export default HandTrackingDemo;