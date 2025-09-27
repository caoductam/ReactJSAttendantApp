import React, { useEffect, useState } from 'react';
import { Network } from '@capacitor/network';

const DeviceNetworkInfo = () => {
  const [networkStatus, setNetworkStatus] = useState({});
  const [ip, setIp] = useState('');
  const [speed, setSpeed] = useState(null);

  // Lấy thông tin mạng
  const fetchNetworkInfo = async () => {
    const status = await Network.getStatus();
    setNetworkStatus(status);

    // Lấy IP public
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      setIp(data.ip);
    } catch (e) {
      setIp('Không xác định');
    }

    // Đo tốc độ mạng (tùy chọn)
    try {
      const start = Date.now();
      await fetch('https://speed.hetzner.de/100MB.bin', { method: 'HEAD' }); // file nhỏ, chỉ HEAD
      const end = Date.now();
      const duration = (end - start) / 1000; // giây
      // Giả sử file 100MB, HEAD chỉ lấy header nên tốc độ này chỉ là ước lượng
      setSpeed(duration < 1 ? '>100 Mbps' : '<10 Mbps');
    } catch (e) {
      setSpeed('Không xác định');
    }
  };

  useEffect(() => {
    fetchNetworkInfo();
    // Lắng nghe sự kiện thay đổi mạng
    const handler = Network.addListener('networkStatusChange', status => {
      setNetworkStatus(status);
      fetchNetworkInfo();
    });
    return () => {
      handler.remove();
    };
    // eslint-disable-next-line
  }, []);

  return (
    <div className="network-info-card">
      <h3>🌐 Thông tin mạng</h3>
      <ul>
        <li>
          <b>Loại kết nối:</b> {networkStatus.connectionType || 'Đang kiểm tra...'}
        </li>
        <li>
          <b>Trạng thái:</b> {networkStatus.connected ? 'Đã kết nối' : 'Mất kết nối'}
        </li>
        <li>
          <b>Địa chỉ IP:</b> {ip || 'Đang kiểm tra...'}
        </li>
        <li>
          <b>Tốc độ mạng (ước lượng):</b> {speed || 'Đang kiểm tra...'}
        </li>
        {/* Nếu muốn hiển thị thêm nhà mạng, bạn cần native code hoặc plugin riêng */}
      </ul>
      <button onClick={fetchNetworkInfo} className="refresh-btn">🔄 Làm mới</button>
    </div>
  );
};

export default DeviceNetworkInfo;