import { Transliterate } from './lib/js/transliterate.mjs';
import { GitHubFunctions } from './lib/js/githubfunctions.mjs';
import { ApparatusViewer } from './lib/js/apparatus.mjs';
import './lib/js/tooltip.mjs';
//import { tamilize, iastToTamil } from './transliterate.mjs';

const lookup = (e) => {
//if(e.target.nodeName === 'RT' || e.target.classList?.contains('word')) {
    const word = e.target.closest('.word');
    if(word) {
        //const clean = e.target.dataset.norm.trim();
        //const clean = word.querySelector('.anno-inline span').textContent;
        const clone = word.cloneNode(true);
        for(const pc of clone.querySelectorAll('.invisible'))
            pc.remove();
        const clean = clone.textContent.replaceAll('\u00AD','');
        window.open(`https://dsal.uchicago.edu/cgi-bin/app/tamil-lex_query.py?qs=${clean}&amp;searchhws=yes&amp;matchtype=exact`,'lexicon',/*'height=500,width=500'`*/);
    }
};

const cleanup = (doc) => {
    const breakup = doc.querySelectorAll('.word br');
    for(const b of breakup) {
        const next = b.nextSibling;
        const par = b.closest('.word');
        if(next) {
            const nextword = par.nextElementSibling;
            if(!nextword.dataset.norm) nextword.dataset.norm = visibleText(nextword);
            nextword.prepend(next);
        }
        par.after(b);
    }
};

const visibleText = (node) => {
    const clone = node.cloneNode(true);
    const walker = document.createTreeWalker(clone,NodeFilter.SHOW_ELEMENT);
    while(walker.nextNode()) {
        const cur = walker.currentNode;
        if(cur.classList.contains('anno-inline') || cur.style.display === 'none') cur.remove();
    }
    return clone.textContent;
};

const apparatusswitch = (e) => {
    const blocks = [...document.querySelectorAll('.edition')].map(el => el.parentElement);
    const target = e.target.closest('.apparatus-button-icon');
    if(target.dataset.anno === 'apparatus of variants') {
        for(const block of blocks) {
            const trans = block.querySelector('.text-block.translation');
            if(trans) trans.style.display = 'none';
            const app = block.querySelector('.apparatus-block');
            if(app) app.style.display = 'block';
        }
        target.dataset.anno = 'translation';
    }
    else {
        for(const block of blocks) {
            const trans = block.querySelector('.text-block.translation');
            if(trans) trans.style.display = 'block';
            const app = block.querySelector('.apparatus-block');
            if(app) app.style.display = 'none';
        }
        target.dataset.anno = 'apparatus of variants';
    }
};

const wordsplit = (e) => {
    const target = e.target.closest('.analyze-button-icon');
    const script = document.getElementById('transbutton').lang === 'en' ? 'taml' : 'iast';
    const standoffs = document.querySelectorAll('.standOff[data-type="wordsplit"]');
    if(target.dataset.anno === 'word-split text') {
        for(const standoff of standoffs) {
            const target = document.getElementById(standoff.dataset.corresp.replace(/^#/,''))?.querySelector('.edition');
        
            if(document.getElementById('transbutton').lang === 'en') {
                Transliterate.revert(target);
            }
            applymarkup(standoff);
            Transliterate.refreshCache(target);
            if(document.getElementById('transbutton').lang === 'en') {
                Transliterate.activate(target);
            }
        }
        target.dataset.anno = 'metrical text';
    }
    else {
        for(const standoff of standoffs) {
            const target = document.getElementById(standoff.dataset.corresp.replace(/^#/,''))?.querySelector('.edition');
            if(document.getElementById('transbutton').lang === 'en')
                Transliterate.revert(target);
            removemarkup(standoff);
            Transliterate.refreshCache(target);
            if(document.getElementById('transbutton').lang === 'en') {
                Transliterate.activate(target);
            }
        }
        target.dataset.anno = 'word-split text';
    }
};

const countpos = (str, pos) => {
    if(pos === 0) return 0;
    let realn = 0;
    for(let n=1;n<=str.length;n++) {
       if(str[n] !== '\u00AD')
           realn = realn + 1;
        if(realn === pos) return n;
    }
};
const nextSibling = (node) => {
    let start = node;
    while(start) {
        let sib = start.nextSibling;
        if(sib) return sib;
        else start = start.parentElement; 
    }
    return false;
};

const nextTextNode = (start) => {
    let next = nextSibling(start);
    while(next) {
        if(next.nodeType === 3) return next;
        else next = next.firstChild || nextSibling(next);
    }
    return null;
};
const applymarkup = (standoff) => {
    const target = document.getElementById(standoff.dataset.corresp.replace(/^#/,''))?.querySelector('.edition');
    if(!target) return;
    
    const fss = [...standoff.querySelectorAll('.fs')]
        .filter(fs => fs.dataset.corresp)
        .map(fs => {
            const pos = fs.dataset.corresp.split(',');
            return {
                start: pos[0],
                end: pos[1],
                lemma: fs.querySelector('[data-name="lemma"]').cloneNode(true),
                translation: fs.querySelector('[data-name="translation"]').cloneNode(true)
            };
    });
    const positions = fss.reduce((acc, cur) => {
        if(!acc.includes(cur.start))
            acc.push(cur.start);
        if(!acc.includes(cur.end))
            acc.push(cur.end);
        return acc;
    },[]);
    positions.sort((a,b) => a - b);

    const posmap = new Map();

    const walker = document.createTreeWalker(target,NodeFilter.SHOW_TEXT);
    let start = 0;
    while(walker.nextNode()) {
        const cur = walker.currentNode;
        const clean = cur.data.replaceAll('\u00AD','');
        const end = start + clean.length;
        while(positions[0] <= end) {
            const pos = positions.shift();
            const realpos = countpos(cur.data,pos-start);
            posmap.set(pos,{node: cur, pos: realpos});
        }
        start = end;
    }
    const ranges = [];
    for(const fs of fss) {
        const start = posmap.get(fs.start);
        const end = posmap.get(fs.end);
        const range = document.createRange();
        if(start.pos === start.node.data.length) {
            // move to the beginning of the next text node
            range.setStart(nextTextNode(start.node),0);
            // if there is no next text node something is wrong
        }
        else
            range.setStart(start.node,start.pos);
        
        range.setEnd(end.node,end.pos);

        ranges.push({range: range, fs: fs});
    }
    for(const range of ranges) {
        if(range.range.startContainer.data.length === range.range.startOffset) {
            // move start past the previous range that was surrounded
            range.range.setStart(range.range.startContainer.nextSibling.nextSibling,0);
        }
        /*
        const ruby = document.createElement('ruby');
        //range.range.surroundContents(ruby);
        
        ruby.appendChild(range.range.extractContents());
        range.range.insertNode(ruby);
        
        const br = ruby.querySelector('br');
        if(br) ruby.after(br);
        
        const rt = document.createElement('rt');
        rt.append(range.fs.lemma);
        rt.append('\u200B');
        ruby.appendChild(rt);
        */
        const word = document.createElement('span');
        word.className = 'word split';
        
        word.myOldContent = range.range.extractContents();
        /*
        if(range.range.startContainer.nodeType === 1 && range.range.startOffset !== 0) {
            console.log(range.range.startContainer.children.item(range.range.startOffset-1));
            const previtem = range.range.startContainer.childNodes.item(range.range.startOffset-1);
            if(previtem && previtem.nodeType === 1 && !previtem.data) {
                range.range.setStart(previtem,0);
                previtem.classList.add('toremove');
            }
        }*/
        /*
        if(prevSib && prevSib.nodeType === 1 && !prevSib.data)
            prevSib.prepend(word);
        else*/
            range.range.insertNode(word);

        word.lang = word.parentNode.lang;

        const br = word.myOldContent.querySelector('br');
        if(br) {
            const newbr = br.cloneNode(true);
            newbr.classList.add('toremove');
            word.after(newbr);
        }
        const clone = range.fs.lemma.cloneNode(true);
        while(clone.firstChild) {
            if(clone.firstChild.nodeType === 1)
                clone.firstChild.lang = 'ta-Latn-t-ta-Taml'; // there's probably a better way
            word.append(clone.firstChild);
        }
        word.dataset.anno = range.fs.translation.textContent;
    }
};

const removemarkup = (standoff) => {
    const target = document.getElementById(standoff.dataset.corresp.replace(/^#/,''));
    if(!target) return;

    for(const toremove of target.querySelectorAll('.toremove')) {
        while(toremove.firstChild)
            toremove.after(toremove.firstChild);
        toremove.remove();
    }
    for(const word of target.querySelectorAll('span.word')) {
        word.replaceWith(word.myOldContent);
    }
    target.normalize();
};

const go = () => {
    const recordcontainer = document.getElementById('recordcontainer');
    Transliterate.init(recordcontainer);

    for(const t of recordcontainer.querySelectorAll('.teitext > div > div:first-child')) {
        //tamilize(t);
        for(const b of t.querySelectorAll('ruby br')) {
            b.parentElement.after(b.nextSibling);
            b.parentElement.after(b);
        }
    }
    recordcontainer.querySelector('.teitext').addEventListener('click',lookup);
    
    const lineview = recordcontainer.querySelector('.line-view-icon');
    const analyzebutton = lineview.cloneNode(true);
    analyzebutton.className = 'analyze-button-icon';
    analyzebutton.dataset.anno = 'word-split text';
    analyzebutton.addEventListener('click',wordsplit);
    lineview.after(analyzebutton);
    

    const apparatusbutton = lineview.cloneNode(true);
    apparatusbutton.className = 'apparatus-button-icon';
    apparatusbutton.dataset.anno = 'apparatus of variants';
    apparatusbutton.addEventListener('click',apparatusswitch);
    recordcontainer.querySelector('.text-siglum').append(apparatusbutton);
    //wordsplit({target: analyzebutton});
    //cleanup(document);
    
    lineview.style.display = 'none';

    if(document.querySelector('.app')) {
        ApparatusViewer.init();
        ApparatusViewer.setTransliterator(Transliterate);
    }

    GitHubFunctions.latestCommits();
};
window.addEventListener('load',go);
