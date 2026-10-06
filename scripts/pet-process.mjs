import {readFileSync} from 'node:fs';
import { createRequire } from 'node:module';
import { spawn, spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { root } from './paths.mjs';
export function startPet({standalone=false,onError=error=>console.error('桌宠启动失败：'+error.message)}={}) {
  if(!standalone) {try{const pid=Number(readFileSync(join(root,'.local/pet.pid'),'utf8'));if(pid>0){process.kill(pid,0);const command=spawnSync('ps',['-p',String(pid),'-o','command='],{encoding:'utf8'}).stdout?.trim();if(command?.includes(join(root,'desktop/pet-main.mjs')))return;}}catch{}}
  const require=createRequire(join(root,'package.json'));
  const executable=require('electron');
  const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
  const child=spawn(executable,[join(root,'desktop/pet-main.mjs'),...(standalone?['--standalone']:[])],{env,detached:true,stdio:'ignore'});
  child.on('error',onError);child.unref();
}
