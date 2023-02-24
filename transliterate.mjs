import {Sanscript} from 'https://tst-project.github.io/lib/js/sanscript.mjs';

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

const tamilToIast = (text) => Sanscript.t(text,'tamil','iast')
.replace(/^⁰|([^\d⁰])⁰/g,'$1¹⁰')
.replace(/l̥/g,'ḷ');

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

export { iastToTamil, tamilToIast, tamilize };
