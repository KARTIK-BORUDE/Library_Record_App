const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const XLSX = require('@e965/xlsx');
const fs = require('fs');

let folderPath;
let excel_path;
let win;

/* ===============================
   In-memory cache
================================ */
let booksCache = [];

/* ===============================
   Excel setup
================================ */
function createExcelIfNotExists() {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    if (!fs.existsSync(excel_path)) {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet([]);
        XLSX.utils.book_append_sheet(wb, ws, 'Books');
        XLSX.writeFile(wb, excel_path);
    }
}

function loadBooksIntoCache() {
    const wb = XLSX.readFile(excel_path);
    const ws = wb.Sheets['Books'];
    booksCache = XLSX.utils.sheet_to_json(ws);
}

function saveCacheToExcel() {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(booksCache);
    XLSX.utils.book_append_sheet(wb, ws, 'Books');
    XLSX.writeFile(wb, excel_path);
}

/* ===============================
   Window
================================ */
function createWindow() {
    win = new BrowserWindow({
        width: 1200,
        height: 800,
        show: false,
        autoHideMenuBar: true,
        icon: path.join(__dirname, 'Assets', 'images', 'logo.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'Assets', 'js', 'preload.js')
        }
    });

    win.loadFile(path.join(__dirname, 'renderer', 'index.html'));

    win.once('ready-to-show', () => {
        win.maximize();
        win.show();

        // // Open DevTools in development mode for debugging
        // if (!app.isPackaged) {
        //     win.webContents.openDevTools();
        // }
    });

    if (app.isPackaged) {
        win.webContents.on('devtools-opened', () => {
            win.webContents.closeDevTools();
        });
    }
}

/* ===============================
   App ready
================================ */
app.whenReady().then(() => {
    folderPath = path.join(app.getPath('documents'), 'Library');
    excel_path = path.join(folderPath, 'books.xlsx');

    createExcelIfNotExists();
    loadBooksIntoCache(); // ✅ LOAD ONLY ONCE
    createWindow();
});

/* ===============================
   IPC: Add Book (NO FREEZE)
================================ */
ipcMain.handle('Add-Book', async (event, book) => {
    try {
        const nextIndex =
            booksCache.length > 0
                ? Math.max(...booksCache.map(b => Number(b.Index) || 0)) + 1
                : 1;

        booksCache.push({ Index: nextIndex, ...book });

        saveCacheToExcel(); // ✅ write once

        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false };
    }
});

/* ===============================
   IPC: Get All Books (INSTANT)
================================ */
ipcMain.handle('Get-All-Books', async () => {
    return booksCache;
});

/* ===============================
   IPC: Delete Book (NO FREEZE)
================================ */
ipcMain.handle('Delete-Book', async (event, ac_id) => {
    try {
        booksCache = booksCache.filter(
            book => String(book.Assession_Number) !== String(ac_id)
        );

        saveCacheToExcel();

        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
});

/* ===============================
   Quit
================================ */
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
