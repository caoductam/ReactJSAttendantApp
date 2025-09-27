import React, { useEffect, useState } from 'react';
import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';
import { App } from '@capacitor/app';
import { Share } from '@capacitor/share';

function generateSessionId() {
  return Math.random().toString(36).substr(2, 9);
}

const DeviceDashboard = () => {
  const [deviceInfo, setDeviceInfo] = useState({});
  const [networkStatus, setNetworkStatus] = useState({});
  const [appInfo, setAppInfo] = useState({});
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    const fetchInfo = async () => {
      const info = await Device.getInfo();
      setDeviceInfo(info);

      const netStatus = await Network.getStatus();
      setNetworkStatus(netStatus);

      const app = await App.getInfo();
      setAppInfo(app);

      setSessionId(generateSessionId());
    };
    fetchInfo();

    const handler = Network.addListener('networkStatusChange', status => {
      setNetworkStatus(status);
    });

    return () => {
      handler.remove();
    };
  }, []);

  const handleShare = async () => {
    const content = `
      Model: ${deviceInfo.model}
      OS: ${deviceInfo.operatingSystem} ${deviceInfo.osVersion}
      App Version: ${appInfo.version}
      Network: ${networkStatus.connectionType} (${networkStatus.connected ? 'Connected' : 'Disconnected'})
      Session ID: ${sessionId}
    `;
    await Share.share({
      title: 'Device Info',
      text: content,
    });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h2>📱 Device Dashboard</h2>
        <ul className="dashboard-list">
          <li><span role="img" aria-label="model">🔧</span> <b>Model:</b> {deviceInfo.model}</li>
          <li><span role="img" aria-label="os">💻</span> <b>OS:</b> {deviceInfo.operatingSystem} {deviceInfo.osVersion}</li>
          <li><span role="img" aria-label="app">🗂️</span> <b>App Version:</b> {appInfo.version}</li>
          <li><span role="img" aria-label="network">🌐</span> <b>Network:</b> {networkStatus.connectionType} ({networkStatus.connected ? 'Connected' : 'Disconnected'})</li>
          <li><span role="img" aria-label="id">🆔</span> <b>Session ID:</b> {sessionId}</li>
        </ul>
        <button className="share-btn" onClick={handleShare}>📤 Chia sẻ thông tin</button>
      </div>
    </div>
  );
};

export default DeviceDashboard;