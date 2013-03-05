$(document).ready
(
	function()
	{
		var currentPassword=null;
		var currentID=null;
	
		var cancel = function()
		{
			$("input").val("");
            dialog.dialog("close");
        }

        var submit = function()
		{
			var answer;
			$("input").each
			(
				function()
				{
					var givenPassword=$(this).val();
					$(this).val("");

					if(givenPassword==currentPassword)
					{
						dialog.dialog("close");
						
						function changeLocation()
						{
							window.location.replace("tatools.html?contextid="+currentID);
						}
						
						setTimeout(changeLocation,1000);
					}
					else
					{
						alert("incorrect password");
					}
				}
			);
        }

		//set up dialog for displaying student's work
		var dialog=$("#dialog");
		dialog.dialog
		(
			{
				bgiframe: true,
				autoOpen: false,
				height: 200,
				width: 300,
				title: "Password",
				show:
				{
					effect: "blind",
					duration: 1000
				},
				hide:
				{
					effect: "explode",
					duration: 1000
				},
				resizable: false,
				modal: true,
				closeOnEscape: true,
				buttons:
				{
					"Submit": submit,
					"Cancel": cancel
				}
			}
		);
			
		function getData()
		{		
			var xmlDataURL="./xml/MoodleResourcesMap.xml";
			var xslContextInfoURL="./xml/contextsdef_json.xsl";
			var xslContextInfo=null;
			var jsonContextInfo=null;
			
			//retrieve xml data from server
			var xml=loadXMLDoc(xmlDataURL);

			//retrieve xsl for context info from server if necessary
			if(xslContextInfo==null)
			{
				xslContextInfo=loadXMLDoc(xslContextInfoURL);
			}
		
			//create context info in json format
			var json_document=null;
			var document_type=null;
			
			//transform context info to document object
			json_document=transformToJason(xml,xslContextInfo);
			document_type=typeof json_document;

			// code for IE
			if(document_type=="string")
			{
				jsonContextInfo=json_document;
			}
			// code for Mozilla, Firefox, Opera, etc.
			else
			{
				jsonContextInfo=json_document.textContent;
			}

			//create json object
			jsonContextInfo=eval('(' + jsonContextInfo + ')');
			var context_item=null;
	
			for(var i=0;i<jsonContextInfo.length;i++)
			{
				context_item=jsonContextInfo[i];		
				var id=context_item.id;
				var password=context_item.password;
				var title=context_item.title;
				var newElement=$('<div id="'+id+'" password="'+password+'" class="scroll-content-item ui-widget-header">'+title+'</div>');
				$('.scroll-content').append(newElement);
			}		
		}
		
		getData();
	
		//scrollpane parts
		var scrollPane = $( ".scroll-pane" ),
		scrollContent = $( ".scroll-content" );

		//build slider
		var scrollbar = $( ".scroll-bar" ).slider
		(
			{
				slide: function( event, ui )
				{
					if ( scrollContent.width() > scrollPane.width() )
					{
						scrollContent.css( "margin-left", Math.round(ui.value / 100 * ( scrollPane.width() - scrollContent.width())) + "px" );
					}
					else
					{
						scrollContent.css( "margin-left", 0 );
					}
				}
			}
		);

		//append icon to handle
		var handleHelper = scrollbar.find( ".ui-slider-handle" ).mousedown
		(
			function()
			{
				scrollbar.width( handleHelper.width() );
			}
		).mouseup
		(
			function()
			{
				scrollbar.width( "100%" );
			}
		).append( "<span class='ui-icon ui-icon-grip-dotted-vertical'></span>" ).wrap( "<div class='ui-handle-helper-parent'></div>" ).parent();

		//change overflow to hidden now that slider handles the scrolling
		scrollPane.css( "overflow", "hidden" );

		//size scrollbar and handle proportionally to scroll distance
		function sizeScrollbar()
		{
			var remainder = scrollContent.width() - scrollPane.width();
			var proportion = remainder / scrollContent.width();
			var handleSize = scrollPane.width() - ( proportion * scrollPane.width() );
			scrollbar.find( ".ui-slider-handle" ).css
			(
				{
					width: handleSize,
					"margin-left": -handleSize / 2
				}
			);

			handleHelper.width( "" ).width( scrollbar.width() - handleSize );
		}

		//reset slider value based on scroll content position
		function resetValue()
		{
			var remainder = scrollPane.width() - scrollContent.width();
			var leftVal = scrollContent.css( "margin-left" ) === "auto" ? 0 :
			parseInt( scrollContent.css( "margin-left" ) );

			var percentage = Math.round( leftVal / remainder * 100 );
			scrollbar.slider( "value", percentage );
		}

		//if the slider is 100% and window gets larger, reveal content
		function reflowContent()
		{
			var showing = scrollContent.width() + parseInt( scrollContent.css( "margin-left" ), 10 );
			var gap = scrollPane.width() - showing;

			if ( gap > 0 )
			{
				scrollContent.css( "margin-left", parseInt( scrollContent.css( "margin-left" ), 10 ) + gap );
			}
		}

		//change handle position on window resize
		$(window).resize
		(
			function()
			{
				resetValue();
				sizeScrollbar();
				reflowContent();
			}
		);

		//init scrollbar size
		setTimeout( sizeScrollbar, 10 );//safari wants a timeout
		
		$(".scroll-content-item").click
		(
			function()
			{
				currentID=this.id;
				currentPassword=getPassword(this);
				
				dialog.dialog("open");
			}
		);
		
		function getPassword(node)
		{
			var array=node.outerHTML.split(" ");
			var password=null;
			
			for(var item in array)
			{
				item=array[item].split("=");
				
				if(item[0]=="password")
				{
					password=item[1].replace(/"/g,'');
				}
			}
			
			return password;
		}		
	}	
);
