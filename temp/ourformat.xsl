<?xml version="1.0" encoding="ISO-8859-1"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:jn='http://www.json.org'>

<xsl:output method="jn:json" />

<xsl:template match="/">
 
      <xsl:for-each select="actions/action">

      <xsl:if test="position() &gt; 1">,</xsl:if>
      {
        "time":<xsl:value-of select="@time"/>,
        <xsl:apply-templates select="user"/>,
        <xsl:apply-templates select="object/properties/property"/>,
        <xsl:apply-templates select="content/description"/>,
        <xsl:apply-templates select="content/properties/property"/>
      }
      </xsl:for-each>

</xsl:template>

<xsl:template match="user">
        "user":"<xsl:value-of select="@id"/>"
</xsl:template>

<xsl:template match="object/properties/property">
        "url":"<xsl:value-of select="@value"/>"
</xsl:template>

<xsl:template match="description">
        "status":"<xsl:value-of select="."/>"
</xsl:template>

<xsl:template match="content/properties/property">
        "value":"<xsl:value-of select="@value"/>"
</xsl:template>

</xsl:stylesheet>

