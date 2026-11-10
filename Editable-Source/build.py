from pathlib import Path
import base64
root=Path(__file__).parent
source=root/'src'
def uri(path,mime):
    return 'data:'+mime+';base64,'+base64.b64encode(path.read_bytes()).decode()
html=(source/'index.template.html').read_text()
css=(source/'style.css').read_text().replace('__FONT__',uri(source/'assets/timber.woff','font/woff')).replace('__BACKGROUND__',uri(source/'assets/woodland.png','image/png'))
parts={'__FONT_LICENSE__':(source/'assets/FONT-LICENSE.txt').read_text(),'__CSS__':css,'__LOGS__':uri(source/'assets/logs.png','image/png'),'__MORE_LOGS__':uri(source/'assets/logs-extra.png','image/png')}
for key,filename in [('CORE','core.js'),('RENDER','render.js'),('STORAGE','storage.js'),('SOUND','sound.js'),('APP','app.js')]:
    parts['__'+key+'__']=(source/filename).read_text()
for key,value in parts.items(): html=html.replace(key,value)
(root/'dist').mkdir(exist_ok=True)
(root/'dist/index.html').write_text(html)
print('Built index.html:',(root/'dist/index.html').stat().st_size,'bytes')
