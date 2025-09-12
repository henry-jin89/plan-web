const { app, BrowserWindow, Menu, shell, dialog, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');

// 初始化electron-store
const store = new Store();

// 保持对window对象的全局引用，避免JavaScript对象被垃圾回收时，窗口被自动关闭
let mainWindow;

// 创建主窗口
function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hiddenInset', // macOS样式的标题栏
    show: false, // 先不显示，等加载完成后再显示
    icon: path.join(__dirname, 'assets', 'icon.png')
  });

  // 加载应用的index.html
  mainWindow.loadFile('index.html');

  // 当窗口准备好时显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // 开发模式下打开开发者工具
    if (process.env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools();
    }
  });

  // 当窗口被关闭时，取消引用window对象
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 处理外部链接
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // 设置菜单
  createMenu();
}

// 创建应用菜单
function createMenu() {
  const template = [
    {
      label: '计划管理器',
      submenu: [
        {
          label: '关于计划管理器',
          click: showAbout
        },
        { type: 'separator' },
        {
          label: '偏好设置...',
          accelerator: 'Cmd+,',
          click: showPreferences
        },
        { type: 'separator' },
        {
          label: '隐藏计划管理器',
          accelerator: 'Cmd+H',
          role: 'hide'
        },
        {
          label: '隐藏其他',
          accelerator: 'Cmd+Alt+H',
          role: 'hideothers'
        },
        {
          label: '显示全部',
          role: 'unhide'
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: 'Cmd+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        {
          label: '撤销',
          accelerator: 'Cmd+Z',
          role: 'undo'
        },
        {
          label: '重做',
          accelerator: 'Shift+Cmd+Z',
          role: 'redo'
        },
        { type: 'separator' },
        {
          label: '剪切',
          accelerator: 'Cmd+X',
          role: 'cut'
        },
        {
          label: '复制',
          accelerator: 'Cmd+C',
          role: 'copy'
        },
        {
          label: '粘贴',
          accelerator: 'Cmd+V',
          role: 'paste'
        },
        {
          label: '全选',
          accelerator: 'Cmd+A',
          role: 'selectall'
        }
      ]
    },
    {
      label: '视图',
      submenu: [
        {
          label: '重新加载',
          accelerator: 'Cmd+R',
          click: () => {
            if (mainWindow) {
              mainWindow.reload();
            }
          }
        },
        {
          label: '强制重新加载',
          accelerator: 'Cmd+Shift+R',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.reloadIgnoringCache();
            }
          }
        },
        {
          label: '开发者工具',
          accelerator: 'F12',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.toggleDevTools();
            }
          }
        },
        { type: 'separator' },
        {
          label: '实际大小',
          accelerator: 'Cmd+0',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.setZoomLevel(0);
            }
          }
        },
        {
          label: '放大',
          accelerator: 'Cmd+Plus',
          click: () => {
            if (mainWindow) {
              const currentZoom = mainWindow.webContents.getZoomLevel();
              mainWindow.webContents.setZoomLevel(currentZoom + 0.5);
            }
          }
        },
        {
          label: '缩小',
          accelerator: 'Cmd+-',
          click: () => {
            if (mainWindow) {
              const currentZoom = mainWindow.webContents.getZoomLevel();
              mainWindow.webContents.setZoomLevel(currentZoom - 0.5);
            }
          }
        },
        { type: 'separator' },
        {
          label: '全屏',
          accelerator: 'Ctrl+Cmd+F',
          click: () => {
            if (mainWindow) {
              mainWindow.setFullScreen(!mainWindow.isFullScreen());
            }
          }
        }
      ]
    },
    {
      label: '计划',
      submenu: [
        {
          label: '今日计划',
          accelerator: 'Cmd+1',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.executeJavaScript(`
                window.location.href = 'day_plan.html';
              `);
            }
          }
        },
        {
          label: '周计划',
          accelerator: 'Cmd+2',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.executeJavaScript(`
                window.location.href = 'week_plan.html';
              `);
            }
          }
        },
        {
          label: '月计划',
          accelerator: 'Cmd+3',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.executeJavaScript(`
                window.location.href = 'month_plan.html';
              `);
            }
          }
        },
        { type: 'separator' },
        {
          label: '习惯追踪',
          accelerator: 'Cmd+H',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.executeJavaScript(`
                window.location.href = 'habit_tracker.html';
              `);
            }
          }
        },
        {
          label: '反思模板',
          accelerator: 'Cmd+T',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.executeJavaScript(`
                window.location.href = 'reflection_template.html';
              `);
            }
          }
        }
      ]
    },
    {
      label: '窗口',
      submenu: [
        {
          label: '最小化',
          accelerator: 'Cmd+M',
          role: 'minimize'
        },
        {
          label: '关闭',
          accelerator: 'Cmd+W',
          role: 'close'
        },
        { type: 'separator' },
        {
          label: '前置所有窗口',
          role: 'front'
        }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '使用说明',
          click: showHelp
        },
        {
          label: '键盘快捷键',
          click: showShortcuts
        },
        { type: 'separator' },
        {
          label: '反馈问题',
          click: () => {
            shell.openExternal('https://github.com/plan-manager/plan-manager/issues');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// 显示关于对话框
function showAbout() {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: '关于计划管理器',
    message: '计划管理器',
    detail: `版本: 1.0.0
智能化多层级计划管理系统

功能特色：
• 日/周/月/季度/年度计划管理
• 智能习惯追踪分析
• AI助手建议优化
• 数据本地安全存储
• 美观现代的用户界面

© 2024 Plan Manager Team`,
    buttons: ['确定']
  });
}

// 显示偏好设置
function showPreferences() {
  // 这里可以创建一个偏好设置窗口
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: '偏好设置',
    message: '偏好设置功能即将推出',
    detail: '敬请期待更多个性化设置选项！',
    buttons: ['确定']
  });
}

// 显示帮助
function showHelp() {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: '使用说明',
    message: '计划管理器使用指南',
    detail: `快捷键：
• Cmd+1 - 打开今日计划
• Cmd+2 - 打开周计划  
• Cmd+3 - 打开月计划
• Cmd+H - 打开习惯追踪
• Cmd+T - 打开反思模板
• Cmd+S - 保存当前计划
• Cmd+R - 刷新页面

使用技巧：
• 使用AI助手获得智能建议
• 定期回顾和调整计划
• 坚持记录和反思
• 利用数据分析优化时间管理`,
    buttons: ['确定']
  });
}

// 显示快捷键
function showShortcuts() {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: '键盘快捷键',
    message: '常用快捷键',
    detail: `应用操作：
• Cmd+Q - 退出应用
• Cmd+W - 关闭窗口
• Cmd+M - 最小化窗口
• Cmd+, - 偏好设置

编辑操作：
• Cmd+Z - 撤销
• Cmd+Y - 重做
• Cmd+C - 复制
• Cmd+V - 粘贴
• Cmd+A - 全选

视图操作：
• Cmd+R - 重新加载
• Cmd+0 - 实际大小
• Cmd++ - 放大
• Cmd+- - 缩小
• F12 - 开发者工具`,
    buttons: ['确定']
  });
}

// 当Electron完成初始化并准备创建浏览器窗口时调用此方法
app.whenReady().then(() => {
  createWindow();

  // 在macOS上，当点击dock图标并且没有其他窗口打开时，重新创建窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 当所有窗口都关闭时退出应用
app.on('window-all-closed', () => {
  // 在macOS上，通常应用和它们的菜单栏会保持激活状态，直到用户使用Cmd + Q明确退出
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 在此文件中你可以包含应用程序剩余的所有主进程代码
// 也可以拆分成几个文件，然后用require导入

// IPC通信处理
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-app-name', () => {
  return app.getName();
});

// 数据存储处理
ipcMain.handle('store-get', (event, key) => {
  return store.get(key);
});

ipcMain.handle('store-set', (event, key, value) => {
  store.set(key, value);
});

ipcMain.handle('store-delete', (event, key) => {
  store.delete(key);
});

// 文件操作
ipcMain.handle('show-save-dialog', async () => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: '导出计划数据',
    defaultPath: `计划数据_${new Date().toISOString().split('T')[0]}.json`,
    filters: [
      { name: 'JSON文件', extensions: ['json'] },
      { name: '所有文件', extensions: ['*'] }
    ]
  });
  return result;
});

ipcMain.handle('show-open-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '导入计划数据',
    filters: [
      { name: 'JSON文件', extensions: ['json'] },
      { name: '所有文件', extensions: ['*'] }
    ],
    properties: ['openFile']
  });
  return result;
});
