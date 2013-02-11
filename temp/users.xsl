<?xml version="1.0" encoding="ISO-8859-1"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:jn='http://www.json.org'>

<xsl:output method="jn:json" />

<xsl:template match="/">
 
      <xsl:for-each select="interactiondata/preamble/users/user_def">

      <xsl:if test="position() &gt; 1">,</xsl:if>
      [{
        "id":<xsl:value-of select="@id"/>,
        "firstname":"<xsl:value-of select="@firstname"/>",
        "lastname":"<xsl:value-of select="@lastname"/>"
      }]

      </xsl:for-each>

</xsl:template>

</xsl:stylesheet>
