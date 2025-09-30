# 🔥 Firebase匿名登录配置指南

## ⚠️ 当前问题
错误：`FirebaseError: Firebase: Error (auth/configuration-not-found)`

## 📋 解决步骤

### 1️⃣ 启用Firebase匿名登录

1. 访问Firebase控制台：
   ```
   https://console.firebase.google.com/project/plan-web-b0c39
   ```

2. 点击左侧菜单 "Authentication"（身份验证）

3. 点击 "Sign-in method"（登录方法）标签

4. 找到 "Anonymous"（匿名）选项

5. 点击右侧的编辑按钮（铅笔图标）

6. **启用**匿名登录开关

7. 点击"保存"

### 2️⃣ 配置Firestore数据库规则

1. 在Firebase控制台，点击 "Firestore Database"

2. 点击 "规则"（Rules）标签

3. 将规则修改为：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 允许所有用户读写planData集合
    match /planData/{document=**} {
      allow read, write: if true;
    }
  }
}
```

4. 点击"发布"

---

## 🎯 完成后效果

配置完成后，网站将能够：
- ✅ 自动匿名登录
- ✅ 跨设备数据同步
- ✅ 实时保存和恢复数据

---

## ⏰ 预计时间
配置只需2-3分钟即可完成
