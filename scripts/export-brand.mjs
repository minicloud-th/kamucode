// Rasterize the project-native vector identity and package its reusable assets.
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
for(const name of ['logo','logo-dark','mark','mark-dark','wordmark','wordmark-dark','logo-mono','logo-white']){
 await sharp('public/assets/brand/'+name+'.svg').resize({width:name.startsWith('mark')?1024:2520}).png().toFile('public/assets/brand/'+name+'.png');
}
await sharp('public/assets/brand/identity-preview.svg').png().toFile('reference/identity-preview.png');
execFileSync('python3',['scripts/brand_assets.py','--zip'],{stdio:'inherit'});
console.log('Exported transparent PNGs, vector logos, and kamucode-brand-kit.zip.');
