// Firebase Usage Optimization Recommendations
// Tối ưu hóa sử dụng Firebase cho Extension

## Vấn đề hiện tại:
1. Polling mỗi 30s → 288,000 requests/ngày với 100 users
2. Tải full data mỗi lần sync
3. Không có cache local
4. Không track data changes

## Giải pháp tối ưu:

### 1. Intelligent Polling (Giảm 70% requests)
```javascript
// Thay vì poll cố định 30s, dùng adaptive polling:
- Khi user active: 30s
- Khi user idle: 5 phút  
- Khi tab inactive: 15 phút
- Chỉ poll khi có thay đổi
```

### 2. Delta Sync (Giảm 90% bandwidth)
```javascript
// Chỉ sync phần thay đổi:
{
  "lastModified": timestamp,
  "changes": {
    "added": ["word1", "word2"],
    "deleted": ["word3"] 
  }
}
```

### 3. Local Caching
```javascript
// Cache local với timestamp:
- Chỉ download nếu server data mới hơn
- Offline mode với local storage
```

### 4. Batch Operations
```javascript
// Gom nhiều thay đổi trong 1 request:
- Debounce 5s cho multiple adds
- Queue changes khi offline
```

## Giới hạn Firebase Free Plan:

### Realtime Database:
- ✅ Storage: 1GB (đủ cho ~300k users với 3KB/user)
- ⚠️ Bandwidth: 10GB/tháng (nguy hiểm với polling frequency cao)
- ✅ Connections: 100 đồng thời (OK cho extension)

### Authentication:
- ✅ Monthly Active Users: 10,000 (rộng rãi)

## Monitoring cần thiết:
1. Track bandwidth usage qua Firebase Console
2. Monitor daily active users  
3. Set up alerts khi gần giới hạn

## Khi nào cần nâng cấp:
- Bandwidth > 8GB/tháng → Blaze Plan ($0.18/GB)
- Users > 8,000/tháng → Blaze Plan
- Cần real-time sync → Cloud Firestore + WebSockets