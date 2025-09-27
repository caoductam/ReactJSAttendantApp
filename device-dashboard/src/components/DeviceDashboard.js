// import React, { useEffect, useState } from 'react';
// import { Device } from '@capacitor/device';
// import { Network } from '@capacitor/network';
// import { App } from '@capacitor/app';
// import { Share } from '@capacitor/share';
// import { Geolocation } from '@capacitor/geolocation';

// function generateSessionId() {
//   return Math.random().toString(36).substr(2, 9);
// }

// const DeviceDashboard = () => {
//   const [deviceInfo, setDeviceInfo] = useState({});
//   const [networkStatus, setNetworkStatus] = useState({});
//   const [appInfo, setAppInfo] = useState({});
//   const [sessionId, setSessionId] = useState('');
//   const [batteryInfo, setBatteryInfo] = useState({});
//   const [location, setLocation] = useState({});
//   const [darkMode, setDarkMode] = useState(false);

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

//     setSessionId(generateSessionId());
//   };

//   useEffect(() => {
//     fetchInfo();
//     const handler = Network.addListener('networkStatusChange', status => {
//       setNetworkStatus(status);
//     });
//     return () => {
//       handler.remove();
//     };
//   }, []);

//   const handleShare = async () => {
//     const content = `
//       Model: ${deviceInfo.model}
//       OS: ${deviceInfo.operatingSystem} ${deviceInfo.osVersion}
//       App Version: ${appInfo.version}
//       Network: ${networkStatus.connectionType} (${networkStatus.connected ? 'Connected' : 'Disconnected'})
//       Battery: ${batteryInfo.batteryLevel * 100}% ${batteryInfo.isCharging ? '(Charging)' : ''}
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
//           <li>🆔 <b>Session ID:</b> {sessionId}</li>
//         </ul>
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

function generateSessionId() {
  return Math.random().toString(36).substr(2, 9);
}

const DeviceDashboard = () => {
  const [deviceInfo, setDeviceInfo] = useState({});
  const [networkStatus, setNetworkStatus] = useState({});
  const [appInfo, setAppInfo] = useState({});
  const [sessionId, setSessionId] = useState('');
  const [batteryInfo, setBatteryInfo] = useState({});
  const [location, setLocation] = useState({});
  const [darkMode, setDarkMode] = useState(false);

  // Thông tin mạng chi tiết
  const [ip, setIp] = useState('');
  const [speed, setSpeed] = useState(null);

  // Lấy thông tin mạng chi tiết
  const fetchNetworkDetails = async () => {
    // Lấy IP public
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      setIp(data.ip);
    } catch (e) {
      setIp('Không xác định');
    }

    // Đo tốc độ mạng (ước lượng)
    try {
      const start = Date.now();
      await fetch('https://speed.hetzner.de/100MB.bin', { method: 'HEAD' });
      const end = Date.now();
      const duration = (end - start) / 1000;
      setSpeed(duration < 1 ? '>100 Mbps' : '<10 Mbps');
    } catch (e) {
      setSpeed('Không xác định');
    }
  };

  // Lấy toàn bộ thông tin
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

    setSessionId(generateSessionId());

    // Lấy chi tiết mạng
    fetchNetworkDetails();
  };

  useEffect(() => {
    fetchInfo();
    const handler = Network.addListener('networkStatusChange', status => {
      setNetworkStatus(status);
      fetchNetworkDetails();
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
      IP: ${ip}
      Speed: ${speed}
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

  return (
    <div className={`dashboard-container${darkMode ? ' dark' : ''}`}>
      <div className="dashboard-card">
        <h2>📱 Device Dashboard</h2>
        <ul className="dashboard-list">
          <li>🛠️ <b>Model:</b> {deviceInfo.model}</li>
          <li>💻 <b>OS:</b> {deviceInfo.operatingSystem} {deviceInfo.osVersion}</li>
          <li>📦 <b>App Version:</b> {appInfo.version}</li>
          <li>🌐 <b>Network:</b> {networkStatus.connectionType} ({networkStatus.connected ? 'Connected' : 'Disconnected'})</li>
          <li>🔢 <b>IP:</b> {ip || 'Đang kiểm tra...'}</li>
          <li>⚡ <b>Speed:</b> {speed || 'Đang kiểm tra...'}</li>
          <li>🔋 <b>Battery:</b> {batteryInfo.batteryLevel ? (batteryInfo.batteryLevel * 100).toFixed(0) : '--'}% {batteryInfo.isCharging ? '(Charging)' : ''}</li>
          <li>📍 <b>Location:</b> {location.latitude ? `${location.latitude}, ${location.longitude}` : 'N/A'}</li>
          <li>🆔 <b>Session ID:</b> {sessionId}</li>
        </ul>
        <button className="share-btn" onClick={handleShare}>📤 Chia sẻ thông tin</button>
        <button className="refresh-btn" onClick={fetchInfo}>🔄 Làm mới</button>
        <button className="theme-btn" onClick={toggleTheme}>{darkMode ? '☀️ Sáng' : '🌙 Tối'}</button>
      </div>
    </div>
  );
};

export default DeviceDashboard;