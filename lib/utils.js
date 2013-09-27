//function that loads xml documents
function loadXMLDocAsync(dname,callback,timeout)
{
	var xhttp;
	
	if (window.XMLHttpRequest)
	{
		xhttp=new XMLHttpRequest();
	}
	else
	{
		xhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}

	xhttp.onload=function(e)
	{
		if (xhttp.readyState === 4)
		{
			if (xhttp.status === 200)
			{
				clearTimeout(xmlHttpTimeout);
				callback(xhttp.responseXML);
			}
			else
			{
				alert(xhttp.statusText);
			}
		}
	}	
	
	xhttp.open("GET",dname,true);
	
	var xmlHttpTimeout=setTimeout(ajaxTimeout,timeout);

	function ajaxTimeout()
	{
		xhttp.abort();
		callback(null);
	}

	xhttp.send(null);	
}

function loadXMLDoc(dname)
{
	var xhttp;
	
	if (window.XMLHttpRequest)
	{
		xhttp=new XMLHttpRequest();
	}
	else
	{
		xhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}

	xhttp.open("GET",dname,false);
	xhttp.send(null);
	
	return xhttp.responseXML;
}

//function that transforms xml documents to json format
function transformToJason(xml,xsl)
{
	var json;
	
	// code for IE
	if (window.ActiveXObject)
	{
		json=xml.transformNode(xsl);
	}
	// code for Mozilla, Firefox, Opera, etc.
	else if (document.implementation && document.implementation.createDocument)
	{
		var xsltProcessor=new XSLTProcessor();
		xsltProcessor.importStylesheet(xsl);
		json = xsltProcessor.transformToFragment(xml,document);
	}
	
	return json;
}


function startTime(element)
{
	var today=new Date();
	var h=today.getHours();
	var m=today.getMinutes();
	var s=today.getSeconds();

	// add a zero in front of numbers<10
	m=checkTime(m);
	s=checkTime(s);
	element.innerHTML=h+":"+m+":"+s;
	t=setTimeout(function(){startTime(element)},500);
}

function checkTime(i)
{
	if (i<10)
	{
		i="0" + i;
	}

	return i;
}

var browserDetect=
{
	init: function()
	{
		this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
		this.version = this.searchVersion(navigator.userAgent)|| this.searchVersion(navigator.appVersion)|| "an unknown version";
		this.OS = this.searchString(this.dataOS) || "an unknown OS";
	},
	searchString: function(data)
	{
		for (var i=0;i<data.length;i++)
		{
			var dataString = data[i].string;
			var dataProp = data[i].prop;
			this.versionSearchString = data[i].versionSearch || data[i].identity;
		
			if (dataString)
			{
				if (dataString.indexOf(data[i].subString) != -1)
					return data[i].identity;
			}
			else if (dataProp)
				return data[i].identity;
		}
	},
	searchVersion: function(dataString)
	{
		var index = dataString.indexOf(this.versionSearchString);
		if (index == -1) return;
		return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
	},
	dataBrowser:
	[
		{
			string: navigator.userAgent,
			subString: "Chrome",
			identity: "Chrome"
		},
		{ 	string: navigator.userAgent,
			subString: "OmniWeb",
			versionSearch: "OmniWeb/",
			identity: "OmniWeb"
		},
		{
			string: navigator.vendor,
			subString: "Apple",
			identity: "Safari",
			versionSearch: "Version"
		},
		{
			prop: window.opera,
			identity: "Opera",
			versionSearch: "Version"
		},
		{
			string: navigator.vendor,
			subString: "iCab",
			identity: "iCab"
		},
		{
			string: navigator.vendor,
			subString: "KDE",
			identity: "Konqueror"
		},
		{
			string: navigator.userAgent,
			subString: "Firefox",
			identity: "Firefox"
		},
		{
			string: navigator.vendor,
			subString: "Camino",
			identity: "Camino"
		},
		{		// for newer Netscapes (6+)
			string: navigator.userAgent,
			subString: "Netscape",
			identity: "Netscape"
		},
		{
			string: navigator.userAgent,
			subString: "MSIE",
			identity: "Explorer",
			versionSearch: "MSIE"
		},
		{
			string: navigator.userAgent,
			subString: "Gecko",
			identity: "Mozilla",
			versionSearch: "rv"
		},
		{ 		// for older Netscapes (4-)
			string: navigator.userAgent,
			subString: "Mozilla",
			identity: "Netscape",
			versionSearch: "Mozilla"
		}
	],
	dataOS:
	[
		{
			string: navigator.platform,
			subString: "Win",
			identity: "Windows"
		},
		{
			string: navigator.platform,
			subString: "Mac",
			identity: "Mac"
		},
		{
			   string: navigator.userAgent,
			   subString: "iPhone",
			   identity: "iPhone/iPod"
	    },
		{
			string: navigator.platform,
			subString: "Linux",
			identity: "Linux"
		}
	]
};