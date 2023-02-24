import { iastToTamil, tamilToIast, tamilize } from './transliterate.mjs';
import hljs from './highlight.min.js';
import hlxml from './xml.min.js';
import JSONCrush from './JSONCrush.min.js';

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
    const searchParams = new URLSearchParams(window.location.search);
    if(searchParams.has('q')) {
        const data = JSON.parse(
            JSONCrush.uncrush(
                decodeURIComponent(searchParams.get('q'))
            )
        );
        state.textin.value = data.text || '';
        state.wordin.value = data.words || '';
    }
    else {
        state.textin.value = document.getElementById('default_text').textContent;
        state.wordin.value = document.getElementById('default_gloss').textContent;
    }
    for(const ta of [state.textin,state.wordin]) {
        ta.addEventListener('keyup',keyup);
        ta.addEventListener('blur',update);
    }
    document.getElementsByTagName('button')[0].addEventListener('click',update);
};

const keyup = (e) => {
    if(e.keyCode === 13) update();
};

const update = async () => {
    const text = tamilToIast(state.textin.value);
    const words = tamilToIast(state.wordin.value);
    const result = collate(text,words);
    state.teiout.textContent = result.replace(/></g,'>​<').replace(/(\w)\s(\w)/g,'$1 $2');
    hljs.highlightElement(state.teiout);
    state.htmlout.innerHTML = '';
    const out = await teitohtml(result);
    tamilize(out);
    state.htmlout.append(out);
    const qs = encodeURIComponent(
        JSONCrush.crush(
            JSON.stringify({text: state.textin.value, words: state.wordin.value})
        )
    );
    window.history.replaceState(null,null,window.location.pathname+`?q=${qs}`);
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
    while(out.body.firstChild) frag.appendChild(out.body.firstChild);
    return frag;
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
