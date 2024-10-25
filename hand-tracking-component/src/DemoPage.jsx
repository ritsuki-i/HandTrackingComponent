import React from 'react';
import AirCursor from 'air-cursor';

const DemoPage = () => (
  <div
    style={{
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      backgroundColor: '#000000',
      height: '100vh',
      width: '100vw',
      display: 'flex',
      position: 'relative',
    }}
  >
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <AirCursor />
    </div>
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        color: '#ffffff',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <p>こちらのボタンをクリックすることで、実際にAirCursorを体験できます。</p>
      </div>
    </div>
  </div>
);

export default DemoPage;
