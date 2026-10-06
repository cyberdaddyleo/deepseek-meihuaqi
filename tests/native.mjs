// Run only against an idle native app intentionally launched for testing with
// --remote-debugging-address=127.0.0.1 --remote-debugging-port=9224.
import {createRequire} from 'node:module';
import {join} from 'node:path';
import {mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {root} from '../scripts/paths.mjs';
const require=createRequire(join(root,'package.json'));
const {chromium}=require('playwright');
const browser=await chromium.connectOverCDP('http://127.0.0.1:9224');
const page=browser.contexts()[0].pages().find(p=>p.url()==='dsh-app://app/');
assert.ok(page,'必须连接 dsh-app://app/ 原生窗口');
const shots=join(root,'docs/screenshots');mkdirSync(shots,{recursive:true});
const results=[];let originalInput;
const mask=()=>[page.getByRole('button',{name:'账号菜单',exact:true})];
async function shot(name){await page.screenshot({path:join(shots,name+'.png'),mask:mask(),maskColor:'#e9edf2'});}
async function toolbox(){
 if(await page.getByRole('button',{name:'美化工具箱',exact:true}).isVisible()) {await page.getByRole('button',{name:'美化工具箱',exact:true}).click();return;}
 await page.getByRole('button',{name:'账号菜单',exact:true}).click();
 await page.getByText('设置',{exact:true}).click();
 await page.getByRole('button',{name:'美化工具箱',exact:true}).click();
}
async function closeSettings(){await page.getByRole('button',{name:'关闭',exact:true}).click();}
try {
 await toolbox();await page.getByRole('tab',{name:'界面皮肤',exact:true}).click();
 await page.getByRole('button',{name:'应用清透冰蓝',exact:true}).click();
 await closeSettings();
 const input=page.locator('[contenteditable="true"]').first();
 const nativeInput=await input.elementHandle();
 const code=page.locator('pre').first();
 assert.ok(await code.count(),'请在空闲测试会话中准备一条真实代码块回复');
 const codeText=await code.innerText();
 const original=(await input.innerText()).replaceAll('美化验证：这段草稿必须在换肤后保留。','');originalInput=original;
 await input.fill(original+'美化验证：这段草稿必须在换肤后保留。');
 const draft=await input.innerText();
 for(const [id,name] of [['ice','清透冰蓝'],['night','星河夜航'],['forest','森林奶油']]) {
  await toolbox();await page.getByRole('button',{name:'应用'+name,exact:true}).click();
  const expected={ice:'#f5faff',night:'#141d32',forest:'#faf9f1'}[id];
  await page.waitForFunction(color=>getComputedStyle(document.body).getPropertyValue('--dsw-alias-bg-base').trim()===color,expected);
  await shot('native-toolbox-'+id);
  await closeSettings();assert.equal(await input.innerText(),draft);
  assert.equal(await nativeInput.evaluate(el=>el.isConnected),true,'换肤不能重建输入框');
  const style=await page.evaluate(()=>({root:getComputedStyle(document.body).getPropertyValue('--dsw-alias-bg-base'),input:getComputedStyle(document.querySelector('[contenteditable="true"]')).color,scheme:getComputedStyle(document.documentElement).colorScheme}));
  style.codeBackground=await code.evaluate(el=>{while(el){const color=getComputedStyle(el).backgroundColor;if(color!=='rgba(0, 0, 0, 0)'&&color!=='transparent')return color;el=el.parentElement;}});
  style.codeText=await code.innerText();assert.equal(style.codeText,codeText);
  await shot('native-chat-'+id);
  await page.getByRole('button',{name:'账号菜单',exact:true}).click();await shot('native-menu-'+id);await page.keyboard.press('Escape');
  results.push({theme:id,draftPreserved:true,style});
 }
 await input.fill(original);
 await toolbox();await page.getByRole('tab',{name:'启动画面',exact:true}).click();await page.getByRole('button',{name:'应用星河微光',exact:true}).click();
 await page.locator('[data-preview="stars"]').click();assert.equal(await page.locator('.cb-preview').count(),1);await shot('native-startup-preview');await page.getByRole('button',{name:'关闭预览',exact:true}).click();
 await page.getByRole('tab',{name:'桌面宠物',exact:true}).click();await page.getByRole('button',{name:'应用奶油猫',exact:true}).click();await shot('native-pet-settings');
 const state=await page.evaluate(async()=> (await (await fetch('/api/cyberdaddy',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({endpoint:'get'})})).json()).value);
 assert.equal(state.theme,'forest');assert.equal(state.splash,'stars');assert.equal(state.pet.id,'cat');
 results.push({independentChoices:true});
 assert.equal(new Set(results.filter(x=>x.style).map(x=>x.style.codeBackground)).size,3,'真实代码容器应随三种皮肤改变');
 await page.getByRole('button',{name:'关闭美化',exact:true}).click();
 const scheme=await page.evaluate(()=>getComputedStyle(document.documentElement).colorScheme);assert.equal(scheme,'light');
 await page.getByRole('button',{name:'开启美化',exact:true}).last().click();
 results.push({disableEnable:true});
 await page.getByRole('tab',{name:'界面皮肤',exact:true}).click();await shot('native-toolbox');
 writeFileSync(join(root,'.local/native-validation.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
}finally{if(originalInput!==undefined){if(await page.getByRole('button',{name:'关闭',exact:true}).isVisible())await closeSettings();await page.locator('[contenteditable="true"]').first().fill(originalInput);await page.waitForTimeout(1200);}await browser.close();}
