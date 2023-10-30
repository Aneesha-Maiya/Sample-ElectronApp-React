const { app, BrowserWindow, Menu, ipcMain, dialog, BrowserView 
,powerMonitor,screen} = require('electron')
const path = require('path');
const isDev = require('electron-is-dev');
let API_Response = require('./APIResponse.json');
const axios = require('axios');
const { clearTimeout, clearInterval } = require('timers');
const { electron } = require('process');
require("dotenv").config();
// const signalr = require('./wwwroot/lib/signalr/signalr')
const signalr = require('@microsoft/signalr')
//  function handleMessage(msg) {
//   console.log(msg)
//   return msg
// }
let portNum = ""
let curWindow = true
let mainWindow;
let appUrl = "http://localhost"
let secondaryWindow;
global.MenuItem1Label = ""
let idleThreshold = 60;
let mousePos1,mousePos2;
let x,y,z,w,interval,timeElapsed = 0
let isCodeBlockHalted = false
const baseURL = process.env.BASE_URL
let keycloakToken = null
// const connection = new signalR.HubConnectionBuilder()
//     .withUrl("/codehub")
//     .configureLogging(signalR.LogLevel.Information)
//     .build();
let connection = new signalr.HubConnectionBuilder()
    .withUrl(`${baseURL}codehub`)
    .build();
// async function start(){
//     try {
//         await connection.start();
//         console.log("SignalR Connected.");
//     } catch (err) {
//         console.log(err);
//         setTimeout(start, 5000);
//     }
// }
async function start() {
  try {
      await connection.start();
      console.log("SignalR Connected.");
  } catch (err) {
      console.log(err);
      setTimeout(start, 5000);
  }
};
start()
// const //startCodeBlock = async() => {
//   try {
// //Request structure 
//   const request = {
//     "codeBlockId": null,
//      "userId": null
//   }
//       await connection.invoke("//StartCodeBlock", request);
//   } catch (err) {
//       console.error(err);
// }
// }
// const //stopCodeBlock = async() => {
//   try {
// //Request structure 
//   const request = {
//     "codeBlockId": null,
//      "userId": null
//   }
//       await connection.invoke("//StopCodeBlock", request);
//   } catch (err) {
//       console.error(err);
// }
// }
// function resetTimer(){
//   clearInterval(timer)
//   currSec = 0
//   timer = setInterval(startIdleTimer,1000)
// }
// resetTimer()
// function startIdleTimer(){
//   currSec++
// }
// const connection = new signalR.HubConnectionBuilder()
//     .withUrl("#")
//     .configureLogging(signalR.LogLevel.Information)
//     .build();

// async function start() {
//     try {
//         await connection.start();
//         console.log("SignalR Connected.");
//     } catch (err) {
//         console.log(err);
//         setTimeout(start, 5000);
//     }
// };
let template1 = [
  {
    label: `Apps ${MenuItem1Label}`,
    submenu: [
      { label: 'Chat' },
      { label: 'Task' },
      { type: 'separator' },
      { label: 'Projects' , click: () => {
        mainWindow.loadURL(isDev
          ? `http://localhost:5173`
          : `file://${path.join(__dirname, '../build/index.html')}`)
        if(secondaryWindow){
          secondaryWindow.loadURL(isDev
            ? `http://localhost:5173`
            : `file://${path.join(__dirname, '../build/index.html')}`)
        }
      }},
      { label: 'Code' },
      (API_Response.userRole == "Admin" || API_Response.userRole == "admin") ? { label: 'Users'} 
      : {label: null}
    ]
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'Report',
        click () {
          console.log(JSON.stringify(API_Response))
        }
      },
      { label: 'Issue' },
    ]
  },
  {
    label: 'Window',
    submenu: [
      {
      label: 'Main Window',
      role: 'help',
      accelerator: process.platform === 'darwin' ? 'Alt+Cmd+M' : 'Alt+Shift+M',
      click: () => { 
        mainWindow.show()
        secondaryWindow.hide()
       }
       },
       {
        label: 'Secondary Window',
        role: 'help',
        accelerator: process.platform === 'darwin' ? 'Alt+Cmd+S' : 'Alt+Shift+S',
        click: () => { 
          mainWindow.hide()
          secondaryWindow.show()
         }
         }
    ]
  }
]
let menu = "";
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
app.on('ready',() => {
  // ipcMain.handle('dialog:EchoMsg', handleMessage)
  mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        title: "i dont know?",
        webPreferences: {
          preload: path.join(__dirname, 'preload.js'),
          nodeIntegration: true,
          webviewTag: true,
        }
  })
  mainWindow.loadURL(
    isDev
        // ? `file://${path.join(__dirname, 'index.html')}`
        ? `http://localhost:5173`
        : `file://${path.join(__dirname, '../build/index.html')}`)
  if(isDev){
    mainWindow.webContents.openDevTools({ mode: 'bottom'})
  }
  // mainWindow.webContents.on('before-input-event', (event, input) => {
  //   // Check if the window is in focus.
  //   if (mainWindow.isFocused()) {
  //     // Handle keypress events.
  //     if (input.type === 'keyDown' && input.key != "Unidentified") {
  //       console.log('Keypress detected:', input.key);
  //     }

  //     // Handle mouseclick events.
  //     if (input.type === 'mouseDown') {
  //       console.log('Mouseclick detected:', input.button);
  //     }
  //   }
  // });
  mainWindow.on('focus',()=>{
    console.log('window got focus yes haha')
    console.log("Test Env Varible value: ",process.env.TEST_VAR)
    clearTimeout(x)
    clearTimeout(y)
    clearInterval(z)
    clearInterval(w)
    timeElapsed = 0
    interval = 0
    isCodeBlockHalted = false
    mainWindow.webContents.on('before-input-event', (event, input) => {
        if (mainWindow.isFocused()) {
          if (input.type === 'keyDown' && input.key != "Unidentified") {
            console.log('Keypress detected:', input.key);
            //startCodeBlock
            clearTimeout(y)
            isCodeBlockHalted = false
            //startCodeBlock
            console.log("Clear previous timeout and set new timeout codeblock status: ",isCodeBlockHalted)
            y = setTimeout(()=>{
              console.log("app in foreground(Idle) for 30 seconds codeblock status: ",isCodeBlockHalted)
              // axios.post(`${process.env.BASE_URL}\api\v0`,{})
              // .then((response) => {
              //   console.log("Response from Axios when app in foreground(Idle) for 30 seconds(Post): "+ response)
              //   console.log("data from axios (Post): "+response.data)
              // })
              isCodeBlockHalted = true
              //stopCodeBlock
            },30000)
          }
        }
      });
    mousePos1 = screen.getCursorScreenPoint()
    mousePos1 = screen.dipToScreenPoint(mousePos1)
    y = setTimeout(()=>{
      console.log("app in foreground(Idle) for 30 seconds codeblock status: ",isCodeBlockHalted)
      // axios.post(`${process.env.BASE_URL}\api\v0`,{})
      //   .then((response) => {
      //   console.log("Response from Axios when app in foreground(Idle) for 30 seconds(Post): "+ response)
      //   console.log("data from axios (Post): "+response.data)
      // })
      isCodeBlockHalted = true
      //stopCodeBlock
    },30000)
    z = setInterval(()=>{
      const idleState = powerMonitor.getSystemIdleState(idleThreshold)
      if(idleState == 'idle' || idleState == 'locked'){
          console.log("System in "+idleState+" state (Foreground) codeblock status: ",isCodeBlockHalted)
        //   axios.post(`${process.env.BASE_URL}\api\v0`,{})
        //   .then((response) => {
        //   console.log("Response from Axios when app in Idle/Locked state(Background)(Post): "+ response)
        //   console.log("data from axios (Post): "+response.data)
        // })
        isCodeBlockHalted = true
        //stopCodeBlock
      }
      else{
        console.log("System state(Foreground): "+idleState+" codeblock status: ",isCodeBlockHalted)
        mousePos2 = screen.getCursorScreenPoint()
        mousePos2 = screen.dipToScreenPoint(mousePos2)
        if(mousePos1.x != mousePos2.x && mousePos1.y != mousePos2.y){
            console.log("mouse move detected(Foreground): ",mousePos1,mousePos2)
            mousePos1 = mousePos2
            interval = 0
            clearTimeout(y)
            isCodeBlockHalted = false
            //startCodeBlock
            console.log("Clear previous timeout and set new timeout. codeblock status: ",isCodeBlockHalted)
            y = setTimeout(()=>{
              console.log("app in foreground(Idle) for 30 seconds. codeblock status: ",isCodeBlockHalted)
              // axios.post(`${process.env.BASE_URL}\api\v0`,{})
              // .then((response) => {
              // console.log("Response from Axios when app in foreground(Idle) for 30 seconds(Post): "+ response)
              // console.log("data from axios (Post): "+response.data)
              //  })
               isCodeBlockHalted = true
               //stopCodeBlock
          },30000)
        }
        else{
          interval++
          console.log("No mouse movement(Foreground) codeblock status - ",isCodeBlockHalted)
          console.log("app in foreground(With no mouse movement) for "+interval*15+"seconds")
          // axios.post(`${process.env.BASE_URL}\api\v0`,{})
          // .then((response) => {
          // console.log("Response from Axios when app in foreground(With no mouse movement) for 15 seconds(Post): "+ response)
          // console.log("data from axios (Post): "+response.data)
          // })
          isCodeBlockHalted = true
          //stopCodeBlock
        }
      }
    },15000)
    // const backgroundTime = (new Date() - backgroundStartTime)
    // console.log("App in background for: ",Math.round(backgroundTime/1000))
    // if(Math.round(backgroundTime/1000) > 30){
    //   console.log("App in background for more than 30 seconds")
  })
  mainWindow.on('blur',() => {
    console.log('window blur oh no')
    // isInBackground = true
    // backgroundStartTime = new Date()
    clearTimeout(x)
    clearTimeout(y)
    clearInterval(z)
    clearInterval(w)
    timeElapsed = 0
    interval = 0
    isCodeBlockHalted = false
    x = setTimeout(()=>{
      console.log("app in background for 30 seconds. codeblock status: ",isCodeBlockHalted)
    //   axios.post(`${process.env.BASE_URL}\api\v0`,{})
    //     .then((response) => {
    //     console.log("Response from Axios when app in background for 30 seconds(Post): "+ response)
    //     console.log("data from axios (Post): "+response.data)
    //   })
    // .catch((error) => console.log("error msg: "+error))
    //stopCodeBlock
    isCodeBlockHalted = true;
    //stopCodeBlock
    },30000)
    w = setInterval(()=>{
      timeElapsed++
      const idleState = powerMonitor.getSystemIdleState(idleThreshold)
      if(idleState == 'idle' || idleState == 'locked'){
          console.log("System in "+idleState+" state (Background) for( "+timeElapsed*15+" secs) codeblock status: ",isCodeBlockHalted)
      //     axios.post(`${process.env.BASE_URL}\api\v0`,{})
      //   .then((response) => {
      //   console.log("Response from Axios when app in Idle/Locked state(Background)(Post) "+ response)
      //   console.log("data from axios (Post): "+response.data)
      // })
      isCodeBlockHalted = true;
      //stopCodeBlock
      }
      else{
        console.log("System state(Background): "+idleState+" for( "+timeElapsed*15+" secs) codeblock status: ",isCodeBlockHalted)
      }
    },15000)
  })
  // mainWindow.on('close', function(e) {
  //   const choice = dialog.showMessageBoxSync(this,
  //     {
  //       type: 'question',
  //       buttons: ['Yes', 'No'],
  //       title: 'Confirm',
  //       message: 'Are you sure you want to quit? Really? why?'
  //     });
  //   if (choice === 1) {
  //     e.preventDefault();
  //   }
  // });
  ipcMain.on('onPortOccupied', (event,msgs) => {
    global.Message = msgs
    portNum= msgs
    console.log("portnum is :-",portNum)
    console.log(event)
    secondaryWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: true,
        webviewTag: true,
      }
    })
    secondaryWindow.loadURL(
      isDev
        ? `${appUrl}:${msgs}/`
        // ? `${msgs}`
        : `file://${path.join(__dirname, '../build/index.html')}`
    );
    // const winNewView = new BrowserView();
    // win.setBrowserView(winNewView)
    // winNewView.setBounds({x:0,y:0,width:400,height:600})
    // winNewView.webContents.loadURL(`${msgs}`)
    if(isDev){
      secondaryWindow.webContents.openDevTools({ mode: 'bottom'})
    }
  })
  ipcMain.on('onPortOpen',(event,msgs)=>{
    secondaryWindow.on('closed', () => {
      // Dereference the window object
      secondaryWindow = null;
    });
    secondaryWindow.close()
    console.log("closing secondary window running on port - ",msgs)
  })
  ipcMain.on('sendURL',(event,param)=>{
    if(param.action === 'openedCodeBlock'){
      global.MenuItem1Label = 'CodeBlock'
      template1[0].label = 'CodeBlock'
    }
    mainWindow.loadURL(isDev
    ? `${param.url}`
    : `file://${path.join(__dirname, '../build/index.html')}`)
  })
  ipcMain.on('createCodeBlock',(event,param)=>{
    console.log("creaCodeBlockRequest - ",param)
    connection.on('createCodeBlock',async(data)=>{
      try{
        await connection.invoke("CreateAndStartCodeBlock", data);
      } catch (err) {
        console.error(err);
    }
    })
  })
  ipcMain.on('startCodeBlock',(event,param)=>{
    console.log("startCodeBlockRequest - ",param)
  })
  ipcMain.on('stopCodeBlock',(event,param)=>{
    console.log("stopCodeBlockRequest - ",param)
  })
  ipcMain.on('processUserLogin',(event,param)=>{
    API_Response = param
    console.log("processUserLogin - ",param)
  })
  ipcMain.on('sendKeyCloakToken',(event,param)=>{
    keycloakToken = param
    console.log("keycloak token value - ",param)
    console.log("Keycloak token as variable",keycloakToken)
  })
  connection.on("LaunchedCodeBlock",(data)=>{
    mainWindow.loadURL(`${data.url}:${data.port}`);
      secondaryWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
          preload: path.join(__dirname, 'preload.js'),
          nodeIntegration: true,
          webviewTag: true,
        }
      })
    secondaryWindow.loadURL(`${data.url}:${data.appPortNumber}`)
    if(data.action == "openedCodeBlock"){
      MenuItem1Label = "CodeBlock"
      template1[0].label = template1[0].label + " - " + 'CodeBlock'
      menu = Menu.buildFromTemplate(template1)
      Menu.setApplicationMenu(menu)
      console.log("Menu item 1 label ",MenuItem1Label)
    }
  })
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
  menu = Menu.buildFromTemplate(template1)
  Menu.setApplicationMenu(menu)
  console.log("Menu item 1 label",MenuItem1Label)
 })

app.on('before-quit',()=>{
  clearInterval(interval);
})
app.on('window-all-closed', (event) => {
  console.log("Before Axios Post")
  // axios.post(`${process.env.BASE_URL}\api\v0`,{})
  //       .then((response) => {
  //       console.log("Response from Axios on close event(Post): "+ response)
  //       console.log("data from axios (Post): "+response.data)
  //     })
  //   .catch((error) => console.log("error msg: "+error))
  //stopCodeBlock
  const choice = dialog.showMessageBoxSync(mainWindow,{
        type: 'question',
        buttons: ['Quit','Cancel','Item1','Item2'],
        defaultId: 1,
        title: "Confirm Quit",
        message: "Are you sure you want to quit?",
        detail: "Any unsaved changes may be lost.",
      })
      if(choice === 1){
        console.log("The event won't happen")
        event.preventDefault();
        app.relaunch()
      }
      else if(process.platform !== 'darwin' && choice != 1) {
        console.log("The app will close")
        app.quit()
      }
})