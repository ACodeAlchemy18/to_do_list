import { app, BrowserWindow, ipcMain, Tray, Menu, Notification, nativeImage } from 'electron';
import path from 'path';
import { MissionControlDB } from './database/db';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let db: MissionControlDB | null = null;
let isAlwaysOnTop = false;

// Simple store for window bounds
const storeData: Record<string, any> = {};

function createWindow() {
  db = new MissionControlDB();

  const width = storeData['windowWidth'] || 1200;
  const height = storeData['windowHeight'] || 800;
  const x = storeData['windowX'];
  const y = storeData['windowY'];

  mainWindow = new BrowserWindow({
    width,
    height,
    x,
    y,
    minWidth: 420,
    minHeight: 600,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
    icon: path.join(__dirname, '../public/favicon.svg'),
  });

  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Save window bounds on move or resize
  const saveBounds = () => {
    if (!mainWindow) return;
    const bounds = mainWindow.getBounds();
    storeData['windowWidth'] = bounds.width;
    storeData['windowHeight'] = bounds.height;
    storeData['windowX'] = bounds.x;
    storeData['windowY'] = bounds.y;
  };

  mainWindow.on('resize', saveBounds);
  mainWindow.on('move', saveBounds);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  // Create simple icon for system tray
  const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`;
  const iconBuffer = Buffer.from(iconSvg);
  const trayIcon = nativeImage.createFromBuffer(iconBuffer);

  tray = new Tray(trayIcon);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Mission Control',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    {
      label: 'Toggle Always On Top',
      type: 'checkbox',
      checked: isAlwaysOnTop,
      click: (item) => {
        isAlwaysOnTop = item.checked;
        if (mainWindow) {
          mainWindow.setAlwaysOnTop(isAlwaysOnTop);
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setToolTip('Mission Control Desktop');
  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// --- IPC HANDLERS ---
ipcMain.handle('db:getTasks', () => db?.getTasks());
ipcMain.handle('db:createTask', (_, task) => db?.createTask(task));
ipcMain.handle('db:updateTask', (_, task) => db?.updateTask(task));
ipcMain.handle('db:deleteTask', (_, id) => db?.deleteTask(id));

ipcMain.handle('db:getMissions', () => db?.getMissions());
ipcMain.handle('db:createMission', (_, mission) => db?.createMission(mission));
ipcMain.handle('db:updateMission', (_, mission) => db?.updateMission(mission));
ipcMain.handle('db:deleteMission', (_, id) => db?.deleteMission(id));

ipcMain.handle('db:getHabits', () => db?.getHabits());
ipcMain.handle('db:createHabit', (_, habit) => db?.createHabit(habit));
ipcMain.handle('db:toggleHabitToday', (_, habitId, completedDate) => db?.toggleHabitToday(habitId, completedDate));

ipcMain.handle('db:addFocusSession', (_, session) => db?.addFocusSession(session));
ipcMain.handle('db:getFocusSessions', () => db?.getFocusSessions());

ipcMain.handle('db:getSettings', () => db?.getSettings());
ipcMain.handle('db:updateSetting', (_, key, value) => {
  if (key === 'autoStart') {
    app.setLoginItemSettings({ openAtLogin: !!value });
  }
  return db?.updateSetting(key, value);
});

ipcMain.handle('db:performDailyResetIfNeeded', () => db?.performDailyResetIfNeeded());
ipcMain.handle('db:getWeeklyStats', () => db?.getWeeklyStats());

// Window Management
ipcMain.on('window:minimize', () => mainWindow?.minimize());
ipcMain.on('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});
ipcMain.on('window:close', () => mainWindow?.hide());

ipcMain.handle('window:toggleAlwaysOnTop', (_, flag) => {
  isAlwaysOnTop = flag !== undefined ? flag : !isAlwaysOnTop;
  mainWindow?.setAlwaysOnTop(isAlwaysOnTop);
  return isAlwaysOnTop;
});

ipcMain.handle('window:toggleWidgetMode', (_, flag) => {
  if (!mainWindow) return false;
  if (flag) {
    mainWindow.setSize(440, 720);
  } else {
    mainWindow.setSize(1200, 800);
  }
  return flag;
});

ipcMain.on('app:notification', (_, title, body) => {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show();
  }
});
