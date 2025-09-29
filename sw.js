// Service Worker for PWA functionality
const CACHE_NAME = 'plan-manager-v2.0.0';
const urlsToCache = [
  './',
  './index.html',
  './day_plan.html',
  './week_plan.html',
  './month_plan.html',
  './quarter_plan.html',
  './halfyear_plan.html',
  './year_plan.html',
  './habit_tracker.html',
  './reflection_template.html',
  './mood_tracker.html',
  './gratitude_diary.html',
  './monthly_schedule.html',
  './sync-settings.html',
  './firebase-status.html',
  './one-click-sync.html',
  './style.css',
  './mobile-styles.css',
  './common.js',
  './day_plan.js',
  './week_plan.js',
  './firebase-database-sync.js',
  './universal-cloud-sync.js',
  './auto-cloud-sync.js',
  './config.js',
  './manifest.json'
];

// 安装 Service Worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('缓存已打开');
        // 逐个添加资源到缓存，避免因单个资源失败导致整体失败
        return Promise.allSettled(
          urlsToCache.map(url => 
            cache.add(url).catch(error => {
              console.warn(`无法缓存资源 ${url}:`, error);
              return null; // 忽略单个失败
            })
          )
        );
      })
      .then(results => {
        const successful = results.filter(result => result.status === 'fulfilled').length;
        const failed = results.filter(result => result.status === 'rejected').length;
        console.log(`缓存完成: ${successful} 个成功, ${failed} 个失败`);
      })
      .catch(error => {
        console.error('Service Worker 安装失败:', error);
      })
  );
});

// 拦截请求 - 网络优先策略
self.addEventListener('fetch', function(event) {
  // 对于 HTML 文件，始终尝试从网络获取最新版本
  if (event.request.destination === 'document' || 
      event.request.url.endsWith('.html') ||
      event.request.url.includes('.html')) {
    
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // 网络请求成功，更新缓存
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseClone))
              .catch(error => console.warn('缓存更新失败:', error));
          }
          return response;
        })
        .catch(error => {
          console.warn('网络请求失败，尝试缓存:', error);
          // 网络失败时才使用缓存
          return caches.match(event.request);
        })
    );
  } else {
    // 对于其他资源（CSS、JS、图片等），使用缓存优先策略
    event.respondWith(
      caches.match(event.request)
        .then(function(response) {
          // 如果缓存中有响应，则返回缓存的版本
          if (response) {
            return response;
          }

          return fetch(event.request).then(function(response) {
            // 检查是否收到有效响应
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 克隆响应
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              })
              .catch(error => {
                console.warn('无法缓存响应:', error);
              });

            return response;
          }).catch(error => {
            console.warn('网络请求失败:', error);
            // 尝试返回缓存的版本或离线页面
            return caches.match('./index.html');
          });
        })
        .catch(error => {
          console.error('缓存匹配失败:', error);
          return fetch(event.request).catch(() => {
            return new Response('网络错误', { status: 408 });
          });
        })
    );
  }
});

// 更新 Service Worker
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 后台同步
self.addEventListener('sync', function(event) {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // 执行后台同步逻辑
      syncData()
    );
  }
});

// 推送通知
self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: './icons/icon-192x192.png',
      badge: './icons/icon-72x72.png',
      tag: 'plan-reminder',
      renotify: true,
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: '查看',
          icon: './icons/view-icon.png'
        },
        {
          action: 'dismiss',
          title: '忽略',
          icon: './icons/dismiss-icon.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// 处理通知点击
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('./')
    );
  }
});

// 数据同步函数
async function syncData() {
  try {
    // 这里实现与Google Drive的数据同步
    console.log('执行后台数据同步');
    
    // 获取本地待同步数据
    const pendingData = await getLocalPendingData();
    
    if (pendingData.length > 0) {
      // 同步到Google Drive
      await syncToGoogleDrive(pendingData);
      
      // 清除本地待同步标记
      await clearPendingData();
      
      console.log('后台同步完成');
    }
  } catch (error) {
    console.error('后台同步失败:', error);
  }
}

async function getLocalPendingData() {
  // 实现获取本地待同步数据的逻辑
  return [];
}

async function syncToGoogleDrive(data) {
  // 实现同步到Google Drive的逻辑
  console.log('同步数据到Google Drive:', data);
}

async function clearPendingData() {
  // 实现清除本地待同步标记的逻辑
  console.log('清除本地待同步数据');
}
