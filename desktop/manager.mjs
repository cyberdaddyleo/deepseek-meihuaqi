import { mountManager } from "../src/manager.mjs";
import { customAssetId } from "../src/catalog.mjs";
const images=new Map();
const assetResolver=path=>{
 const id=customAssetId(path);
 if(!id)return '../'+path;
 if(!images.has(id))images.set(id,window.cyberDressup.asset(id).catch(error=>{images.delete(id);throw error;}));
 return images.get(id);
};
mountManager(
  document.querySelector("#manager"),
  { ...window.cyberDressup, desktop: true },
  { assetBase: "../assets/", petOnly: true, assetResolver },
);
