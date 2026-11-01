from pathlib import Path
from lxml import html
from urllib.parse import urlparse,urljoin
import json,re
root=Path(__file__).resolve().parents[1];public=root/'public';private=root/'generated/store-pages';missing=set()
dynamic=['/api/','/signin-with-chatgpt','/signout-with-chatgpt']
def check(path,base='/'):
 path=urlparse(urljoin(base,path)).path
 if not path.startswith('/') or path=='/' or any(path.startswith(p) for p in dynamic):return
 target=public/path.lstrip('/')
 if not target.is_file() and not (target/'index.html').is_file() and not (private/path.lstrip('/')/'index.html').is_file():missing.add(path)
routes=json.loads((root/'reference/routes.json').read_text())
for filename in routes:
 file=public/filename
 if not file.exists():file=private/filename
 doc=html.fromstring(file.read_bytes());base='/'+filename
 assert not doc.xpath('//a[starts-with(@href,"/signup")]'),filename+' must use Login as its only account entry'
 assert not doc.xpath('//form[@data-mode="signup"]'),filename+' must not expose a signup form'
 assert len(doc.xpath('//h1'))==1,filename+' must have one main heading'
 assert not any(term in doc.text_content().lower() for term in ['fastwork','chapavich','changesea']),filename
 assert not any(term in doc.text_content() for term in ['à¸','à¹','Â·']),filename+' text encoding'
 ids=[n.get('id') for n in doc.xpath('//*[@id]')];assert len(ids)==len(set(ids)),filename+' duplicate IDs'
 for element in doc.xpath('//img|//link|//script|//a'):
  url=element.get('src') or element.get('href') or ''
  if url.startswith(('http:','https:','data:','#','mailto:')):continue
  check(url,base)
 for label in doc.xpath('//label[@for]'):assert label.get('for') in ids,filename+' invalid label'
 for image in doc.xpath('//img'):assert image.get('alt') is not None,filename+' missing image alternative'
 for link in ['/privacy/','/terms/','/security/']:
  assert doc.xpath('//a[@href="'+link+'"]'),filename+' missing policy link'
 if filename not in ['signup/index.html','login/index.html','auth/complete/index.html','auth/native/index.html']:
  bar=doc.xpath('//header[contains(@class,"start-selling-top-nav")]')
  assert len(bar)==1,filename+' must have one top bar'
  if file.is_relative_to(private):
   nav=bar[0].xpath('.//*[@id="kc-member-navigation"]')
   assert len(nav)==1,filename+' must include member navigation'
   assert nav[0].xpath('.//nav/a/@href')==['/shop/','/games/','/source-code/','/saved/','/partners/'],filename+' missing shortcut destination'
   assert doc.xpath('//script[@src="/member-navigation.js"]'),filename+' missing navigation script'
  else:
   assert len(bar[0].xpath('.//a'))==1 and len(bar[0].xpath('.//button'))==2,filename+' must retain the original public top bar'
   assert not doc.xpath('//*[@id="kc-member-navigation"]'),filename+' must not expose member shortcuts'
 if file.is_relative_to(private):assert not (public/filename).exists(),filename+' must not be a public asset'
landing=html.fromstring((public/'welcome/index.html').read_bytes())
for name in ['kc-collections','kc-collection-track','kc-principles','kc-partner','kc-closing']:
 assert landing.xpath('//*[contains(concat(" ",@class," ")," '+name+' ")]'),'Restore original landing section '+name
assert not landing.xpath('//*[contains(@class,"km-quicklinks")]'),'Quick links belong after login'
for css in [public/'site.css',public/'styles.css',public/'landing.css']:
 for raw in re.findall(r'url\(([^)]+)\)',css.read_text()):
  raw=raw.strip('"\' ')
  if not raw.startswith(('data:','#','http:','https:')):check(raw,'/'+str(css.relative_to(public)))
catalog=json.loads((public/'catalog.json').read_text())
assert len(catalog)==8
for product in catalog:check(product['image']);check('/product/'+product['id']+'/')
assert not missing,str(sorted(missing))
assert not list(public.glob('__*')),'Remove temporary QA files'
assert not (public/'signup/index.html').exists(),'The old signup page must be removed'
manifest=json.loads((root/'.openai/hosting.json').read_text())
assert manifest['project_id']=='appgprj_6ae5650ea7ac8191a6aa705edd60f431' and manifest['d1']=='DB'
print(f'Passed: {len(routes)} pages, unique headings and IDs, internal links, form labels, images, policy pages, and preserved Site identity.')
