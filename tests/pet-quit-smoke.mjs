import '../desktop/pet-main.mjs';
import {app,BrowserWindow} from 'electron';
app.whenReady().then(()=>setTimeout(()=>{
 const win=BrowserWindow.getAllWindows()[0];
 if(!win)throw new Error('桌宠窗口未创建');
 void win.webContents.executeJavaScript("window.cyberDressup.action('quit')").catch(()=>{});
},700));
