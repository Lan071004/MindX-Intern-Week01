import './polyfills';

import * as appInsights from 'applicationinsights'; // Application Insights phải init ngay sau polyfills, trước khi import bất kỳ module nào khác để đảm bảo tất cả telemetry đều được track
appInsights.setup().start();
const client = appInsights.defaultClient; // Lưu client để dùng cho custom tracking

import dotenv from 'dotenv';
dotenv.config();

import './adapters/outbound/firebase/firebaseAdmin'; // Khởi tạo Firebase Admin (phải chạy trước khi server xử lý request)

import { createApp } from './server'; // Import app factory từ server.ts (tách biệt hoàn toàn với infrastructure)

const PORT = process.env.PORT || 3000;

const app = createApp(client); // Truyền appInsights client vào app để track metrics/exceptions

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});