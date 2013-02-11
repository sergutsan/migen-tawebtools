<?xml version="1.0" encoding="ISO-8859-1"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:jn='http://www.json.org'>

<xsl:output method="html" />

<xsl:template match="/">
 	[
	<xsl:for-each select="interactiondata/preamble/users/users/user_def[normalize-space(@role)='Learner']">

		<xsl:if test="position() &gt; 1">,</xsl:if>
		{
				"id":<xsl:value-of select="@id"/>,
				"firstname":"<xsl:value-of select="normalize-space(@firstname)"/>",
				"lastname":"<xsl:value-of select="normalize-space(@lastname)"/>",
				"cd_visible":false,
				"ga_visible":false
		}

	</xsl:for-each>
	]
</xsl:template>

</xsl:stylesheet>
