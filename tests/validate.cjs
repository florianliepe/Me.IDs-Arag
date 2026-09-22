const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
const canonical = 'https://intellectual-twin-insurance-arag.eraneos.com/';
assert(!/Wascosa|cargo|freight|Schienengüter|Olaf|Radant|SIGNAL IDUNA|signal-iduna|intellectual-twin-insurance\.eraneos/i.test(html + script));
assert(html.includes(`rel="canonical" href="${canonical}"`));
assert(html.includes('action="https://formsubmit.co/florian.liepe@eraneos.com"'));
assert(html.includes('name="_cc" value="Oliver.Huefner@eraneos.com,Nicolas.Faulbecker@eraneos.com"'));
assert(html.includes('Dr. Oliver Hüfner'));
assert(html.includes('Partner · Insurance'));
assert(html.includes('src="assets/florian-liepe.jpg" alt="Dr. Florian Liepe"'));
assert(html.includes('src="assets/nicolas-faulbecker.jpg" alt="Nicolas Faulbecker"'));
assert(html.includes('Director · Insurance'));
assert(html.includes('src="assets/arag-logo.png" alt="ARAG"'));
assert.equal((html.match(/class="person-with-portrait"/g) || []).length, 3);
assert(html.includes('data-de="Kunden-versprechen"'));
assert(!html.includes('href="mailto:Oliver.Huefner@eraneos.com"'));
assert.equal((html.match(/class="value-card reveal"/g) || []).length, 4);
assert.equal((html.match(/data-en=/g) || []).length, (html.match(/data-de=/g) || []).length);
for (const topic of ['succession', 'medical-risk-assessment', 'benefits-assessment', 'leadership']) assert(html.includes(`value="${topic}"`));
assert(!/Schadenexpertise|berufsgruppen\/handwerk|crafts-sector/i.test(html));
for (const heading of ['Medical risk assessment expertise', 'Risikoprüfungs-Expertise', 'Benefits assessment', 'Leistungsprüfung']) assert(html.includes(heading));
assert(html.includes('Die Entscheidung über Annahme und Vertragskonditionen'));
assert(html.includes('die finale Leistungsentscheidung verbleiben bei den dafür autorisierten Personen.'));
for (const match of html.matchAll(/(?:src|href)="(assets\/[^"#]+|styles\.css|script\.js)"/g)) assert(fs.existsSync(path.join(root, match[1])), match[1]);
const azureWorkflow = fs.readFileSync(path.join(root, '.github/workflows/azure-static-web-apps.yml'), 'utf8');
assert(azureWorkflow.includes('secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_ARAG'));
assert(azureWorkflow.includes('https://intellectual-twin-insurance-arag.eraneos.com/'));
assert(!/mango-beach|ashy-mud|SWA-Intellectual-Twin-Keynote/.test(azureWorkflow));
assert(!fs.existsSync(path.join(root, 'CNAME')));
JSON.parse(fs.readFileSync(path.join(root, 'staticwebapp.config.json'), 'utf8'));

for (const [origin, pathname, expectedPath] of [
  ['https://florianliepe.github.io', '/Me.IDs-Arag/', '/Me.IDs-Arag/'],
  ['https://florianliepe.github.io', '/Me.IDs-Arag/index.html', '/Me.IDs-Arag/'],
  ['https://orange-ground-08ca4a703.5.azurestaticapps.net', '/', '/']
]) {
  for (const blockedStorage of [false, true]) {
    const next = {value: ''};
    const success = {hidden: true};
    const translated = {dataset: {en: 'English copy', de: 'Deutscher Text'}, textContent: ''};
    const buttons = ['en', 'de'].map(language => ({dataset:{language}, classList:{toggle(){}}, setAttribute(){}, addEventListener(event, callback){this.click=callback;}}));
    const document = {documentElement:{lang:''}, title:'', querySelectorAll(selector){return selector==='[data-language]' ? buttons : [translated];}, querySelector(selector){return selector==='#formNextUrl' ? next : success;}};
    const context = vm.createContext({document, window:{location:{origin, pathname, search:'?submitted=true'}}, navigator:{language:'de-DE'}, URLSearchParams, localStorage:{getItem(){if(blockedStorage) throw new Error('blocked'); return null;}, setItem(){if(blockedStorage) throw new Error('blocked');}}});
    vm.runInContext(script, context);
    assert.equal(document.documentElement.lang, 'de');
    assert.equal(translated.textContent, 'Deutscher Text');
    buttons[0].click();
    assert.equal(document.documentElement.lang, 'en');
    assert.equal(translated.textContent, 'English copy');
    assert.equal(next.value, `${origin}${expectedPath}?submitted=true#contact`);
    assert.equal(success.hidden, false);
  }
}
console.log('PASS: insurance content, bilingual fields, four proposals, contacts, assets, isolation and six form/language scenarios');
