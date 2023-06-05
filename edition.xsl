<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
                xmlns:exsl="http://exslt.org/common"
                xmlns:x="http://www.tei-c.org/ns/1.0"
                xmlns:tst="https://github.com/tst-project"
                exclude-result-prefixes="x tst">

<xsl:import href="lib/xslt/copy.xsl"/>
<xsl:import href="lib/xslt/functions.xsl"/>
<xsl:import href="lib/xslt/definitions.xsl"/>
<xsl:import href="lib/xslt/common.xsl"/>
<xsl:import href="lib/xslt/teiheader.xsl"/>
<xsl:import href="lib/xslt/transcription.xsl"/>
<xsl:import href="lib/xslt/apparatus.xsl"/>
<xsl:import href="tei-to-html.xsl"/>

<xsl:output method="html" encoding="UTF-8" omit-xml-declaration="yes"/>

<xsl:param name="root">./lib/</xsl:param>

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
                <xsl:attribute name="href">lib/img/favicon-32.png</xsl:attribute>
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
            <xsl:element name="link">
                <xsl:attribute name="rel">stylesheet</xsl:attribute>
                <xsl:attribute name="href">edition.css</xsl:attribute>
            </xsl:element>
            <xsl:element name="style">
                <xsl:text>
                </xsl:text>
            </xsl:element>
            <!--xsl:element name="script">
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
            </xsl:element-->
            <xsl:element name="script">
                <xsl:attribute name="type">module</xsl:attribute>
                <xsl:attribute name="src">edition.mjs</xsl:attribute>
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

<xsl:template match="x:text/x:body/x:div">
    <xsl:element name="div">
        <xsl:attribute name="class">lg wide</xsl:attribute>
        <xsl:call-template name="lang"/>
        <xsl:if test="@xml:id">
            <xsl:attribute name="id"><xsl:value-of select="@xml:id"/></xsl:attribute>
        </xsl:if>
        <xsl:apply-templates/>
        <xsl:variable name="id"><xsl:text>#</xsl:text><xsl:value-of select="@xml:id"/></xsl:variable>
        <xsl:variable name="apparatus" select="//x:standOff[@type='apparatus' and @corresp=$id]"/>
        <xsl:if test="$apparatus">
            <xsl:call-template name="apparatus">
                <xsl:with-param name="apparatus" select="$apparatus"/>
            </xsl:call-template>
        </xsl:if>
    </xsl:element>
</xsl:template>
<xsl:template match="x:div/x:p">
    <xsl:element name="div">
        <xsl:attribute name="class">
            <xsl:text>text-block </xsl:text>
            <xsl:choose>
                <xsl:when test="@type='edition'"><xsl:text>edition</xsl:text></xsl:when>
                <xsl:when test="@type='translation'"><xsl:text>translation</xsl:text></xsl:when>
                <xsl:otherwise/>
            </xsl:choose>
        </xsl:attribute>
        <xsl:call-template name="lang"/>
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>
<xsl:template match="x:div/x:lg">
    <xsl:element name="div">
        <xsl:attribute name="class">
            <xsl:text>text-block </xsl:text>
            <xsl:choose>
                <xsl:when test="@type='edition'"><xsl:text>edition</xsl:text></xsl:when>
                <xsl:when test="@type='translation'"><xsl:text>translation</xsl:text></xsl:when>
                <xsl:otherwise/>
            </xsl:choose>
        </xsl:attribute>
        <xsl:call-template name="lang"/>
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>
<xsl:template match="x:l">
    <xsl:element name="div">
        <xsl:attribute name="class">
            <xsl:text>l</xsl:text>
            <xsl:if test="@rend">
                <xsl:text> </xsl:text>
                <xsl:value-of select="@rend"/>
            </xsl:if>
        </xsl:attribute>
        <xsl:call-template name="lang"/>
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>
<xsl:template match="x:choice">
    <xsl:element name="span">
    <xsl:attribute name="class">choice</xsl:attribute>
    <xsl:apply-templates />
    </xsl:element>
</xsl:template>
<xsl:template match="x:seg">
    <xsl:element name="span">
        <xsl:call-template name="lang"/>
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>

<xsl:template match="x:standOff">
    <xsl:element name="div">
        <xsl:attribute name="class">standOff</xsl:attribute>
        <xsl:attribute name="data-corresp"><xsl:value-of select="@corresp"/></xsl:attribute>
        <xsl:attribute name="data-type"><xsl:value-of select="@type"/></xsl:attribute>
        <xsl:call-template name="lang"/>
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>
<xsl:template match="x:fs">
    <xsl:element name="div">
        <xsl:attribute name="class">fs</xsl:attribute>
        <xsl:attribute name="data-corresp"><xsl:value-of select="@corresp"/></xsl:attribute>
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>
<xsl:template match="x:f">
    <xsl:element name="div">
        <xsl:attribute name="class">f</xsl:attribute>
        <xsl:attribute name="data-name"><xsl:value-of select="@name"/></xsl:attribute>
        <xsl:apply-templates/>
    </xsl:element>
</xsl:template>

<xsl:template match="x:standOff[@type='apparatus']"/>

<xsl:template name="apparatus">
    <xsl:param name="apparatus"/>
    <xsl:apply-templates select="$apparatus/x:listApp"/>
</xsl:template>
<xsl:template match="x:standOff/x:listApp">
    <xsl:element name="div">
        <xsl:attribute name="class">apparatus-block</xsl:attribute>
        <xsl:attribute name="style">display: none;</xsl:attribute>
        <xsl:for-each select="x:app">
            <xsl:call-template name="app"/>
        </xsl:for-each>
    </xsl:element>
</xsl:template>

<xsl:template name="app">
    <xsl:element name="span">
        <xsl:attribute name="class">app</xsl:attribute>
        <xsl:choose>
            <xsl:when test="x:lem">
                <xsl:call-template name="lemma"/>
            </xsl:when>
            <xsl:otherwise>
                <span class="lem lem-anchor">†</span>
            </xsl:otherwise>
        </xsl:choose>
        <xsl:if test="x:rdg">
            <span>
                <xsl:for-each select="x:rdg">
                    <xsl:call-template name="reading"/>
                </xsl:for-each>
            </span>
        </xsl:if>
        <xsl:for-each select="x:note">
            <xsl:text> </xsl:text>
            <xsl:apply-templates select="."/>
        </xsl:for-each>
    </xsl:element>
    <xsl:text> </xsl:text>
</xsl:template>
<xsl:template name="lemma">
    <!--xsl:variable name="corresp" select="ancestor::*[@corresp]/@corresp"/-->
    <xsl:element name="span">
        <xsl:attribute name="class">lem</xsl:attribute>
        <xsl:attribute name="data-corresp"><xsl:value-of select="@corresp"/></xsl:attribute>
        <xsl:apply-templates select="x:lem/node()"/>
    </xsl:element>
    <xsl:if test="x:lem/@wit">
        <span>
            <xsl:attribute name="class">lem-wit</xsl:attribute>
            <xsl:call-template name="splitwit">
                <xsl:with-param name="mss" select="x:lem/@wit"/>
                <!--xsl:with-param name="corresp" select="$corresp"/-->
            </xsl:call-template>
        </span>
    </xsl:if>
    <xsl:text> </xsl:text>
</xsl:template>

<xsl:template name="reading">
    <!--xsl:variable name="corresp" select="ancestor::*[@corresp]/@corresp"/-->
    <span>
        <xsl:attribute name="class">rdg</xsl:attribute>
        <span>
            <xsl:attribute name="class">rdg-text</xsl:attribute>
            <xsl:choose>
                <xsl:when test="./node()">
                    <xsl:apply-templates select="./node()"/>
                </xsl:when>
                <xsl:otherwise>
                    <span lang="en">[om.]</span>
                </xsl:otherwise>
            </xsl:choose>
        </span>
        <xsl:text> </xsl:text>
        <span>
            <xsl:attribute name="class">rdg-wit</xsl:attribute>
            <xsl:call-template name="splitwit">
                <!--xsl:with-param name="corresp" select="$corresp"/-->
            </xsl:call-template>
        </span>
    </span>
    <xsl:text> </xsl:text>
</xsl:template>
</xsl:stylesheet>
