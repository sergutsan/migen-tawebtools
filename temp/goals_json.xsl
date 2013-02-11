<?xml version="1.0" encoding="ISO-8859-1"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"  xmlns:jn='http://www.json.org'>

<xsl:output method="jn:json" />

<xsl:template match="/">
	[ 
	<xsl:for-each select="interactiondata/actions/action[content/properties/property/@value='GoalAchievement']">

		<xsl:if test="position() &gt; 1">,</xsl:if>
		{
			time:<xsl:value-of select="@time"/>,
			url:"<xsl:value-of select="object/properties/property/@value"/>",
			message:"<xsl:value-of select="content/description/."/>",

			<xsl:for-each select="content/properties/property">

			<xsl:choose>

				<xsl:when test="@name='GOAL_ID'">
					id:<xsl:value-of select="@value"/>,
				</xsl:when>
 
				<xsl:when test="@name='value'">
					value:<xsl:value-of select="@value"/>
				</xsl:when>

			</xsl:choose>

			</xsl:for-each>
		}
	</xsl:for-each>
	]
</xsl:template>

</xsl:stylesheet>


