// Uses the actual native app intentionally started with localhost CDP 9224.
// Does not send model requests or access conversation history; temporary presets
// and the current input draft are restored by --cleanup after restart checks.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync,unlinkSync} from 'node:fs';
import {join} from 'node:path';
import {root} from '../scripts/paths.mjs';
const record=join(root,'.local/custom-native-qa.json');
const shots=join(root,'docs/screenshots');mkdirSync(shots,{recursive:true});
const browser=await chromium.connectOverCDP('http://127.0.0.1:9224');
const page=browser.contexts()[0].pages().find(p=>p.url()==='dsh-app://app/');assert.ok(page,'必须连接原生窗口');
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const call=(endpoint,payload)=>page.evaluate(async({endpoint,payload})=>{const r=await(await fetch('/api/cyberdaddy',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({endpoint,payload})})).json();if(!r.ok)throw Error(r.error.message);return r.value;},{endpoint,payload});
async function toolbox(tab='界面皮肤'){
 if(!await page.getByRole('button',{name:'美化工具箱',exact:true}).isVisible()){await page.getByRole('button',{name:'账号菜单',exact:true}).click();await page.getByText('设置',{exact:true}).click();}
 await page.getByRole('button',{name:'美化工具箱',exact:true}).click();await page.getByRole('tab',{name:tab,exact:true}).click();
}
async function closeSettings(){await page.getByRole('button',{name:'关闭',exact:true}).click();}
async function setDraft(text){const input=page.locator('[contenteditable=true]').first();await input.click();await input.press('Meta+A');await input.press('Backspace');if(text.trim())await input.fill(text);await page.waitForTimeout(1200);assert.equal((await input.innerText()).trim(),text.trim());}
async function remove(kind,id,tab){await toolbox(tab);const card=page.locator(`[data-preset="${id}"]`);await card.locator('[data-delete]').click();await card.getByRole('button',{name:'确认删除',exact:true}).click();await card.waitFor({state:'detached'});}
try{
 if(process.argv.includes('--recover')){
  const qa=JSON.parse(readFileSync(record,'utf8'));
  for(const [kind,id]of Object.entries(qa.ids)){const state=await call('get');if(state.custom[kind].some(p=>p.id===id))await call('remove-preset',{kind,id});}
  await call('update',qa.original);
  for(const dialog of await page.locator('.cb-custom-overlay').all())await dialog.getByRole('button',{name:'取消',exact:true}).click();
  if(await page.getByRole('button',{name:'关闭',exact:true}).isVisible())await closeSettings();
  await setDraft(qa.draft);unlinkSync(record);
  console.log('Recovered only this test’s presets, appearance and draft: PASS');
 }else if(process.argv.includes('--cleanup')){
  const qa=JSON.parse(readFileSync(record,'utf8'));const state=await call('get');
  for(const kind of ['theme','splash'])assert.equal(state[kind],qa.ids[kind]);assert.equal(state.pet.id,qa.ids.pet);
  assert.equal(await page.evaluate(()=>getComputedStyle(document.body).getPropertyValue('--dsw-alias-bg-base').trim()),'#f8f1ff');
  console.log('Native restart retained all three custom presets and active skin: PASS');
  for(const [kind,tab]of[['theme','界面皮肤'],['splash','启动画面'],['pet','桌面宠物']]){await remove(kind,qa.ids[kind],tab);const now=await call('get');assert.equal(kind==='pet'?now.pet.id:now[kind],{theme:'whalegirl',splash:'whalegirl',pet:'whalegirl'}[kind]);}
  await call('update',qa.original);await closeSettings();await setDraft(qa.draft);
  unlinkSync(record);console.log('Native UI deletion falls back and restores prior user settings: PASS');
 }else{
  assert.equal(existsSync(record),false,'上次验证尚未清理：先运行 --cleanup 或 --recover，避免覆盖原始设置。');
  if(await page.getByRole('button',{name:'关闭',exact:true}).isVisible())await closeSettings();
  const input=page.locator('[contenteditable=true]').first();const draft=await input.innerText();const original=await call('get');const qa={original,draft,ids:{}};
  writeFileSync(record,JSON.stringify(qa));await input.fill(draft+'自定义换肤验证草稿');const inputHandle=await input.elementHandle();
  await toolbox();await page.getByRole('button',{name:'添加界面皮肤',exact:true}).click();const themeForm=page.getByRole('dialog',{name:'添加界面皮肤',exact:true});
  await themeForm.getByLabel('名称',{exact:true}).fill('自定义验证 · 紫藤');
  for(const [name,color]of[['主背景','#f8f1ff'],['侧边栏','#f0e8fb'],['强调色','#6841b1']])await themeForm.getByLabel(name,{exact:true}).fill(color);
  await themeForm.screenshot({path:join(shots,'custom-native-theme-editor.png')});
  await themeForm.getByRole('button',{name:'保存到我的预设'}).click();await themeForm.waitFor({state:'detached'});
  let state=await call('get');qa.ids.theme=state.custom.theme.find(p=>p.name==='自定义验证 · 紫藤').id;writeFileSync(record,JSON.stringify(qa));assert.equal(state.theme,original.theme);
  await page.locator(`[data-preset="${qa.ids.theme}"] [data-apply]`).click();await page.waitForFunction(()=>getComputedStyle(document.body).getPropertyValue('--dsw-alias-bg-base').trim()==='#f8f1ff');
  await closeSettings();assert.equal(await input.innerText(),draft+'自定义换肤验证草稿');assert.equal(await inputHandle.evaluate(el=>el.isConnected),true);await setDraft(draft);
  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="240" height="180" viewBox="0 0 240 180"><path d="M120 22 146 67 197 77 161 113 168 161 120 139 72 161 79 113 43 77 94 67Z" fill="#9dbeed" stroke="#4169a0" stroke-width="4"/><circle cx="103" cy="94" r="5" fill="#29455c"/><circle cx="137" cy="94" r="5" fill="#29455c"/><path d="M108 115Q120 127 132 115" fill="none" stroke="#29455c" stroke-width="4"/></svg>';
  for(const [kind,tab,name]of[['splash','启动画面','自定义验证 · 星星开场'],['pet','桌面宠物','自定义验证 · 星星桌宠']]){
   await toolbox(tab);await page.getByRole('button',{name:'添加'+tab,exact:true}).click();const form=page.getByRole('dialog',{name:'添加'+tab,exact:true});await form.getByLabel('名称',{exact:true}).fill(name);
   await form.getByLabel('选择图片').setInputFiles({name:'little-star.svg',mimeType:'image/svg+xml',buffer:Buffer.from(svg)});await form.locator('.cb-upload-preview img').waitFor();
   if(kind==='splash'){await form.getByLabel('背景颜色').fill('#edf1ff');await form.getByLabel('动态风格').selectOption('stars');}
   await form.screenshot({path:join(shots,'custom-native-'+kind+'-import.png')});await form.getByRole('button',{name:'保存到我的预设'}).click();await form.waitFor({state:'detached'});
   state=await call('get');qa.ids[kind]=state.custom[kind].find(p=>p.name===name).id;writeFileSync(record,JSON.stringify(qa));const card=page.locator(`[data-preset="${qa.ids[kind]}"]`);await card.locator('[data-apply]').click();
   if(kind==='splash'){await card.getByRole('button',{name:'预览',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.cb-preview img')?.naturalWidth===240);await page.getByRole('button',{name:'关闭预览',exact:true}).click();}
  }
  state=await call('get');assert.equal(state.theme,qa.ids.theme);assert.equal(state.splash,qa.ids.splash);assert.equal(state.pet.id,qa.ids.pet);await call('update',{pet:{enabled:true}});
  await toolbox('界面皮肤');await page.locator(`[data-preset="${qa.ids.theme}"]`).scrollIntoViewIfNeeded();await page.getByRole('dialog').first().screenshot({path:join(shots,'custom-native-theme-applied.png')});await closeSettings();
  console.log('Native theme editor + imported startup/pet + draft preservation: PASS');
  console.log('Custom asset response:',await page.evaluate(async id=>{const r=await fetch('/api/cyberdaddy/asset?id='+id);return{status:r.status,type:r.headers.get('content-type')};},qa.ids.pet));
 }
 assert.deepEqual(errors,[]);console.log('Native custom preset page errors: none');
}finally{await browser.close();}
