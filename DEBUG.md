# 🔧 Debug Guide - JP Vocab Extension

## ❓ Không thấy toolbar?

### Bước 1: Kiểm tra Extension đã load
1. Mở **Chrome Extensions** (`chrome://extensions/`)
2. Đảm bảo **Developer mode** ON
3. **Reload** extension nếu cần

### Bước 2: Kiểm tra Console
1. **F12** → **Console** tab
2. Tìm messages:
   ```
   ✅ JP Vocab Extension Loaded
   🔧 Initializing JP Vocab Highlighter UI...
   ✅ Toolbar created
   ```
3. Nếu có lỗi màu đỏ → Copy và báo lỗi

### Bước 3: Manual Debug
Trong Console, chạy:
```javascript
// Kiểm tra toolbar có tồn tại không
document.getElementById('jp-vocab-toolbar')

// Force hiện toolbar debug
forceShowToolbar()

// Kiểm tra từ vựng đã lưu
chrome.storage.local.get('words', console.log)
```

### Bước 4: Visual Check
- **Toolbar** nên hiện ở **góc dưới trái** 
- **Background trắng**, **border xám**
- **2 buttons**: "🔄 Connected" + "⚙️"

## 🎯 Test Functions

### Thêm từ vựng test:
1. **Bôi đen** text trên trang
2. **Ctrl + Enter** hoặc **H-H-H** (3 lần)
3. Text nên được **highlight vàng**

### Test Firebase Sync:
1. **Click ⚙️** → **Upload to Firebase**
2. **Click ⚙️** → **Download from Firebase**
3. Check console cho status messages

## 🚨 Common Issues

### Issue 1: Extension không load
- **Solution**: Reload extension trong Chrome Extensions

### Issue 2: Toolbar không hiện
- **Check**: Console có lỗi không?
- **Try**: `forceShowToolbar()` 
- **Check**: Trang web có CSP chặn không?

### Issue 3: Firebase không connect
- **Check**: File `.env` có đúng config không?
- **Check**: Internet connection
- **Try**: Click "🔄" button xem status

### Issue 4: Highlight không hoạt động  
- **Check**: Có từ vựng trong storage không: `chrome.storage.local.get('words', console.log)`
- **Try**: Reload trang
- **Try**: Thêm từ vựng mới

## 📞 Debug Commands

```javascript
// Show all debug info
console.log("Extension status:", {
  toolbar: document.getElementById('jp-vocab-toolbar'),
  highlight: typeof window.highlightAll,
  firebase: typeof window.firebaseSync
});

// Show stored words
chrome.storage.local.get(['words', 'syncEnabled', 'deviceId'], console.log);

// Force show toolbar
forceShowToolbar();

// Test highlight
if (window.highlightAll) highlightAll();

// Test firebase sync info
if (window.firebaseSync) window.firebaseSync.showSyncInfo();
```

## 🎨 Expected UI Layout

```
Bottom-left của trang web:
┌─────────────────────────┐
│ 🔄 Connected    ⚙️      │ ← Main toolbar
└─────────────────────────┘
                 │
                 ▼ (Click ⚙️)
         ┌─────────────────────────┐
         │ ⬆️ Upload to Firebase    │
         │ ⬇️ Download from Firebase│ ← Dropdown menu
         │ 📄 Export file          │
         │ 📁 Import file          │
         └─────────────────────────┘
```