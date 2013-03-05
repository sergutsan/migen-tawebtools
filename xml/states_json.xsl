<?xml version="1.0" encoding="ISO-8859-1"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"  xmlns:jn='http://www.json.org'>

<xsl:output method="html" />

<xsl:template match="/">
	[ 
	<xsl:for-each select="interactiondata/actions/action[content/properties/property/@value='InactivityVerifier'] | interactiondata/actions/action[content/properties/property/@value='FeedbackGenerated']">

		<xsl:if test="position() &gt; 1">,</xsl:if>
		{
			time:<xsl:value-of select="@time"/>,
			userid:"<xsl:value-of select="user/@id"/>",

			<xsl:for-each select="object/properties/property">

			<xsl:choose>

				<xsl:when test="@name='VIEW_URL'">
					url:"<xsl:value-of select="@value"/>",
				</xsl:when>

				</xsl:choose>

			</xsl:for-each>

			message:"<xsl:value-of select="content/description/."/>",

			<xsl:for-each select="content/properties/property">

			<xsl:choose>

				<xsl:when test="@name='value'">
					value:<xsl:value-of select="@value"/>,
				</xsl:when>

				<xsl:when test="@name='FEEDBACK_STRATEGY_ID'">
					value:<xsl:value-of select="@value"/>,
				</xsl:when>

				<xsl:when test="@name='ANALYSIS_TYPE'">
					type:"<xsl:value-of select="@value"/>"
				</xsl:when>

			</xsl:choose>

			</xsl:for-each>
		}
		
	</xsl:for-each>
	]
</xsl:template>

</xsl:stylesheet>


