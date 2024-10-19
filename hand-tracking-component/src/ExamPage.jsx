// ExamPage.jsx

import React from 'react';
import AirCursor from './AirCursor';

// スタイルオブジェクト（縦横1.5倍に調整）
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '150vh', // 100vh * 1.5
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: '30px', // 20px * 1.5
    textAlign: 'center',
    color: 'white',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#f0f0f0',
  },
  footer: {
    backgroundColor: '#4CAF50',
    padding: '30px', // 20px * 1.5
    textAlign: 'center',
    color: 'white',
  },
  button: {
    padding: '22.5px 45px', // 15px * 1.5 , 30px * 1.5
    margin: '15px', // 10px * 1.5
    fontSize: '24px', // 16px * 1.5
    cursor: 'pointer',
    border: 'none',
    borderRadius: '7.5px', // 5px * 1.5
    backgroundColor: '#008CBA',
    color: 'white',
    transition: 'background-color 0.3s',
  },
  buttonHover: {
    backgroundColor: '#005f6a',
  },
  sidebar: {
    position: 'absolute',
    top: '50%', // 50%
    transform: 'translateY(-50%)',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px', // 10px * 1.5
  },
  leftSidebar: {
    left: '30px', // 20px * 1.5
  },
  rightSidebar: {
    right: '30px', // 20px * 1.5
  },
};

const handleClick = (buttonName) => {
  alert(`${buttonName} ボタンがクリックされました！`);
};

const ExamPage = () => {
  return (
    <div style={styles.container}>
      {/* ヘッダー */}
      <header style={styles.header}>
        <h1 style={{ fontSize: '36px' }}>Exam Page</h1> {/* フォントサイズを1.5倍に */}
        <AirCursor />
        <button
          style={styles.button}
          onClick={() => handleClick('ヘッダー')}
          onMouseOver={(e) => (e.target.style.backgroundColor = '#005f6a')}
          onMouseOut={(e) => (e.target.style.backgroundColor = '#008CBA')}
        >
          ヘッダーボタン
        </button>
      </header>

      {/* メインコンテンツ */}
      <main style={styles.main}>
        {/* 中央のボタン */}
        <button
          style={styles.button}
          onClick={() => handleClick('中央')}
          onMouseOver={(e) => (e.target.style.backgroundColor = '#005f6a')}
          onMouseOut={(e) => (e.target.style.backgroundColor = '#008CBA')}
        >
          中央ボタン
        </button>

        {/* 左サイドバーのボタン */}
        <div style={{ ...styles.sidebar, ...styles.leftSidebar }}>
          <button
            style={styles.button}
            onClick={() => handleClick('左サイドバー')}
            onMouseOver={(e) => (e.target.style.backgroundColor = '#005f6a')}
            onMouseOut={(e) => (e.target.style.backgroundColor = '#008CBA')}
          >
            左サイドバーボタン
          </button>
          <button
            style={styles.button}
            onClick={() => handleClick('左サイドバー2')}
            onMouseOver={(e) => (e.target.style.backgroundColor = '#005f6a')}
            onMouseOut={(e) => (e.target.style.backgroundColor = '#008CBA')}
          >
            左サイドバーボタン2
          </button>
        </div>

        {/* 右サイドバーのボタン */}
        <div style={{ ...styles.sidebar, ...styles.rightSidebar }}>
          <button
            style={styles.button}
            onClick={() => handleClick('右サイドバー')}
            onMouseOver={(e) => (e.target.style.backgroundColor = '#005f6a')}
            onMouseOut={(e) => (e.target.style.backgroundColor = '#008CBA')}
          >
            右サイドバーボタン
          </button>
          <button
            style={styles.button}
            onClick={() => handleClick('右サイドバー2')}
            onMouseOver={(e) => (e.target.style.backgroundColor = '#005f6a')}
            onMouseOut={(e) => (e.target.style.backgroundColor = '#008CBA')}
          >
            右サイドバーボタン2
          </button>
        </div>
      </main>

      {/* フッター */}
      <footer style={styles.footer}>
        <button
          style={styles.button}
          onClick={() => handleClick('フッター')}
          onMouseOver={(e) => (e.target.style.backgroundColor = '#005f6a')}
          onMouseOut={(e) => (e.target.style.backgroundColor = '#008CBA')}
        >
          フッターボタン
        </button>
      </footer>
    </div>
  );
};

export default ExamPage;
