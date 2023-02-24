<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
                xmlns:exsl="http://exslt.org/common"
                xmlns:x="http://www.tei-c.org/ns/1.0"
                xmlns:tst="https://github.com/tst-project"
                exclude-result-prefixes="x tst">

<xsl:import href="https://tst-project.github.io/lib/xslt/copy.xsl"/>
<xsl:import href="https://tst-project.github.io/lib/xslt/functions.xsl"/>
<xsl:import href="https://tst-project.github.io/lib/xslt/definitions.xsl"/>
<xsl:import href="https://tst-project.github.io/lib/xslt/common.xsl"/>
<xsl:import href="https://tst-project.github.io/lib/xslt/teiheader.xsl"/>
<xsl:import href="https://tst-project.github.io/lib/xslt/transcription.xsl"/>
<xsl:import href="https://tst-project.github.io/lib/xslt/apparatus.xsl"/>
<xsl:import href="tei-to-html.xsl"/>

<xsl:output method="html" encoding="UTF-8" omit-xml-declaration="yes"/>

<xsl:param name="root">https://tst-project.github.io/lib/</xsl:param>

<xsl:template name="TEI">
    <xsl:element name="html">
        <xsl:element name="head">
            <xsl:element name="meta">
                <xsl:attribute name="charset">utf-8</xsl:attribute>
            </xsl:element>
            <xsl:element name="meta">
                <xsl:attribute name="name">viewport</xsl:attribute>
                <xsl:attribute name="content">width=device-width,initial-scale=1</xsl:attribute>
            </xsl:element>
            <xsl:element name="title">
                <xsl:value-of select="//x:titleStmt/x:title"/>
            </xsl:element>
            <xsl:element name="link">
                <xsl:attribute name="rel">icon</xsl:attribute>
                <xsl:attribute name="type">image/png</xsl:attribute>
                <xsl:attribute name="href">favicon-32.png</xsl:attribute>
            </xsl:element>
            <xsl:element name="link">
                <xsl:attribute name="rel">stylesheet</xsl:attribute>
                <xsl:attribute name="href"><xsl:value-of select="$root"/>css/tufte.css</xsl:attribute>
            </xsl:element>
            <xsl:element name="link">
                <xsl:attribute name="rel">stylesheet</xsl:attribute>
                <xsl:attribute name="href"><xsl:value-of select="$root"/>css/fonts.css</xsl:attribute>
            </xsl:element>
            <xsl:element name="link">
                <xsl:attribute name="rel">stylesheet</xsl:attribute>
                <xsl:attribute name="href"><xsl:value-of select="$root"/>css/tst.css</xsl:attribute>
            </xsl:element>
            <xsl:element name="link">
                <xsl:attribute name="rel">stylesheet</xsl:attribute>
                <xsl:attribute name="href"><xsl:value-of select="$root"/>css/header.css</xsl:attribute>
            </xsl:element>
            <xsl:element name="link">
                <xsl:attribute name="rel">stylesheet</xsl:attribute>
                <xsl:attribute name="href"><xsl:value-of select="$root"/>css/transcription.css</xsl:attribute>
            </xsl:element>
            <xsl:element name="link">
                <xsl:attribute name="rel">stylesheet</xsl:attribute>
                <xsl:attribute name="href"><xsl:value-of select="$root"/>css/apparatus.css</xsl:attribute>
            </xsl:element>
            <xsl:element name="style">
                <xsl:text>
                    .text-block:first-child { line-height: 5rem;}
                    .text-block:last-child {line-height: 5rem; }
                    rt { padding-bottom: 0.5rem;}
                    rt:hover, span.word:hover { background-color: yellow; cursor: pointer; }
                    #tooltip { font-size: 1.1rem; }
                </xsl:text>
            </xsl:element>
            <xsl:element name="script">
                <xsl:attribute name="type">module</xsl:attribute>
                <xsl:text>import { TSTViewer } from '</xsl:text>
                <xsl:value-of select="$root"/>
                <xsl:text>js/tst.mjs';
                window.addEventListener('load',TSTViewer.init);
                </xsl:text>
                <xsl:variable name="annos" select="x:teiHeader/x:xenoData[@type='webannotation']"/>
                <xsl:if test="$annos">
                        <xsl:text>TSTViewer.setAnnotations(</xsl:text>
                        <xsl:value-of select="$annos"/>
                        <xsl:text>);</xsl:text>
                </xsl:if>
            </xsl:element>
            <xsl:element name="script">
                <xsl:attribute name="type">module</xsl:attribute>
                <xsl:text>import { tamilize } from './transliterate.mjs';
                const lookup = (e) => {
                if(e.target.nodeName === 'RT' || e.target.classList?.contains('word')) {
                    const clean = e.target.dataset.lemma.trim();
                    window.open(`https://dsal.uchicago.edu/cgi-bin/app/tamil-lex_query.py?qs=${clean}&amp;searchhws=yes&amp;matchtype=exact`,'lexicon','height=400,width=400');
                }
                };
                const go = () => {
                    for(const t of document.querySelectorAll('.teitext > div > div:first-child')) {
                        tamilize(t);
                        for(const b of t.querySelectorAll('ruby br')) {
                            b.parentElement.after(b.nextSibling);
                            b.parentElement.after(b);
                        }
                    }
                    const button = document.getElementById('transbutton');
                    button.style.display = 'none';
                    document.querySelector('.teitext').addEventListener('click',lookup);
                };
                window.addEventListener('load',go);
                </xsl:text>
            </xsl:element>
        </xsl:element>
        <xsl:element name="body">
            <xsl:attribute name="lang">en</xsl:attribute>   
            <xsl:element name="div">
                <xsl:attribute name="id">recordcontainer</xsl:attribute>
                <xsl:element name="div">
                    <xsl:choose>
                        <xsl:when test="x:facsimile/x:graphic">
                            <xsl:attribute name="id">record-thin</xsl:attribute>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:attribute name="id">record-fat</xsl:attribute>
                        </xsl:otherwise>
                    </xsl:choose>
                    <xsl:element name="div">
                        <xsl:attribute name="id">topbar</xsl:attribute>
                        <xsl:element name="div">
                            <xsl:attribute name="id">transbutton</xsl:attribute>
                            <xsl:attribute name="title">change script</xsl:attribute>
                            <xsl:text>A</xsl:text>
                        </xsl:element>
                    </xsl:element>
                    <xsl:element name="article">
                        <xsl:apply-templates/>
                    </xsl:element>
                </xsl:element>
            </xsl:element>
            <xsl:variable name="manifest" select="x:facsimile/x:graphic/@url"/>
            <xsl:if test="$manifest">
                <xsl:element name="div">
                    <xsl:attribute name="id">viewer</xsl:attribute>
                    <xsl:attribute name="data-manifest">
                        <xsl:value-of select="$manifest"/>
                    </xsl:attribute>
                    <xsl:variable name="start" select="x:facsimile/x:graphic/@facs"/>
                    <xsl:attribute name="data-start">
                        <xsl:choose>
                            <xsl:when test="$start"><xsl:value-of select="$start - 1"/></xsl:when>
                            <xsl:otherwise>0</xsl:otherwise>
                        </xsl:choose>
                    </xsl:attribute>
                </xsl:element>
            </xsl:if>
        </xsl:element>
    </xsl:element>
</xsl:template>

<xsl:template match="x:TEI">
    <xsl:call-template name="TEI"/>
</xsl:template>

<xsl:template match="x:text/x:body/x:p">
    <xsl:element name="div">
        <xsl:attribute name="class">lg wide</xsl:attribute>
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>
<xsl:template match="x:p/x:div[1]">
    <xsl:element name="div">
        <xsl:attribute name="class">text-block</xsl:attribute>
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>
<xsl:template match="x:p/x:div[2]">
    <xsl:element name="div">
        <xsl:attribute name="class">text-block</xsl:attribute>
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>
</xsl:stylesheet>
