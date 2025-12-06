const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const XLSX = require('@e965/xlsx');
const fs = require('fs');

let folderPath;
let excel_path;
let win;

/* ---------- Excel Setup ---------- */
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

/* ---------- Window ---------- */
function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        icon: path.join(__dirname, 'Assets/images/logo.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'Assets/js/preload.js')
        }
    });

    win.loadFile(path.join(__dirname, './renderer/index.html'));

    win.once('ready-to-show', () => {
        win.maximize();
        win.show();
    });

    win.removeMenu();

    if (app.isPackaged) {
        win.webContents.on('devtools-opened', () => {
            win.webContents.closeDevTools();
        });
    }
}

/* ---------- App Ready ---------- */
app.whenReady().then(() => {
    folderPath = path.join(app.getPath('documents'), 'Library');
    excel_path = path.join(folderPath, 'books.xlsx');
    console.log('MODE:', app.isPackaged ? 'PACKAGED' : 'DEV');
    console.log('Excel Path:', excel_path);

    createExcelIfNotExists();
    createWindow();
});

/* ---------- IPC: Add Book ---------- */
ipcMain.handle('Add-Book', async (event, book) => {
    try {
        createExcelIfNotExists();

        const wb = XLSX.readFile(excel_path);
        const ws = wb.Sheets['Books'];
        const data = XLSX.utils.sheet_to_json(ws);

        const nextIndex =
            data.length > 0
                ? Math.max(...data.map(b => Number(b.Index) || 0)) + 1
                : 1;

        data.push({ Index: nextIndex, ...book });

        wb.Sheets['Books'] = XLSX.utils.json_to_sheet(data);
        XLSX.writeFile(wb, excel_path);

        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false };
    }
});

/* ---------- IPC: Get All Books ---------- */
ipcMain.handle('Get-All-Books', async () => {
    try {
        createExcelIfNotExists();

        const wb = XLSX.readFile(excel_path);
        const ws = wb.Sheets['Books'];
        return XLSX.utils.sheet_to_json(ws);
    } catch (error) {
        console.error(error);
        return [];
    }
});

/* ---------- IPC: Delete Book ---------- */
ipcMain.handle('Delete-Book', async (event, ac_id) => {
    try {
        const wb = XLSX.readFile(excel_path);
        const ws = wb.Sheets['Books'];

        let data = XLSX.utils.sheet_to_json(ws);
        data = data.filter(
            book => String(book.Assession_Number) !== String(ac_id)
        );

        wb.Sheets['Books'] = XLSX.utils.json_to_sheet(data);
        XLSX.writeFile(wb, excel_path);

        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
});

/* ---------- Quit ---------- */
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
