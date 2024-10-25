import React, { useEffect, useState } from 'react';
import AirCursorDocumentation from './AirCursorDocumentation';
import DemoPage from './DemoPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import { IoChevronDownSharp } from "react-icons/io5";

function App() {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeIn(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const PageDown = async () => {
    window.scrollBy({
      top: window.innerHeight * 3,
      left: 0,
      behavior: 'smooth'
    });
  }

  return (
    <>
      {/* body全体のスタイル */}
      <div style={{ margin: 0, padding: 0, overflowX: 'hidden' }}>
        <div style={{ margin: 0, padding: 0, overflow: 'hidden', backgroundColor: '#000000', height: '100vh', width: '100vw', display: 'flex', position: 'relative' }}>
          {/* 左側のタイトル文字 */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', color: '#ffffff', paddingRight: '20px', zIndex: 2, opacity: fadeIn ? 1 : 0, transition: 'opacity 2s ease-in-out' }}>
            <h1 style={{ fontSize: '80px', margin: 0 }}>AirCursor</h1>
            <p style={{ fontSize: '20px', margin: 0 }}>Reactコンポーネントライブラリ</p>
          </div>
          {/* 右側の写真 */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', position: 'relative', zIndex: 1, opacity: fadeIn ? 1 : 0, transition: 'opacity 2s ease-in-out' }}>
            <img
              src="img/AirCursor-icon.png" // 適宜画像のURLに置き換えてください
              alt="Sample"
              style={{ maxWidth: '90%', maxHeight: '90%', marginLeft: '-10%' }}
            />
          </div>
          <button type="button" className="btn btn-outline-dark" id='view-button' onClick={PageDown} style={{
            position: 'absolute', top: '90vh', right: '50vw', zIndex: 3, borderRadius: '100%', filter: 'invert(100%)', height: '40px', width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IoChevronDownSharp />
          </button>
        </div>
        <div style={{ margin: 0, padding: 0, overflow: 'hidden', backgroundColor: '#ffffff', height: '100vh', width: '100vw', display: 'flex', position: 'relative' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <p style={{ fontSize: '25px', textAlign: 'center', maxWidth: '90%' }}>
              AirCursorはReactベースのコンポーネントライブラリで、手の動きを使ってカーソルを操作する機能を提供します。ユーザーは直感的に操作でき、特にプレゼンテーションやデモンストレーションにおいて優れた体験を提供します。
            </p>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              src="img/AirCursor-overview.png" // 適宜画像のURLに置き換えてください
              alt="Overview"
              style={{ maxWidth: '90%', maxHeight: '90%' }}
            />
          </div>
        </div>
        <div style={{ margin: 0, padding: 0, overflow: 'hidden', backgroundColor: '#000000', height: '100vh', width: '100vw', display: 'flex', position: 'relative' }}>
          <DemoPage />
        </div>
        <div style={{ margin: 0, padding: 0, overflow: 'hidden', backgroundColor: '#ffffff', width: '100vw', display: 'flex', position: 'relative' }}>
          <AirCursorDocumentation />
        </div>
      </div>
    </>
  );
}

export default App;
