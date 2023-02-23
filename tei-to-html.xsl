<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
                xmlns:exsl="http://exslt.org/common"
                xmlns:tei="http://www.tei-c.org/ns/1.0"
                xmlns:tst="https://github.com/tst-project"
                exclude-result-prefixes="x tst">

<xsl:output method="html" encoding="UTF-8" omit-xml-declaration="yes"/>

<xsl:template match="tei:TEI">
    <html>
        <xsl:apply-templates/>
    </html>
</xsl:template>

<xsl:template match="tei:s">
    <xsl:apply-templates/>
</xsl:template>

<xsl:template match="tei:w">
    <xsl:choose>
        <xsl:when test="@lemma">
            <xsl:element name="ruby">
                <xsl:apply-templates/>
                <xsl:element name="rp">(</xsl:element>
                <xsl:element name="rt"><xsl:value-of select="@lemma"/></xsl:element>
                <xsl:element name="rp">)</xsl:element>
            </xsl:element>
        </xsl:when>
        <xsl:otherwise>
            <xsl:apply-templates/>
        </xsl:otherwise>
    </xsl:choose>
</xsl:template>
<xsl:template match="tei:caesura">
    <xsl:element name="br"/>
</xsl:template>

</xsl:stylesheet>
