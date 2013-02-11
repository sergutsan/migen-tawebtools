/*
** plain old javascript
** ====================
**/

//global declarations
//task for this session
var jsonTaskInfo=null;
//URLs
var xmlDataURL="./xml/data.xml";
//var xmlDataURL="./xml/indicators.xml";
var xmlGoalsDefURL=null;
var xslTaskInfoURL="./xml/taskinfo_json.xsl";
var xslUsersDefURL="./xml/usersdef_json.xsl";
var xslGoalsDefURL="./xml/goalsdef_json.xsl";
var xslStatesURL="./xml/states_json.xsl";
var xslGoalsURL="./xml/goals_json.xsl";
//xsl objects
var xslTaskInfo=null;
var xslUsersDef=null;
var xslGoalsDef=null;
var xslStates=null;
var xslGoals=null;
//database objects
var dbUsersDef=null;
var dbGoalsDef=null;
var dbStates=null;
var dbGoals=null;
//flags
var usersDefShown=false;
var goalsDefShown=false;

//function that loads xml documents
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
	xhttp.send("");

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

function stripCommentsFromJsonText(jsonText)
{
	var from=jsonText.indexOf('{');
	var to=jsonText.indexOf('}')+1;
	return jsonText.substring(from,to);
}

function refreshData()
{
	//retrieve xml data from server
	var xml=loadXMLDoc(xmlDataURL);

	//retrieve xsl for task info from server if necessary
	if(xslTaskInfo==null)
	{
		xslTaskInfo=loadXMLDoc(xslTaskInfoURL);
	}

	//create task info json object if necessary
	var taskxml=null;
	
	if(jsonTaskInfo==null)
	{
		//transform task info to json format
		var taskinfo_json=transformToJason(xml,xslTaskInfo).textContent;
		taskinfo_json=stripCommentsFromJsonText(taskinfo_json);

		//create json object
		jsonTaskInfo=eval('(' + taskinfo_json + ')');
		
		//update goals definition url
		xmlGoalsDefURL="./xml/"+jsonTaskInfo.url;

		//retrieve task info data from server
		taskxml=loadXMLDoc(xmlGoalsDefURL);
	}

	//retrieve xsl for goals' definition from server if necessary
	if(xslGoalsDef==null)
	{
		xslGoalsDef=loadXMLDoc(xslGoalsDefURL);
	}

	//create goals' definition database if necessary
	if(dbGoalsDef==null)
	{
		//transform goals' data to json format
		var goalsdef_json=transformToJason(taskxml,xslGoalsDef).textContent;

		//create json object
		var goalsdef=eval('(' + goalsdef_json + ')');

		//create and populate database
		try
		{
			dbGoalsDef=TAFFY(goalsdef);
		}
		catch(error)
		{
			errorDisplay(error);
		}
	}

	//retrieve xsl for users' definition from server if necessary
	if(xslUsersDef==null)
	{
		xslUsersDef=loadXMLDoc(xslUsersDefURL);
	}

	//create users' definition database if necessary
	if(dbUsersDef==null)
	{
		//transform user data to json format
		var usersdef_json=transformToJason(xml,xslUsersDef).textContent;

		//create json object
		var usersdef=eval('(' + usersdef_json + ')');

		//create and populate database
		try
		{
			dbUsersDef=TAFFY(usersdef);
		}
		catch(error)
		{
			errorDisplay(error);
		}
	}

	//retrieve xsl for states from server if necessary
	if(xslStates==null)
	{
		xslStates=loadXMLDoc(xslStatesURL);
	}

	//transform states data to json format
	var states_json=transformToJason(xml,xslStates).textContent;

	//create json object
	var states=eval('(' + states_json + ')');

	//create local states' database and populate it
	var dbStates_local=null;

	try
	{
		dbStates_local=TAFFY(states);
	}
	catch(error)
	{
		errorDisplay(error);
	}		
	
	//initialise global states' database
	if(dbStates==null)
	{
		dbStates=dbStates_local;
	}
	else
	{
		//update global states' database with missing records
		var maxTime=dbStates().max("time");
		var minTime=dbStates_local().min("time");
	
		if(minTime>maxTime)
		{
			dbStates.insert(dbStates_local().get());
		}
	}
	
	//retrieve xsl for goals from server if necessary
	if(xslGoals==null)
	{
		xslGoals=loadXMLDoc(xslGoalsURL);
	}

	//transform goals' data to json format
	var goals_json=transformToJason(xml,xslGoals).textContent;

	//create json object
	var goals=eval('(' + goals_json + ')');

	//create local goals' database and populate it
	var dbGoals_local=null;

	try
	{
		dbGoals_local=TAFFY(goals);
	}
	catch(error)
	{
		errorDisplay(error);
	}		

	//initialise global goals' database
	if(dbGoals==null)
	{
		dbGoals=dbGoals_local;
	}
	else
	{
		//update global goals' database with missing records
		var maxTime=dbGoals().max("time");
		var minTime=dbGoals_local().min("time");

		if(minTime>maxTime)
		{
			dbGoals.insert(dbGoals_local().get());
		}
	}
	
	//remove objects
	xml=null;
	dbStates_local=null;
	dbGoals_local=null;
}

function errorDisplay(error)
{
	var message="Error occured!\n";
	message+="error name:"+error.name+"\n";
	message+="error description:"+error.message+"\n";
	message+="press OK to continue";
	alert(message);
}

function testData()
{
	alert("testing users' definition");
	dbUsersDef().each
	(
		function(record, recordNo)
		{
			alert("id:"+record["id"]+" firstname:"+record["firstname"]+" lastname:"+record["lastname"]);
		}
	);

	alert("testing goals' definition");
	dbGoalsDef().each
	(
		function(record, recordNo)
		{
			alert("id:"+record["id"]+" description:"+record["description"]);
		}
	);

	alert("testing states");
	dbStates().each
	(
		function(record, recordNo)
		{
			alert("userid:"+record["userid"]+"time:"+record["time"]+" url:"+record["url"]+" message:"+record["message"]+" type:"+record["type"]+" value:"+record["value"]);
		}
	);

	alert("testing goals");
	dbGoals().each
	(
		function(record, recordNo)
		{
			alert("userid:"+record["userid"]+"time:"+record["time"]+" url:"+record["url"]+" message:"+record["message"]+" type:"+record["type"]+" value:"+record["value"]);
		}
	);
}

function getInitials(firstname,lastname)
{
	if(firstname.length==0||lastname.length==0)
	{
		alert("both first and last names needed!");
		return "";
	}
	
	var result="";
	result+=firstname.charAt(0);
	result+=lastname.charAt(0);
	return result;
}

function getUserColour(id)
{
	var maxTime=dbStates({userid:id}).max("time");
	var state=dbStates({userid:id,time:maxTime}).first();
	var type=state.type;
	var value=state.value;

	if(type=="InactivityVerifier")
	{
		if(value==true)
		{
			return "orange";
		}
		else
		{
			return "green";
		}
	}
	else if(type=="FeedbackShown")
	{
		if(value==999)
		{
			return "red";
		}
		else
		{
			return "green";
		}
	}
	else
	{
		return "green";
	}
}

function updateUserCircle(userid,goalsachieved,goalsnumber)
{
	var circle=$("div#user"+userid);
	var info=circle.text();
	info=info.substring(0,2);
	info="<p>"+info+"<br/>"+goalsachieved+"/"+goalsnumber+"</p>";
	circle.html(info);
}

function updateGoalRectangle(userid,goalid,colour)
{
	var rectangleID=userid+"-"+goalid;
	var rectangle=$("td#"+rectangleID);
	rectangle.css("background-color",colour);
}

/*
** fresh new jquery
** ====================
**/

$(document).ready
(
	function()
	{
		//set up refresh button
		var btnRefresh=$('button#refresh').button({});
		
		function displayUsers()
		{
			if(usersDefShown==true)
			{
				return;
			}
			
			dbUsersDef().each
			(
				function(record, recordNo)
				{
					var id=record["id"];
					var firstname=record["firstname"];
					var lastname=record["lastname"];
					var initials=getInitials(firstname,lastname);
					
					//create a circle to represent the user
					var circle=$('<div class="circle greencolour" id="'+"user"+id+'" title="('+id+") "+firstname+" "+lastname+'"><p>'+initials+'</p></div>');
					circle.appendTo('div#dynamics');
				}
			);
			
			//make all circles draggable
			$('div.circle').draggable
			({
				containment: 'parent'
			});
			
			usersDefShown=true;
		}

		function paintUsers()
		{
			dbUsersDef().each
			(
				function(record, recordNo)
				{
					var id=record["id"];
					var colour=getUserColour(id);
					var circle=$("div#user"+id);

					if(colour=="orange")
					{
						circle.removeClass("greencolour");
						circle.removeClass("redcolour");
						circle.addClass("orangecolour");
					}
					else if(colour=="red")
					{
						circle.removeClass("greencolour");
						circle.removeClass("orangecolour");
						circle.addClass("redcolour");
					}
					else
					{
						circle.removeClass("redcolour");
						circle.removeClass("orangecolour");
						circle.addClass("greencolour");
					}
				}
			)
		}
		
		function displayGoals()
		{
			if(goalsDefShown==true)
			{
				return;
			}

			var users=dbUsersDef().select("id","firstname","lastname");
			var goals=dbGoalsDef().select("id","description");
			var columnLength=Math.floor(95/goals.length);
			var tabletext="";
			tabletext+="<table class='goalsTable' id='goals'>";


			tabletext+="<thead>";
			tabletext+="<tr>";
			tabletext+="<th>"+""+"</th>";
	
			for(var j=0;j<goals.length;j++)
			{
				tabletext+="<th width='"+columnLength+"%'>"+goals[j][1]+"</th>";
			}
			
			tabletext+="</tr>"
			tabletext+="</thead>";
			tabletext+="<tbody>";

			for(var i=0;i<users.length;i++)
			{
				tabletext+="<tr>";
				tabletext+="<th>("+users[i][0]+")"+getInitials(users[i][1],users[i][2])+"</th>";

				for(var j=0;j<goals.length;j++)
				{
					tabletext+="<td class='goalsCell' id='"+users[i][0]+"-"+goals[j][0]+"'></td>";
				}

				tabletext+="</tr>";
			}

			tabletext+="</tbody>";

			tabletext+="</table>";

			var table=$(tabletext);
			table.appendTo('div#goals');

			goalsDefShown=true;
		}
		
		function displayScore()
		{
			var usersdef=dbUsersDef().select("id");
			var goalsdef=dbGoalsDef().select("id");

			for(var i=0;i<usersdef.length;i++)
			{
				var goalsAchieved=0;
				
				for(var j=0;j<goalsdef.length;j++)
				{
					var maxTime=dbGoals({userid:usersdef[i],id:goalsdef[j]}).max("time");
					var colour="white";	//default

					//if there is no entry for this goal for this user skip the rest
					if(maxTime==null)
					{
						continue;
					}
					
					//get the last entry for this goal
					var goal=dbGoals({userid:usersdef[i],id:goalsdef[j],time:maxTime}).first();
					var value=goal.value;
					
					//if it is achieved count it
					if(value==true)
					{
						colour="green";
						goalsAchieved++;
					}
					else
					{
						//otherwise check to see if it was achieved before
						var userGoals=dbGoals({userid:usersdef[i],id:goalsdef[j]}).order("time desc");
						userGoals=userGoals.select("userid","id","time","value");
						
						//if that is the case then paint it orange
						if(userGoals.length>1)
						{
							if(userGoals[1][3]==true)
							{
								colour="orange";
							}
						}
					}
					
					updateGoalRectangle(usersdef[i],goalsdef[j],colour);
				}
				
				updateUserCircle(usersdef[i],goalsAchieved,goalsdef.length);
			}
		}
		
		btnRefresh.click
		(
			function()
			{
				refreshData();
				//testData();
				displayUsers();
				paintUsers();
				displayGoals();
				displayScore();
				
				
				
				



				/*		
					
				//set upe toolkit
				$(document).tooltip
				({
					track: true,
					position:
					{
						my: "center bottom-20",
						at: "center top",
						using: function(position, feedback)
						{
							$(this).css(position);
							$("<div>")
							.addClass("arrow")
							.addClass(feedback.vertical)
							.addClass(feedback.horizontal)
							.appendTo(this);
						}
					}
				});

				messages.val(counter + ' students read\n'+messages.val());			
				*/				
			}
		);
		
		//set up progress bar
		$("div#progressbar").progressbar
		({
			value: 100
		});
		
		//setup time slider
		$("div#time").slider();
		
		//create the tabs
		var tabs=$('#tabs').tabs
		({
			collapsible: false,
			event: 'mouseover',
//			show:
//			{
//				effect: "scale",
//				duration: 800
//			},
			cache: true,
			active: false,
			heightStyle: "fill"
		});
		
		//make the tabs sortable
		tabs.find(".ui-tabs-nav").sortable
		({
			axis: "x",
			stop: function()
			{
				tabs.tabs("refresh");
			}
		});	
	}
);