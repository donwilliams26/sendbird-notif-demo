import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { App as SendbirdApp } from '@sendbird/uikit-react';
import '@sendbird/uikit-react/dist/index.css';

function App() {
  const [notif, setNotif] = useState(null);

  useEffect(() => {
    // Connect to my backend
    const socket = io('http://localhost:3000'); // replace with my server URL

    socket.on('profanity_detected', (data) => {
      console.log('Profanity event received:', data);

      // Show browser notification
      if (Notification.permission === 'granted') {
        new Notification('Profanity flagged!', {
          body: `${data.sender?.nickname || data.sender?.user_id}: ${data.message}`
        });
      }

      // Optional: show temporary in-app alert
      setNotif(`${data.sender?.nickname || data.sender?.user_id}: ${data.message}`);
      setTimeout(() => setNotif(null), 5000);
    });

    return () => socket.disconnect();
  }, []);

  // Ask for notification permission on load!
  useEffect(() => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {notif && (
        <div style={{ position: 'absolute', top: 10, right: 10, background: 'red', color: 'white', padding: '10px', borderRadius: '8px' }}>
          {notif}
        </div>
      )}

      <SendbirdApp
        appId={'C1442CD5-7FA7-4D58-B356-FC967AE96B93'}
        userId={'878787'}
        accessToken={'dcac0afbfce5bbde1801cdf70fa255ce278e721d'}
      />
    </div>
  );
}

export default App;
