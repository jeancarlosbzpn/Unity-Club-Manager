const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

const isDev = !app.isPackaged; // Dynamic check: true when running with 'electron .', false when packaged

// Add simple menu for Mac to ensure Copy/Paste and Quit work
if (process.platform === 'darwin') {
    const template = [
        {
            label: app.name,
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'selectAll' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        }
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}
const DATA_FILE = path.join(app.getPath('userData'), 'vencedores-data.json');

console.log('App:', app ? 'Defined' : 'Undefined');

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            webviewTag: true,
            backgroundThrottling: false
        }
    });

    if (isDev) {
        win.loadURL('http://localhost:5173');
        // win.webContents.openDevTools(); // Disabled for production feel
    } else {
        win.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('Failed to load:', errorCode, errorDescription);
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    app.quit();
});

ipcMain.handle('read-data', async () => {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(data);
        }
        return {};
    } catch (error) {
        console.error('Error reading data:', error);
        return { error: error.message };
    }
});

ipcMain.handle('write-data', async (event, data) => {
    try {
        // Create backup if file exists
        if (fs.existsSync(DATA_FILE)) {
            try {
                fs.copyFileSync(DATA_FILE, DATA_FILE + '.bak');
                // Also create a timestamped backup on app start (logic could be added elsewhere, 
                // but for now strict 1-level backup is infinitely better than none)
            } catch (backupError) {
                console.error('Failed to create backup:', backupError);
                // We proceed with write even if backup fails? 
                // Better to log it clearly. For critical safety, maybe we shouldn't?
                // For now, proceed but log heavily.
            }
        }

        const tempFilePath = DATA_FILE + '.tmp';
        fs.writeFileSync(tempFilePath, JSON.stringify(data, null, 2));
        fs.renameSync(tempFilePath, DATA_FILE);
        console.log(`Saved to ${DATA_FILE}`);
        return { success: true };
    } catch (error) {
        console.error('Error writing data:', error);
        return { error: error.message };
    }
});
