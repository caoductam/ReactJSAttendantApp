// import React, { useEffect, useState } from 'react';
// import { Device } from '@capacitor/device';
// import { Network } from '@capacitor/network';
// import { App } from '@capacitor/app';
// import { Share } from '@capacitor/share';
// import { Geolocation } from '@capacitor/geolocation';

// function generateSessionId() {
//   return Math.random().toString(36).substr(2, 9);
// }

// const SESSION_HISTORY_KEY = 'sessionHistory';

// const DeviceDashboard = () => {
//   const [deviceInfo, setDeviceInfo] = useState({});
//   const [networkStatus, setNetworkStatus] = useState({});
//   const [appInfo, setAppInfo] = useState({});
//   const [sessionId, setSessionId] = useState('');
//   const [batteryInfo, setBatteryInfo] = useState({});
//   const [location, setLocation] = useState({});
//   const [darkMode, setDarkMode] = useState(false);

//   // Lưu lịch sử các phiên
//   const [sessionHistory, setSessionHistory] = useState([]);

//   // Lấy thông tin thiết bị và lưu session
//   const fetchInfo = async () => {
//     const info = await Device.getInfo();
//     setDeviceInfo(info);

//     const netStatus = await Network.getStatus();
//     setNetworkStatus(netStatus);

//     const app = await App.getInfo();
//     setAppInfo(app);

//     const battery = await Device.getBatteryInfo();
//     setBatteryInfo(battery);

//     try {
//       const pos = await Geolocation.getCurrentPosition();
//       setLocation(pos.coords);
//     } catch (e) {
//       setLocation({});
//     }

//     // Sinh session mới và lưu vào lịch sử
//     const newSessionId = generateSessionId();
//     setSessionId(newSessionId);

//     // Lưu vào localStorage
//     const history = JSON.parse(localStorage.getItem(SESSION_HISTORY_KEY) || '[]');
//     const newHistory = [
//       { sessionId: newSessionId, time: new Date().toLocaleString() },
//       ...history
//     ].slice(0, 10); // Lưu tối đa 10 phiên gần nhất
//     localStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(newHistory));
//     setSessionHistory(newHistory);
//   };

//   // Lấy lịch sử khi load lần đầu
//   useEffect(() => {
//     const history = JSON.parse(localStorage.getItem(SESSION_HISTORY_KEY) || '[]');
//     setSessionHistory(history);
//     fetchInfo();
//     const handler = Network.addListener('networkStatusChange', status => {
//       setNetworkStatus(status);
//     });
//     return () => {
//       handler.remove();
//     };
//     // eslint-disable-next-line
//   }, []);

//   const handleShare = async () => {
//     const content = `
//       Model: ${deviceInfo.model}
//       OS: ${deviceInfo.operatingSystem} ${deviceInfo.osVersion}
//       App Version: ${appInfo.version}
//       Network: ${networkStatus.connectionType} (${networkStatus.connected ? 'Connected' : 'Disconnected'})
//       Battery: ${batteryInfo.batteryLevel ? (batteryInfo.batteryLevel * 100).toFixed(0) : '--'}% ${batteryInfo.isCharging ? '(Charging)' : ''}
//       Location: ${location.latitude}, ${location.longitude}
//       Session ID: ${sessionId}
//     `;
//     await Share.share({
//       title: 'Device Info',
//       text: content,
//     });
//   };

//   const toggleTheme = () => setDarkMode(!darkMode);

//   return (
//     <div className={`dashboard-container${darkMode ? ' dark' : ''}`}>
//       <div className="dashboard-card">
//         <h2>📱 Device Dashboard</h2>
//         <ul className="dashboard-list">
//           <li>🛠️ <b>Model:</b> {deviceInfo.model}</li>
//           <li>💻 <b>OS:</b> {deviceInfo.operatingSystem} {deviceInfo.osVersion}</li>
//           <li>📦 <b>App Version:</b> {appInfo.version}</li>
//           <li>🌐 <b>Network:</b> {networkStatus.connectionType} ({networkStatus.connected ? 'Connected' : 'Disconnected'})</li>
//           <li>🔋 <b>Battery:</b> {batteryInfo.batteryLevel ? (batteryInfo.batteryLevel * 100).toFixed(0) : '--'}% {batteryInfo.isCharging ? '(Charging)' : ''}</li>
//           <li>📍 <b>Location:</b> {location.latitude ? `${location.latitude}, ${location.longitude}` : 'N/A'}</li>
//           <li>🆔 <b>Session ID:</b> {sessionId}</li>
//         </ul>

//         {/* Hiển thị lịch sử các phiên */}
//         <div className="session-history">
//           <h4>🕒 Lịch sử phiên gần đây</h4>
//           <ul>
//             {sessionHistory.length === 0 && <li>Chưa có lịch sử</li>}
//             {sessionHistory.map((s, idx) => (
//               <li key={idx}>
//                 <span style={{fontWeight: 'bold'}}>{s.sessionId}</span> <span style={{color: '#888'}}>({s.time})</span>
//               </li>
//             ))}
//           </ul>
//         </div>

//         <button className="share-btn" onClick={handleShare}>📤 Chia sẻ thông tin</button>
//         <button className="refresh-btn" onClick={fetchInfo}>🔄 Làm mới</button>
//         <button className="theme-btn" onClick={toggleTheme}>{darkMode ? '☀️ Sáng' : '🌙 Tối'}</button>
//       </div>
//     </div>
//   );
// };

// export default DeviceDashboard;

import React, { useEffect, useState } from 'react';
import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';
import { App } from '@capacitor/app';
import { Share } from '@capacitor/share';
import { Geolocation } from '@capacitor/geolocation';
import { QRCodeCanvas } from 'qrcode.react';
import { LocalNotifications } from '@capacitor/local-notifications';

function generateSessionId() {
  return Math.random().toString(36).substr(2, 9);
}

const SESSION_HISTORY_KEY = 'sessionHistory';

const DeviceDashboard = () => {
  const [deviceInfo, setDeviceInfo] = useState({});
  const [networkStatus, setNetworkStatus] = useState({});
  const [appInfo, setAppInfo] = useState({});
  const [sessionId, setSessionId] = useState('');
  const [batteryInfo, setBatteryInfo] = useState({});
  const [location, setLocation] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const [sessionHistory, setSessionHistory] = useState([]);

  // Lấy thông tin thiết bị và lưu session
  const fetchInfo = async () => {
    const info = await Device.getInfo();
    setDeviceInfo(info);

    const netStatus = await Network.getStatus();
    setNetworkStatus(netStatus);

    const app = await App.getInfo();
    setAppInfo(app);

    const battery = await Device.getBatteryInfo();
    setBatteryInfo(battery);

    try {
      const pos = await Geolocation.getCurrentPosition();
      setLocation(pos.coords);
    } catch (e) {
      setLocation({});
    }

    // Sinh session mới và lưu vào lịch sử
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);

    // Lưu vào localStorage
    const history = JSON.parse(localStorage.getItem(SESSION_HISTORY_KEY) || '[]');
    const newHistory = [
      { sessionId: newSessionId, time: new Date().toLocaleString() },
      ...history
    ].slice(0, 10); // Lưu tối đa 10 phiên gần nhất
    localStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(newHistory));
    setSessionHistory(newHistory);
  };

  // Lấy lịch sử khi load lần đầu
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem(SESSION_HISTORY_KEY) || '[]');
    setSessionHistory(history);
    fetchInfo();
    const handler = Network.addListener('networkStatusChange', status => {
      setNetworkStatus(status);
    });
    return () => {
      handler.remove();
    };
    // eslint-disable-next-line
  }, []);

  const handleShare = async () => {
    const content = `
      Model: ${deviceInfo.model}
      OS: ${deviceInfo.operatingSystem} ${deviceInfo.osVersion}
      App Version: ${appInfo.version}
      Network: ${networkStatus.connectionType} (${networkStatus.connected ? 'Connected' : 'Disconnected'})
      Battery: ${batteryInfo.batteryLevel ? (batteryInfo.batteryLevel * 100).toFixed(0) : '--'}% ${batteryInfo.isCharging ? '(Charging)' : ''}
      Location: ${location.latitude}, ${location.longitude}
      Session ID: ${sessionId}
    `;
    await Share.share({
      title: 'Device Info',
      text: content,
    });
  };

  const toggleTheme = () => setDarkMode(!darkMode);

  // Tạo giá trị QR code
  const qrValue = JSON.stringify({
    model: deviceInfo.model,
    os: deviceInfo.operatingSystem,
    osVersion: deviceInfo.osVersion,
    appVersion: appInfo.version,
    network: networkStatus.connectionType,
    battery: batteryInfo.batteryLevel,
    location: location.latitude ? `${location.latitude},${location.longitude}` : '',
    sessionId: sessionId,
  });

  return (
    <div className={`dashboard-container${darkMode ? ' dark' : ''}`}>
      <div className="dashboard-card">
        <h2>📱 Device Dashboard</h2>
        <ul className="dashboard-list">
          <li>🛠️ <b>Model:</b> {deviceInfo.model}</li>
          <li>💻 <b>OS:</b> {deviceInfo.operatingSystem} {deviceInfo.osVersion}</li>
          <li>📦 <b>App Version:</b> {appInfo.version}</li>
          <li>🌐 <b>Network:</b> {networkStatus.connectionType} ({networkStatus.connected ? 'Connected' : 'Disconnected'})</li>
          <li>🔋 <b>Battery:</b> {batteryInfo.batteryLevel ? (batteryInfo.batteryLevel * 100).toFixed(0) : '--'}% {batteryInfo.isCharging ? '(Charging)' : ''}</li>
          <li>📍 <b>Location:</b> {location.latitude ? `${location.latitude}, ${location.longitude}` : 'N/A'}</li>
          <li>🆔 <b>Session ID:</b> {sessionId}</li>
        </ul>

        {/* Hiển thị QR Code */}
        <div className="qr-section">
          <div className="qr-box">
            <QRCodeCanvas
              value={qrValue}
              size={128}
              bgColor={darkMode ? "#232526" : "#fff"}
              fgColor={darkMode ? "#40c9ff" : "#1976d2"}
            />
          </div>
          <div className="qr-label">QR Code thiết bị</div>
        </div>

        {/* Hiển thị lịch sử các phiên */}
        <div className="session-history">
          <h4>🕒 Lịch sử phiên gần đây</h4>
          <ul>
            {sessionHistory.length === 0 && <li>Chưa có lịch sử</li>}
            {sessionHistory.map((s, idx) => (
              <li key={idx}>
                <span style={{ fontWeight: 'bold' }}>{s.sessionId}</span> <span style={{ color: '#888' }}>({s.time})</span>
              </li>
            ))}
          </ul>
        </div>

        <button className="share-btn" onClick={handleShare}>📤 Chia sẻ thông tin</button>
        <button className="refresh-btn" onClick={fetchInfo}>🔄 Làm mới</button>
        <button className="theme-btn" onClick={toggleTheme}>{darkMode ? '☀️ Sáng' : '🌙 Tối'}</button>
      </div>
    </div>
  );

  
};

export default DeviceDashboard;