const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('excelAPI', {
    AddBook: (book) => ipcRenderer.invoke('Add-Book', book),
    DeleteBook: (ac_id) => ipcRenderer.invoke('Delete-Book', ac_id),
    GetAllBooks: () => ipcRenderer.invoke('Get-All-Books'),
})
