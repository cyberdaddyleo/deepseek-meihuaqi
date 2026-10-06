import { app, BrowserWindow, Menu, ipcMain, dialog, Tray, nativeImage } from 'electron';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { watch, writeFileSync, unlinkSync, mkdirSync } from 'node:fs';
import { root } from '../scripts/paths.mjs';
import { Store } from './settings.mjs';
import { PetWindow } from './pet-window.mjs';
const data=process.env.CYBER_PET_DATA_DIR||join(root,'.local');mkdirSync(data,{recursive:true,mode:0o700});
app.setPath('userData',join(data,'pet-electron'));
app.setName('赛博老爸桌宠');
const owned=new Map();let store,pet,tray,watcher,timer,quitting=false;
function create(file,options={}) {
 const win=new BrowserWindow({width:860,height:740,show:false,...options,webPreferences:{preload:join(root,'desktop/preload.cjs'),sandbox:true,contextIsolation:true,nodeIntegration:false}});
 const url=pathToFileURL(join(root,'desktop',file)).href;
 const id=win.webContents.id;
 owned.set(id,{file,url});
 win.on('closed',()=>owned.delete(id));
 win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 win.webContents.on('will-navigate',(e,target)=>{if(target!==url)e.preventDefault();});
 return win;
}
function check(event,roles=['pet.html','manager.html']) {
 const row=owned.get(event.sender.id);
 if(!row||!roles.includes(row.file)||event.senderFrame!==event.sender.mainFrame||event.senderFrame.url!==row.url)throw new Error('不受信任的桌宠窗口');
}
function sync() {
 const state=store.get();if(quitting)return state;pet?.sync(state);
 for(const win of BrowserWindow.getAllWindows())win.webContents.send('cyber:change',state);
 return state;
}
async function manager() {
 let win=BrowserWindow.getAllWindows().find(w=>owned.get(w.webContents.id)?.file==='manager.html');
 if(!win){win=create('manager.html');await win.loadFile(join(root,'desktop/manager.html'));}win.show();
}
function quit() {store.update({pet:{enabled:false}});app.quit();}
if(!app.requestSingleInstanceLock()) app.quit();
else {
 app.on('second-instance',(_e,args)=>{if(args.includes('--standalone'))store.update({enabled:true,pet:{enabled:true}});sync();});
 app.on('window-all-closed',()=>{});
 app.on('activate',()=>void manager());
 app.on('before-quit',()=>{
  if(quitting)return;
  quitting=true;
  clearTimeout(timer);watcher?.close();
  pet?.dispose({destroy:false});
  tray?.destroy();
  try{unlinkSync(join(data,'pet.pid'));}catch{}
 });
 for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>app.quit());
 void app.whenReady().then(async () => {
 try {
  store=new Store(data);writeFileSync(join(data,'pet.pid'),String(process.pid));
  if(process.argv.includes('--standalone'))store.update({enabled:true,pet:{enabled:true}});
  pet=new PetWindow({create:options=>create('pet.html',options),store,changed:sync,showManager:manager,quit});
  ipcMain.handle('cyber:get',e=>{check(e);return store.get();});
  ipcMain.handle('cyber:update',(e,p)=>{check(e,['manager.html']);store.update(p);return sync();});
  ipcMain.handle('cyber:reset',e=>{check(e,['manager.html']);store.reset();return sync();});
  ipcMain.handle('cyber:add-preset',(e,p)=>{check(e,['manager.html']);store.addPreset(p);return sync();});
  ipcMain.handle('cyber:remove-preset',(e,p)=>{check(e,['manager.html']);store.removePreset(p);return sync();});
  ipcMain.handle('cyber:asset',(e,id)=>{check(e);const {data,type}=store.readAsset(id);return `data:${type};base64,${data.toString('base64')}`;});
  ipcMain.handle('cyber:action',(e,action)=>{check(e);if(action==='quit')quit();else throw new Error('不支持的操作');});
  for(const [channel,fn] of [['cyber:hit',v=>pet.hit(v===true)],['cyber:drag',(v,p)=>{if(v==='start')pet.startDrag(p);else if(v==='move')pet.moveDrag(p);else if(v==='end'){pet.moveDrag(p);pet.endDrag();}}],['cyber:menu',()=>pet.contextMenu()]]) ipcMain.on(channel,(e,v,p)=>{try{check(e,['pet.html']);fn(v,p);}catch(error){console.warn(error.message);}});
  const menu=Menu.buildFromTemplate([{label:'桌宠管理',click:()=>void manager()},{label:'显示桌宠',click:()=>{store.update({enabled:true,pet:{enabled:true}});sync();}},{label:'隐藏桌宠',click:()=>{store.update({pet:{enabled:false}});sync();}},{type:'separator'},{label:'退出桌宠',accelerator:'CmdOrCtrl+Q',click:quit}]);
  Menu.setApplicationMenu(Menu.buildFromTemplate([{label:'赛博老爸桌宠',submenu:menu},{role:'editMenu'}]));
  tray=new Tray(nativeImage.createEmpty());tray.setTitle('◉');tray.setToolTip('赛博老爸桌宠');tray.setContextMenu(menu);
  if(process.platform==='darwin')app.dock.hide();
  watcher=watch(data,(_e,file)=>{if(file==='appearance.json'||file==='custom-presets.json'){clearTimeout(timer);timer=setTimeout(()=>{try{sync();}catch(error){console.warn(error.message);}},60);}});
  sync();console.log('桌宠伴随进程：未启动 Harness 后端或聊天窗口。');
 }catch(error){dialog.showErrorBox('桌宠启动失败',error.message);app.quit();}
 });
}
