var $j = jQuery.noConflict();

$j(document).ready
(
	function()
	{
		/*
		**	In this section we declare global variables
		**	===========================================
		*/

		//debugging
		var verbose=false;
		//task for this session
		var jsonTaskInfo=null;
		//URLs
		var xmlDataURL="./xml/data.xml";
		//var xmlDataURL="./xml/indicators.xml";
		//var xmlDataURL="http://web-expresser.appspot.com/p/indicators/1/indicators.xml?startTime=1359869081370";
		var xmlGoalsDefURL="./xml/goals.xml";
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
		var usersDisplayNeedsUpdate=true;
		var goalsDisplayNeedsUpdate=true;
		//initialise variable with browser info
		browserDetect.init();

		/*
		**	In this section we create the visible controls of the page
		**	==========================================================
		*/
		
		//set up tooltip class
		HelpBalloon.Options.prototype = Object.extend
		(
			HelpBalloon.Options.prototype,
			{
				icon: './images/icon.gif',
				button: './images/button.png',
				balloonPrefix: './images/balloon-'
			}
		);

		//set up buttons
		var btnRefresh=$j('button#refresh').button({});
		var btnCDZoomIn=$j('button#cdzoomin').button({});
		var btnCDZoomOut=$j('button#cdzoomout').button({});
		var btnGAZoomIn=$j('button#gazoomin').button({});
		var btnGAZoomOut=$j('button#gazoomout').button({});
		
		//set up progress bar
		$j("div#progressbar").progressbar
		({
			max: 100,
			value: 100
		});

		//setup time slider
		$j("div#time").slider();
		
		//create the tabs
		var tabs=$j('#tabs').tabs
		({
			collapsible: false,
			event: 'mouseover',
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
		
		/*
		**	In this section we define the functions
		**	=======================================
		*/

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

		//cdata content cannot be excluded by xslt, so we do that in javascript
		function stripCommentsFromJsonText(jsonText)
		{
			jsonText=new String(jsonText);
			var from=jsonText.indexOf('{');
			var to=jsonText.indexOf('}')+1;
			jsonText=jsonText.substring(from,to);
			return jsonText;
		}

		//haldler for the button refresh
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
			var json_document=null;
			var document_type=null;
			
			if(jsonTaskInfo==null)
			{
				//transform task info to json format
				json_document=transformToJason(xml,xslTaskInfo);
				document_type=typeof json_document;
				var taskinfo_json=null;
				
				// code for IE
				if(document_type=="string")
				{
					taskinfo_json=json_document;
				}
				// code for Mozilla, Firefox, Opera, etc.
				else
				{
					taskinfo_json=json_document.textContent;
				}
				
				if(verbose==true)
				{
					alert(taskinfo_json);
				}
				
				taskinfo_json=stripCommentsFromJsonText(taskinfo_json);

				if(verbose==true)
				{
					alert(taskinfo_json);
				}
				
				//create json object
				jsonTaskInfo=eval('(' + taskinfo_json + ')');

				//update goals definition url if necessary
				if(xmlGoalsDefURL==null)
				{
					xmlGoalsDefURL="./xml/"+jsonTaskInfo.url;
				}

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
				json_document=transformToJason(taskxml,xslGoalsDef);
				document_type=typeof json_document;
				var goalsdef_json=null;
				
				// code for IE
				if(document_type=="string")
				{
					goalsdef_json=json_document;
				}
				// code for Mozilla, Firefox, Opera, etc.
				else
				{
					goalsdef_json=json_document.textContent;
				}
				
				if(verbose==true)
				{
					alert(goalsdef_json);
				}
				
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

			//transform user data to json format
			json_document=transformToJason(xml,xslUsersDef);
			document_type=typeof json_document;
			var usersdef_json=null;
				
			// code for IE
			if(document_type=="string")
			{
				usersdef_json=json_document;
			}
			// code for Mozilla, Firefox, Opera, etc.
			else
			{
				usersdef_json=json_document.textContent;
			}
				
			if(verbose==true)
			{
				alert(usersdef_json);
			}
				
			//create json object
			var usersdef=eval('(' + usersdef_json + ')');
				
			//create local users' database and populate it
			var dbUsersDef_local=null;

			//create and populate database
			try
			{
				dbUsersDef_local=TAFFY(usersdef);
			}
			catch(error)
			{
				errorDisplay(error);
			}
			
			//initialise global users' database
			if(dbUsersDef==null)
			{
				dbUsersDef=dbUsersDef_local;
			}
			else
			{
				//update global users' database with missing records
				var old_users=dbUsersDef().count();
				var new_users=dbUsersDef_local().count();

				if(new_users>old_users)
				{
					dbUsersDef_local.merge(dbUsersDef().get());
					dbUsersDef=dbUsersDef_local;
					usersDisplayNeedsUpdate=true;
					goalsDisplayNeedsUpdate=true;
				}
			}

			//retrieve xsl for states from server if necessary
			if(xslStates==null)
			{
				xslStates=loadXMLDoc(xslStatesURL);
			}

			//transform states data to json format
			json_document=transformToJason(xml,xslStates);
			document_type=typeof json_document;
			var states_json=null;
				
			// code for IE
			if(document_type=="string")
			{
				states_json=json_document;
			}
			// code for Mozilla, Firefox, Opera, etc.
			else
			{
				states_json=json_document.textContent;
			}
			
			if(verbose==true)
			{
				alert(states_json);
			}
			
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
			json_document=transformToJason(xml,xslGoals);
			document_type=typeof json_document;
			var goals_json=null;
				
			// code for IE
			if(document_type=="string")
			{
				goals_json=json_document;
			}
			// code for Mozilla, Firefox, Opera, etc.
			else
			{
				goals_json=json_document.textContent;
			}

			if(verbose==true)
			{
				alert(goals_json);
			}
			
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
			dbUsersDef_local=null;
			dbStates_local=null;
			dbGoals_local=null;
		}

		//utility function to display exceptions caught
		function errorDisplay(error)
		{
			var message="Error occured!\n";
			message+="error name:"+error.name+"\n";
			message+="error description:"+error.message+"\n";
			message+="press OK to continue";
			alert(message);
		}

		//utility data ti display content of database tables
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

		//utility function to form initials from two names
		function getInitials(firstname,lastname)
		{
			//firstname=firstname.trim();
			//lastname=lastname.trim();
			
			var result="";

			if(firstname.length!=0)
			{
				result+=firstname.charAt(0);
			}
			
			if(lastname.length!=0)
			{
				result+=lastname.charAt(0);
			}
		
			return result;
		}

		//computes the proper colour for a user circle
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

		//updates a user's circle with goals achieved
		function updateUserCircle(userid,goalsachieved,goalsnumber,url)
		{
			var circle=$j("div#user"+userid);
			var info=circle.text();
			info=info.substring(0,2);
			info="<p>"+info+"<br/>"+goalsachieved+"/"+goalsnumber+"</p>";
			circle.html(info);
			circle.attr("url",url);

			//handler for the doubleclick event of circles
			circle.dblclick
			(
				function()
				{
					var baloon=new HelpBalloon
					(
						{
							dataURL: circle.attr("url"),
							cacheRemoteContent: false,
							icon: this,
							useEvent: ['doubleclick'],
							balloonDimensions: [600,480] 
						}
					);
					baloon.show();
				}
			);
		}

		//updates a goal's rectangle with the colour given
		function updateGoalRectangle(userid,goalid,colour)
		{
			var rectangleID=userid+"-"+goalid;
			var rectangle=$j("td#"+rectangleID);
			rectangle.css("background-color",colour);
		}

		//displays users' circles
		function displayUsers()
		{
			if(usersDisplayNeedsUpdate==false)
			{
				return;
			}
			
			dbUsersDef().each
			(
				function(record, recordNo)
				{
					var active=record["cd_visible"];
					
					//create a circle to represent the user if necessary
					if(active==false)
					{
						var id=record["id"];
						var firstname=record["firstname"];
						var lastname=record["lastname"];
						var initials=getInitials(firstname,lastname);
					
						var circle=$j('<div class="circle greencolour" id="'+"user"+id+'" title="('+id+") "+firstname+" "+lastname+'"><p>'+initials+'</p></div>');
						circle.appendTo('div#dynamics');

						dbUsersDef({"id":id}).update({"cd_visible":true});
					}
				}
			);
			
			//make all circles draggable
			$j('div.circle').draggable
			({
				containment: 'parent'
			});
			
			usersDisplayNeedsUpdate=false;
		}

		//paints the users' circles
		function paintUsers()
		{
			dbUsersDef().each
			(
				function(record, recordNo)
				{
					var id=record["id"];
					var colour=getUserColour(id);
					var circle=$j("div#user"+id);

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

		//displays the goals' rectangles
		function displayGoals()
		{
			if(goalsDisplayNeedsUpdate==false)
			{
				return;
			}
			
			var users=dbUsersDef().select("id","firstname","lastname","ga_visible");
			var goals=dbGoalsDef().select("id","description");
			var exists=$j("table#goals").length!=0;

			//if the goals' table exists append the new rows
			if(exists==true)
			{
				var rowstext="";
				
				for(var i=0;i<users.length;i++)
				{
					if(users[i][3]==false)
					{
						rowstext+="<tr>";
						rowstext+="<th>("+users[i][0]+")"+getInitials(users[i][1],users[i][2])+"</th>";

						for(var j=0;j<goals.length;j++)
						{
							rowstext+="<td class='goalsCell' id='"+users[i][0]+"-"+goals[j][0]+"'></td>";
						}

						rowstext+="</tr>";
							
						dbUsersDef({"id":users[i][0]}).update({"ga_visible":true});
					}
				}

				$j('tbody#usergoalslist').append(rowstext);
			}
			//otherwise create it
			else
			{
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
				tabletext+="<tbody id='usergoalslist'>";

				for(var i=0;i<users.length;i++)
				{
					tabletext+="<tr>";
					tabletext+="<th>("+users[i][0]+")"+getInitials(users[i][1],users[i][2])+"</th>";

					for(var j=0;j<goals.length;j++)
					{
						tabletext+="<td class='goalsCell' id='"+users[i][0]+"-"+goals[j][0]+"'></td>";
					}

					tabletext+="</tr>";

					dbUsersDef({"id":users[i][0]}).update({"ga_visible":true});
				}

				tabletext+="</tbody>";
				tabletext+="</table>";

				var table=$j(tabletext);
				table.appendTo('div#goals');
			}

			goalsDisplayNeedsUpdate=false;
		}
		
		//updates the achievement table and the circles with student's achievements
		function displayScore()
		{
			var usersdef=dbUsersDef().select("id");
			var goalsdef=dbGoalsDef().select("id");

			for(var i=0;i<usersdef.length;i++)
			{
				var goalsAchieved=0;
				var goalURL="nogoals.html";
				
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
					goalURL=goal.url;
					
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
				
				updateUserCircle(usersdef[i],goalsAchieved,goalsdef.length,goalURL);
			}
		}
		
		//utility method to display informative messages
		function displayMessageInBox(message)
		{
			var messages=$j('textarea#messages');
			var exists=messages.length!=0;

			if(exists==true)
			{
				messages.val(message+'\n'+messages.val());
			}
		}

		//handler for the onclick event of button '+'
		btnCDZoomIn.click
		(
			function()
			{
				if(browserDetect.browser=="Firefox")
				{
					var zoom=$j('.circle').css("-moz-transform");
					var array=zoom.split(",");
					var zoom_value=parseFloat(array[3])+0.1;
					var new_value="matrix("+zoom_value+",0,0,"+zoom_value+",0,0)";
					$j('.circle').css("-moz-transform",new_value);
				}
				else
				{
					var zoom=$j('.circle').css("zoom");
					zoom=parseFloat(zoom)+0.1;
					$j('.circle').css("zoom",zoom);
				}
			}
		);
		
		//handler for the onclick event of button '-'
		btnCDZoomOut.click
		(
			function()
			{
				if(browserDetect.browser=="Firefox")
				{
					var zoom=$j('.circle').css("-moz-transform");
					var array=zoom.split(",");
					var zoom_value=parseFloat(array[3])-0.1;
					var new_value="matrix("+zoom_value+",0,0,"+zoom_value+",0,0)";
					$j('.circle').css("-moz-transform",new_value);
				}
				else
				{
					var zoom=$j('.circle').css("zoom");
					zoom=parseFloat(zoom)-0.1;
					$j('.circle').css("zoom",zoom);
				}
			}
		);
		
		//handler for the onclick event of button '+'
		btnGAZoomIn.click
		(
			function()
			{
				if(browserDetect.browser=="Firefox")
				{
					var zoom=$j('.goalsTable').css("-moz-transform");
					var array=zoom.split(",");
					var zoom_value=parseFloat(array[3])+0.1;
					var new_value="matrix("+zoom_value+",0,0,"+zoom_value+",0,0)";
					$j('.goalsTable').css("-moz-transform",new_value);
				}
				else
				{
					var zoom=$j('.goalsTable').css("zoom");
					zoom=parseFloat(zoom)+0.1;
					$j('.goalsTable').css("zoom",zoom);
				}
			}
		);
		
		//handler for the onclick event of button '-'
		btnGAZoomOut.click
		(
			function()
			{
				if(browserDetect.browser=="Firefox")
				{
					var zoom=$j('.goalsTable').css("-moz-transform");
					var array=zoom.split(",");
					var zoom_value=parseFloat(array[3])-0.1;
					var new_value="matrix("+zoom_value+",0,0,"+zoom_value+",0,0)";
					$j('.goalsTable').css("-moz-transform",new_value);
				}
				else
				{
					var zoom=$j('.goalsTable').css("zoom");
					zoom=parseFloat(zoom)-0.1;
					$j('.goalsTable').css("zoom",zoom);
				}
			}
		);
		
		function getFormattedTime()
		{
			var date=new Date();
			var time=date.toLocaleTimeString();
			return "["+time+"]:";
		}
		
		//handler for the onclick event of button 'refresh'
		btnRefresh.click
		(
			function()
			{
				$j("div#progressbar").progressbar("option","value",0);
				displayMessageInBox(getFormattedTime()+"fetching data...");
				refreshData();
				$j("div#progressbar").progressbar("option","value",40);
				displayMessageInBox(getFormattedTime()+"local data updated...");
				//testData();
				displayUsers();
				paintUsers();
				$j("div#progressbar").progressbar("option","value",70);
				displayMessageInBox(getFormattedTime()+"class dynamics view updated...");
				displayGoals();
				displayScore();
				$j("div#progressbar").progressbar("option","value",100);
				displayMessageInBox(getFormattedTime()+"goal achievement view updated...");
			}
		);		
	}
);