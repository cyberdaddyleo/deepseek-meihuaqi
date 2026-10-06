import {spawnSync} from 'node:child_process';
import {join,dirname,delimiter} from 'node:path';
import {root} from './paths.mjs';
import {doctor} from './doctor.mjs';
doctor();
const env={...process.env,PATH:dirname(process.execPath)+delimiter+process.env.PATH};
for(const [command,args] of [['npm',['ci','--ignore-scripts','--no-audit','--no-fund','--legacy-peer-deps']],[process.execPath,[join(root,'node_modules/esbuild/install.js')]],[process.execPath,[join(root,'node_modules/electron/install.js')]],[process.execPath,[join(root,'scripts/build.mjs')]]]) {
 const r=spawnSync(command,args,{cwd:root,env,stdio:'inherit'});if(r.status!==0)process.exit(r.status??1);
}
console.log('构建完成。退出原生 Harness 后运行 ./run.sh install，然后 ./run.sh start。');
