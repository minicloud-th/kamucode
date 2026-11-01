import { build } from 'esbuild';
await build({ entryPoints: ['components/member-navigation.tsx'], outfile: 'public/member-navigation.js', bundle: true, minify: true, format: 'esm', target: ['es2020'], define: { 'process.env.NODE_ENV': '"production"' }, jsx: 'automatic', logLevel: 'info' });
