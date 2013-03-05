<?xml version="1.0" encoding="ISO-8859-1"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"  xmlns:jn='http://www.json.org'>

<xsl:output method="html" />

<xsl:template match="/">
	[
 	<xsl:for-each select="moodle-resources-map/context">
		<xsl:if test="position() &gt; 1">,</xsl:if>
		{
			"id":"<xsl:value-of select="@id" />",
			"title":"<xsl:value-of select="title" />",
			"tasks":
			<xsl:for-each select="tasks/task">
				<xsl:if test="position() &gt; 1">,</xsl:if>
				{
					"id":"<xsl:value-of select="@id" />",
					"title":"<xsl:value-of select="title" />"
				}
			</xsl:for-each>
		}
	</xsl:for-each>
	]
</xsl:template>

</xsl:stylesheet>

