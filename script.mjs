import {Transliterate} from 'https://tst-project.github.io/lib/js/transliterate.mjs';
import {Sanscript} from 'https://tst-project.github.io/lib/js/sanscript.mjs';
import hljs from './highlight.min.js';
import hlxml from './xml.min.js';
hljs.registerLanguage('xml',hlxml);

const state = {
    textin: null,
    wordin: null,
    teiout: null,
    htmlout: null
};

const init = () => {
    state.textin = document.getElementById('text_input');
    state.wordin = document.getElementById('word_input');
    state.teiout = document.getElementById('tei_output');
    state.htmlout = document.getElementById('html_output');
    for(const ta of [state.textin,state.wordin]) {
        ta.addEventListener('keyup',keyup);
        ta.addEventListener('blur',update);
    }
    document.getElementsByTagName('button')[0].addEventListener('click',update);
};

const keyup = (e) => {
    if(e.keyCode === 13) update();
};

const tamilToIast = (text) => Sanscript.t(text,'tamil','iast')
.replace(/^⁰|([^\d⁰])⁰/g,'$1¹⁰')
.replace(/l̥/g,'ḷ');

const update = async () => {
    const text = tamilToIast(state.textin.value);
    const words = tamilToIast(state.wordin.value);
    const result = collate(text,words);
    state.teiout.textContent = result;
    hljs.highlightElement(state.teiout);
    state.htmlout.innerHTML = '';
    const out = await teitohtml(result);
    tamilize(out);
    state.htmlout.append(out);
};

const collate = (text, words) => {
    const salad = words.split('\n');
    const split = salad.map(s => s.split('-').map(w => w.trim()));
    let rem = text;
    let res = '';
    for(const cur of split) {
        const find = cur[0];
        const lemma = cur[1];
        const found = ingest(rem,find);
        if(!found)
            return `Error at ${find}.`;

        const spacesmatch = found[0].match(/^[\s\n]+/);
        const spaces = spacesmatch ? spacesmatch[0] : '';
        const trimmed = found[0].trimStart();
        if(lemma || trimmed !== find)
            res += `${spaces}<w lemma="${lemma || find}">${trimmed}</w>`.replace(/\n/,'<caesura/>');
        else
            res += `${spaces}<w>${trimmed}</w>`.replace(/\n/,'<caesura/>');
        rem = found[1];
    }
    return `<s>${res}</s>${rem}`;
};

const teitohtml = async (str) => {
    const teidoc = xml.parseString(`<?xml version="1.0" encoding="UTF-8"?><TEI xmlns="http://www.tei-c.org/ns/1.0">${str}</TEI>`);
    cleanup(teidoc);
    const res = await fetch('./tei-to-html.xsl');
    const restext = await res.text();
    const sheet = xml.parseString(restext);
    const out = await xml.XSLTransform(sheet,teidoc);
    const frag = document.createDocumentFragment();
    while(out.documentElement.firstChild) frag.appendChild(out.documentElement.firstChild);
    return frag;
};

const tamilize = (frag) => {
    const walker = document.createTreeWalker(frag,NodeFilter.SHOW_TEXT,{
        acceptNode(node) {
            const parTag = node.parentNode.nodeName;
            if(parTag === 'RP' || parTag === 'RT') return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
        }
    },false);
    let prev = null;
    const vowels = /[aāiīuūoōeēṛṝ]/;
    while(walker.nextNode()) {
        if(prev) {
            const first = walker.currentNode.data[0];
            if(first.match(vowels)) {
                const start = prev.data.slice(-1);
                prev.data = prev.data.slice(0,-1);
                walker.currentNode.data = start + walker.currentNode.data;
            }
            prev.data = iastToTamil(prev.data,'iast','tamil');
            prev = null;
        }
        const last = walker.currentNode.data.slice(-1);
        if(!last.match(/[aāiīuūoōeēṛṝ]/)) {
            prev = walker.currentNode;
        }
        else walker.currentNode.data = iastToTamil(walker.currentNode.data,'iast','tamil');
    }
    if(prev) prev.data = iastToTamil(prev.data,'iast','tamil');

    for(const rt of frag.querySelectorAll('rt'))
        rt.textContent = iastToTamil(rt.textContent,'iast','tamil');
};
const smush = (text,d_conv = false) => {
    // d_conv is DHARMA convention
    if(!d_conv) text = text.toLowerCase();

    // remove space between word-final consonant and word-initial vowel
    text = text.replace(/([gḍdrmvynhs]) ([aāiīuūṛeēoōêô])/g, '$1$2');

    if(d_conv) text = text.toLowerCase();

    // remove space between word-final consonant and word-intial consonant
    text = text.replace(/([kgcjñḍtdnpbmrlyẏvśṣsṙ]) ([kgcjṭḍtdnpbmyẏrlvśṣshḻ])/g, '$1$2');

    // join final o/e/ā and avagraha/anusvāra
    text = text.replace(/([oōeēā]) ([ṃ'])/g,'$1$2');

    text = text.replace(/ü/g,'\u200Cu');
    text = text.replace(/ï/g,'\u200Ci');

    text = text.replace(/_{1,2}(?=\s*)/g, function(match) {
        if(match === '__') return '\u200D';
        else if(match === '_') return '\u200C';
    });

    return text;
};

const iastToTamil = (text) => {
    const txt = smush(text);
    const grv = new Map([
        ['\u0B82','\u{11300}'],
        ['\u0BBE','\u{1133E}'],
        ['\u0BBF','\u{1133F}'],
        ['\u0BC0','\u{11340}'],
        ['\u0BC1','\u{11341}'],
        ['\u0BC2','\u{11342}'],
        ['\u0BC6','\u{11347}'],
        ['\u0BC7','\u{11347}'],
        ['\u0BC8','\u{11348}'],
        ['\u0BCA','\u{1134B}'],
        ['\u0BCB','\u{1134B}'],
        ['\u0BCC','\u{1134C}'],
        ['\u0BCD','\u{1134D}'],
        ['\u0BD7','\u{11357}']
    ]);
    const grc = ['\u{11316}','\u{11317}','\u{11318}','\u{1131B}','\u{1131D}','\u{11320}','\u{11321}','\u{11322}','\u{11325}','\u{11326}','\u{11327}','\u{1132B}','\u{1132C}','\u{1132D}'];

    const smushed = text
        .replace(/([kṅcñṭṇtnpmyrlvḻḷṟṉ])\s+([aāiīuūeēoō])/g, '$1$2')
        .replace(/ḷ/g,'l̥')
        .replace(/(^|\s)_ā/g,'$1\u0B85\u200D\u0BBE')
        .replace(/(\S)([AĀIĪUŪEĒOŌ])/g,'$1\u200C$2')
        .replace(/(\S)·/g,'$1\u200C')
        .toLowerCase();
    const rgex = new RegExp(`([${grc.join('')}])([${[...grv.keys()].join('')}])`,'g');
    const pretext = Sanscript.t(smushed,'iast','tamil');
    return pretext.replace(rgex, function(m,p1,p2) {
        return p1+grv.get(p2); 
    });
};

const cleanup = (doc) => {
    const breakup = doc.querySelectorAll('w caesura');
    for(const b of breakup) {
        const next = b.nextSibling;
        const par = b.closest('w');
        par.after(b);
        if(next) b.after(next);
    }
};

const xml = {
    parseString(str) {
        const parser = new DOMParser();
        const newd = parser.parseFromString(str,'text/xml');
        if(newd.documentElement.nodeName === 'parsererror')
            alert(`The XML file could not be loaded. Please contact your friendly local system administrator. Error: ${newd.documentElement.textContent}`);
        else
            return newd;
    },
    async XSLTransform(xslsheet,doc) {
        // compile all xsl:imports to avoid browser incompatibilities
        
        for(const x of xslsheet.querySelectorAll('import')) {
            const resp = await fetch(x.getAttribute('href'));
            const i = xml.parseString(await resp.text());

            while(i.documentElement.firstChild)
                x.before(i.documentElement.firstChild);
            x.remove();
        }
        const xproc = new XSLTProcessor();
        xproc.importStylesheet(xslsheet);
        return xproc.transformToDocument(doc);
    }
};

const ingest = (text,str) => {
    let rem = text;
    let ret = '';
    for(let i=0;i<str.length;i++) {
        const spacesmatch = rem.match(/^[\s\n]+/);
        const spaces = spacesmatch ? spacesmatch[0] : '';
        const trimmed = rem.substring(spaces.length);
        if(trimmed[0] !== str[i])
            return false;
        else {
            ret += spaces + str[i];
            rem = trimmed.substring(1);
        }
    }
    return [ret,rem];
};

document.addEventListener('DOMContentLoaded',init);
