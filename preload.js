const { contextBridge, ipcRenderer } = require('electron')
contextBridge.exposeInMainWorld('electronAPI', {
    onPortOpen: (msg) => ipcRenderer.send('onPortOpen',msg), //close secondary browser window
    onPortOccupied: (msg) => ipcRenderer.send('onPortOccupied',msg), //open secondary browser window
    sendURL: (url) => ipcRenderer.send('sendURL',url),
    sendWebURL: (res) => ipcRenderer.send('sendWebURL',res),
    createCodeBlock:(res) => ipcRenderer.send('createCodeBlock',res),
    startCodeBlock: (res) => ipcRenderer.send('startCodeBlock',res),
    stopCodeBlock: (res) => ipcRenderer.send('stopCodeBlock',res),
    processUserLogin: (res) => ipcRenderer.send('processUserLogin',res),
    sendKeyCloakToken: (res) => ipcRenderer.send('sendKeyCloakToken',res)
})
