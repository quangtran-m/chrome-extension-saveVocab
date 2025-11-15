# JP Vocab Highlighter với Firebase Sync

Extension Chrome để highlight và đồng bộ từ vựng tiếng Nhật trên nhiều thiết bị.

## 🔥 Tính năng mới: Firebase Sync

- ✅ Đồng bộ từ vựng trên nhiều thiết bị
- ✅ Realtime sync - tự động cập nhật khi có thay đổi từ thiết bị khác
- ✅ Anonymous authentication - không cần đăng ký tài khoản
- ✅ Backup tự động lên cloud

## 🚀 Cách setup Firebase

### 1. Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" hoặc "Tạo dự án"
3. Đặt tên project (ví dụ: "jp-vocab-highlighter")
4. Tắt Google Analytics (không cần thiết)
5. Click "Create project"

### 2. Setup Authentication

1. Trong Firebase Console, vào **Authentication**
2. Click **Get started**
3. Vào tab **Sign-in method**
4. Enable **Anonymous** authentication
5. Click **Save**

### 3. Setup Realtime Database

1. Vào **Realtime Database** 
2. Click **Create Database**
3. Chọn location (asia-southeast1 cho VN)
4. Chọn **Start in test mode** 
5. Click **Enable**

### 4. Lấy Firebase Config

1. Vào **Project Settings** (icon gear)
2. Scroll xuống **Your apps**
3. Click **Web app icon** (</>) 
4. Đặt app name (ví dụ: "JP Vocab Web")
5. Click **Register app**
6. Copy **Firebase configuration object**

### 5. Cấu hình Environment Variables

1. Copy file `.env.example` thành `.env`:
   ```bash
   cp .env.example .env
   ```

2. Mở file `.env` và thay thế các giá trị:
   ```env
   FIREBASE_API_KEY=AIzaSyC...  # Từ Firebase config
   FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.region.firebasedatabase.app
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
   FIREBASE_MESSAGING_SENDER_ID=123456789
   FIREBASE_APP_ID=1:123456789:web:abcdef123456
   ```

**⚠️ Quan trọng**: File `.env` chứa thông tin nhạy cảm và đã được thêm vào `.gitignore`

### 6. Cài đặt Extension

1. Mở Chrome -> Extensions -> Developer mode ON
2. Click "Load unpacked" 
3. Chọn thư mục chứa extension này
4. Extension sẽ được cài đặt với icon JP Vocab Highlighter

## 🎯 Cách sử dụng Sync

### Bật đồng bộ:
1. Trên bất kỳ trang web nào, nhìn xuống góc dưới trái
2. Click nút **"☁️ Sync Off"**  
3. Click **"Bật đồng bộ"**
4. Nút sẽ chuyển thành **"☁️ Sync On"** màu xanh

### Các tính năng sync:
- **Tự động**: Mỗi khi thêm/xóa từ vựng sẽ tự động sync
- **Realtime**: Từ vựng từ thiết bị khác sẽ tự động hiển thị
- **Đồng bộ ngay**: Click "Đồng bộ ngay" để force sync
- **Tắt sync**: Click "Tắt đồng bộ" để ngưng sync

## 🎮 Hotkeys (không đổi)

- **Triple H**: Nhấn H 3 lần liên tiếp để thêm text được bôi đen
- **Ctrl + Enter**: Thêm text được bôi đen 
- **Ctrl + Backspace**: Xóa text được bôi đen
- **Click từ highlight**: Copy + hiện nút xóa

## 🔧 Troubleshooting

### Sync không hoạt động:
1. Kiểm tra Firebase config trong `firebase-config.js`
2. Kiểm tra Authentication có enable Anonymous chưa
3. Kiểm tra Realtime Database có được tạo chưa
4. Mở Developer Tools để xem lỗi console

### Lỗi CORS:
- Firebase scripts được load từ CDN, đảm bảo có internet
- Kiểm tra `host_permissions` trong `manifest.json`

### Data không sync:
1. Đảm bảo cả 2 thiết bị đều bật sync
2. Kiểm tra cùng Firebase project
3. Click "Đồng bộ ngay" để force sync

## 📊 Database Structure

```
users/
  {userUID}/
    words/
      words: ["từ1", "từ2", ...]
      lastUpdated: timestamp
      deviceId: "device_xxx"
```

## 🔒 Security

- Sử dụng Anonymous Auth - không cần thông tin cá nhân
- Database rules test mode - chỉ dùng cho development
- Để production cần setup security rules phù hợp

## 📝 Changelog v1.4

- ✅ Added Firebase sync functionality
- ✅ Added sync controls in UI
- ✅ Added realtime sync across devices  
- ✅ Added sync status notifications
- ✅ Updated manifest for Firebase permissions
- ✅ Improved highlight refresh logic
- ✅ Environment variables support for secure config
- ✅ Ready for GitHub deployment

## 🚀 GitHub Deployment

### Quick Setup:
```bash
# Clone và setup
git clone <your-repo-url>
cd jp-vocab-highlighter
chmod +x setup.sh
./setup.sh

# Edit .env with your Firebase config
nano .env

# Commit changes (env is gitignored)
git add .
git commit -m "Initial setup"
git push origin main
```

### Files Structure:
```
jp-vocab-highlighter/
├── .env                 # Your Firebase config (gitignored)
├── .env.example        # Template for Firebase config
├── .gitignore          # Git ignore rules
├── manifest.json       # Extension manifest
├── env-loader.js       # Environment loader
├── firebase-config.js  # Firebase configuration
├── firebase-sync.js    # Sync functionality
├── content.js          # Main extension logic
├── setup.sh           # Auto setup script
└── README.md          # This file
```

### Security Notes:
- ✅ `.env` file is automatically gitignored
- ✅ No sensitive data in source code
- ✅ Template provided for easy setup
- ✅ REST API used (no external script loading)