import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
export const supported='0.2.0-rc.2';
export function doctor() {
 if(process.platform!=='darwin')throw new Error('目前仅验证 macOS 原生程序接入。');
 if(Number(process.versions.node.split('.')[0])<24)throw new Error('需要 Node.js 24+。');
 const app=process.env.HARNESS_APP||'/Applications/DeepSeek Harness.app';
 if(!existsSync(app))throw new Error('请先安装官方 DeepSeek Harness，并打开一次。');
 const r=spawnSync('/usr/libexec/PlistBuddy',['-c','Print CFBundleShortVersionString',app+'/Contents/Info.plist'],{encoding:'utf8'});
 if(r.stdout.trim()!==supported)throw new Error(`原生 Harness 版本 ${r.stdout.trim()} 尚未验证；此插件固定支持 ${supported}。`);
 console.log(`环境通过：macOS ${process.arch} / Node ${process.versions.node} / 原生 Harness ${supported}`);return app;
}
if(process.argv[1]?.endsWith('/doctor.mjs'))doctor();
