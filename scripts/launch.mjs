import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {startPet} from './pet-process.mjs';
if(process.argv.includes('--pet')) startPet({standalone:true});
else {
 if(process.platform!=='darwin') throw new Error('当前已验证的原生接入仅支持 macOS。');
 const app=process.env.HARNESS_APP || '/Applications/DeepSeek Harness.app';
 if(!existsSync(app))throw new Error('请先安装并打开官方 DeepSeek Harness。');
 const result=spawnSync('open',['-a',app],{stdio:'inherit'});
 if(result.status!==0)process.exit(result.status||1);
 console.log('已打开原生 DeepSeek Harness。入口：账号菜单 → 设置 → 美化工具箱。');
}
