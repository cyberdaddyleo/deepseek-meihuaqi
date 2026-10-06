// Executed by the installed app's read-only Node runtime. Uses upstream's own
// locked, compatibility-checked package operation, including manifest rollback.
import {join,delimiter} from 'node:path';
import {pathToFileURL} from 'node:url';
import {homedir} from 'node:os';
import {copyFileSync,mkdirSync,existsSync} from 'node:fs';
import {root} from './paths.mjs';
const app=process.env.HARNESS_APP||'/Applications/DeepSeek Harness.app';
const resources=join(app,'Contents/Resources'), runtime=join(resources,'app.asar/dsh');
const {runPluginCommand}=await import(pathToFileURL(join(runtime,'node_modules/@deepseek-ai/dsh-plugin-manager/lib/types/operations.js')));
const profile=join(process.env.DSH_HOME||join(homedir(),'.dsh'),'profiles/desktop');
if(!existsSync(join(profile,'package.json')))throw new Error('请先打开一次原生 Harness 初始化桌面配置。');
const backup=join(root,'.local','install-backups',String(Date.now()));mkdirSync(backup,{recursive:true,mode:0o700});
for(const file of ['package.json','pnpm-lock.yaml','cordis.patch.yml']) if(existsSync(join(profile,file)))copyFileSync(join(profile,file),join(backup,file));
const args=process.argv.includes('--remove')?['remove','@cyberdaddy/harness-dressup']:['add','link:'+root,'--ignore-scripts'];
const result=await runPluginCommand({profile:'desktop',dir:profile,installAnchor:join(runtime,'node_modules/@deepseek-ai/dsh/package.json'),cwd:root},args,{command:process.execPath,args:['--expose-internals',join(resources,'runtime/pnpm/bin/pnpm.mjs')],env:{ELECTRON_RUN_AS_NODE:'1',DSH_DESKTOP_NODE_EXECUTABLE:process.execPath,PATH:join(resources,'runtime/bin')+delimiter+process.env.PATH},execution:'service',outputBytes:10000,onOutput:text=>process.stdout.write(text),activateNewBundles:true,lockWaitMs:5000,idleTimeoutMs:30000});
if(result.exitCode!==0) {console.error('官方安装器未完成：',JSON.stringify(result));process.exitCode=1;}
else console.log('原生桌面插件配置已更新。请运行 ./run.sh start。');
