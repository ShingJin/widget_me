/*global $, jQuery*/
/*
*
* jQuery Widget Plugin
* 
* File:			jquery.widget_me.js
* Version:		0.4.3
* Author:		Daniel Reznick
* Info:			https://github.com/vedmack/widget_me
* Contact:		vedmack@gmail.com
* Twitter:		https://twitter.com/danielreznick
* 
* Copyright 2013 Daniel Reznick, all rights reserved.
*
* Copyright 2013 Licensed under the MIT License (just like jQuery itself)
* 
* This source file is distributed in the hope that it will be useful, but 
* WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY 
* or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
* 
* Parameters:
*
*					
* -------------

* widget_url
				Required:			true
				Type:				String
				Description:		URL of your servlet/php etc ('name', 'message' and 'email' parameters will be send to your servlet/php etc...)

* position				
				Required:			false
				Type:				String
				Default value:		left-top
				Possible values:	left-top / left-bottom / right-top / right-bottom 
				Description:		Set the position where the widget widget will be located
* jQueryUI
				Required:			false
				Type:				boolean
				Default value:		false
				Description:		Tell the plugin to use jQuery UI theme

* bootstrap
				Required:			false
				Type:				boolean
				Default value:		false
				Description:		Tell the plugin to use twitter bootstrap

* show_email
				Required:			false
				Type:				boolean
				Default value:		false
				Description:		Tell the plugin to display email input field

* show_radio_button_list
				Required:			false
				Type:				boolean
				Default value:		false
				Description:		Tell the plugin to set of 5 radio buttons
				
* name_label
				Required:			false
				Type:				String
				Default value:		"Name"
				Description:		Label for name input

* email_label
				Required:			false
				Type:				String
				Default value:		"Email"
				Description:		Label for email input

* message_label
				Required:			false
				Type:				String
				Default value:		"Message"
				Description:		Label for message input

* radio_button_list_labels
				Required:			false
				Type:				Array of 5 strings
				Default value:		["1","2","3","4","5"]
				Description:		Labels for radio button list

* radio_button_list_title
				Required:			false
				Type:				String
				Default value:		"How would you rate my site?"
				Description:		Label that will appear above the list of radio button
				
* submit_label
				Required:			false
				Type:				String
				Default value:		"Send"
				Description:		Label for submit input



* trigger_label
				Required:			false
				Type:				String
				Default value:		"Widget"
				Description:		Label for open/close (trigger) button

* name_placeholder
				Required:			false
				Type:				String
				Default value:		""
				Description:		Watermark for name input

* email_placeholder
				Required:			false
				Type:				String
				Default value:		""
				Description:		Watermark for email input

* message_placeholder
				Required:			false
				Type:				String
				Default value:		""
				Description:		Watermark for message input

* name_required
				Required:			false
				Type:				boolean
				Default value:		false
				Description:		Makes input required

* email_required
				Required:			false
				Type:				boolean
				Default value:		false
				Description:		Makes input required

* message_required
				Required:			false
				Type:				boolean
				Default value:		false
				Description:		Makes input required

* radio_button_list_required
				Required:			false
				Type:				boolean
				Default value:		false
				Description:		Makes radio inputs required

* show_asterisk_for_required
				Required:			false
				Type:				boolean
				Default value:		false
				Description:		Add an asterisk to the label of the required inputs

* close_on_click_outisde				
				Required:			false
				Type:				boolean
				Default value:		true
				Description:		Will cause the widget dialog to be closed on clicking anywhere outside the dialog
				
* custom_params				
				Required:			false
				Type:				associative array
				Default value:		{}
				Description:		Use it if you want to send additional data to the server (can be used for sending: csrf token / logged in user_name / etc`)
* iframe_url				
				Required:			false
				Type:				String
				Default value:		undefined
				Description:		Allows you to use any html file that you want, it will be placed inside widget_me widget, in order to close the widget_me widget
									just call the followinog command: parent.fm.triggerAction(event); dont forget to pass the "event" from you onclick call to the triggerAction function
*
*
*/
var fm = (function () {

	'use strict';

	var fm_options,
		supportsTransitions;
	

	function getFmOptions() {
			return fm_options;
		}

	function triggerAction(event) {

		var animation_show = {},
			animation_hide = {};

		animation_show.marginLeft = "+=380px";
		animation_hide.marginLeft = "-=380px";
		

		if ($("body").attr("dir") === "rtl" || fm.getFmOptions().position.indexOf("right-") !== -1) {
			animation_show.marginRight = "+=380px";
			animation_hide.marginRight = "-=380px";
		}

		if ($("#widget_trigger").hasClass("widget_trigger_closed")) {
			if (supportsTransitions === true) {
				$("#widget_trigger").removeClass("widget_trigger_closed");
				$("#widget_content").removeClass("widget_content_closed");
			} else {
				$("#widget_trigger , #widget_content").animate(
					animation_show,
					500,
					'easeInOutSine',
					function () {
						$("#widget_trigger").removeClass("widget_trigger_closed");
						$("#widget_content").removeClass("widget_content_closed");
					}
				);
			}
		} else {
			//first add the closed class so double (which will trigger closeWidget function) click wont try to hide the form twice
			$("#widget_trigger").addClass("widget_trigger_closed");
			$("#widget_content").addClass("widget_content_closed");
			if (supportsTransitions === false) {
				$("#widget_trigger , #widget_content").animate(
					animation_hide,
					500
				);
			}
		}
	}

	function closeWidget(event) {

		if ($("#widget_content").hasClass("widget_content_closed") || event.target.id === "widget_content" || $(event.target).parents("div#widget_content").length > 0) {
			return;
		}

		var animation_hide = {};
		animation_hide.marginLeft = "-=380px";
		if ($("body").attr("dir") === "rtl" || fm.getFmOptions().position.indexOf("right-") !== -1) {
			animation_hide.marginRight = "-=380px";
		}

		$("#widget_trigger").addClass("widget_trigger_closed");
		$("#widget_content").addClass("widget_content_closed");
		if (supportsTransitions === false) {
			$("#widget_trigger , #widget_content").animate(
				animation_hide,
				500
			);
		}
	}

	function emailValid(str) {
		var lastAtPos = str.lastIndexOf('@');
		return (lastAtPos < (str.length - 1) && lastAtPos > 0 && str.indexOf('@@') === -1 && str.length > 2);
	}

	function validateWidgetForm() {
		if ((fm_options.name_required === true && $("#widget_name").val() === "") ||
				((fm_options.email_required === true && $("#widget_email").val() === "") || (fm_options.email_required === true && emailValid($("#widget_email").val()) === false)) ||
				(fm_options.message_required === true && $("#widget_message").val() === "") ||
				(fm_options.radio_button_list_required === true && $("#widget_me_form input[name=widget_radio]:checked").val() === undefined)) {
			return false;
		}
		return true;

	}



	function checkRequiredFieldsOk() {
		var $reqFields = $("[required]"),
			$fm_form,
			form_valid = true;

		if ($reqFields.length > 0) {
			form_valid = validateWidgetForm();
		}
		return form_valid;
	}

	function applyCloseOnClickOutside() {
		if (parseFloat($().jquery) >= 1.7) {
			$(document).on("click", document, function (event) {
				closeWidget(event);
			});
		} else {
			$(document).delegate("body", document, function (event) {
				closeWidget(event);
			});
		}
	}

	function appendWidgetToBody() {
		var form_html = "",
			iframe_html = "",
			jQueryUIClasses1 = "",
			jQueryUIClasses2 = "",
			jQueryUIClasses3 = "",
			jQueryUIClasses4 = "",
			email_html = "",
			email_widget_content_class = "",
			radio_button_list_html = "",
			radio_button_list_class = "",
			fm_class = " fm_clean ",
			jquery_class = "",
			bootstrap_class = "",
			bootstrap_btn = "",
			bootstrap_hero_unit = "",

			name_required = fm_options.name_required ? "required" : "",
			email_required = fm_options.email_required ? "required" : "",
			message_required = fm_options.message_required ? "required" : "",
			radio_button_list_required = fm_options.radio_button_list_required ? "required" : "",

			name_asterisk  = fm_options.name_required && fm_options.show_asterisk_for_required ? "<span class=\"required_asterisk\">*</span>" : "",
			email_asterisk  = fm_options.email_required && fm_options.show_asterisk_for_required ? "<span class=\"required_asterisk\">*</span>" : "",
			message_asterisk  = fm_options.message_required && fm_options.show_asterisk_for_required ? "<span class=\"required_asterisk\">*</span>" : "",
			radio_button_list_asterisk = fm_options.radio_button_list_required && fm_options.show_asterisk_for_required ? "<span class=\"required_asterisk\">*</span>" : "";

		if (fm_options.bootstrap === true) {
			bootstrap_class = " fm_bootstrap ";
			bootstrap_btn = " btn btn-primary ";
			bootstrap_hero_unit = " hero-unit ";

			fm_class = "";
			jquery_class = "";
		}

		if (fm_options.jQueryUI === true) {
			jquery_class = " fm_jquery ";
			jQueryUIClasses1 = " ui-widget-header ui-corner-all ui-helper-clearfix ";
			jQueryUIClasses2 = " ui-dialog ui-widget ui-widget-content ui-corner-all ";
			jQueryUIClasses3 = " ui-dialog-titlebar ";
			jQueryUIClasses4 = " ui-dialog-title ";

			fm_class = "";
			bootstrap_class = "";
			bootstrap_hero_unit = "";
			bootstrap_btn = "";

		}

		if (fm_options.show_radio_button_list === true) {
			radio_button_list_html = "<li><div id=\"radio_button_list_title_wrapper\"><div id=\"radio_button_list_title\">" + fm_options.radio_button_list_title + radio_button_list_asterisk + "</div></div><div id=\"radio_button_list_wrapper\">";
			radio_button_list_html += "    <div class=\"radio_button_wrapper\">";
			radio_button_list_html += "        <input value=\"1\" type=\"radio\" name=\"widget_radio\" id=\"widget_radio_1\" " + radio_button_list_required + "\/>";
			radio_button_list_html += "        <label for=\"widget_radio_1\">" + fm_options.radio_button_list_labels[0] + "<\/label>";
			radio_button_list_html += "    <\/div>";
			radio_button_list_html += "    <div class=\"radio_button_wrapper\">";
			radio_button_list_html += "        <input value=\"2\" type=\"radio\" name=\"widget_radio\" id=\"widget_radio_2\"\/>";
			radio_button_list_html += "        <label for=\"widget_radio_2\">" + fm_options.radio_button_list_labels[1] + "<\/label>";
			radio_button_list_html += "    <\/div>";
			radio_button_list_html += "    <div class=\"radio_button_wrapper\">";
			radio_button_list_html += "        <input value=\"3\" type=\"radio\" name=\"widget_radio\" id=\"widget_radio_3\"\/>";
			radio_button_list_html += "        <label for=\"widget_radio_3\">" + fm_options.radio_button_list_labels[2] + "<\/label>";
			radio_button_list_html += "    <\/div>";
			radio_button_list_html += "    <div class=\"radio_button_wrapper\">";
			radio_button_list_html += "        <input value=\"4\" type=\"radio\" name=\"widget_radio\" id=\"widget_radio_4\"\/>";
			radio_button_list_html += "        <label for=\"widget_radio_4\">" + fm_options.radio_button_list_labels[3] + "<\/label>";
			radio_button_list_html += "    <\/div>";
			radio_button_list_html += "    <div class=\"radio_button_wrapper\">";
			radio_button_list_html += "        <input value=\"5\" type=\"radio\" name=\"widget_radio\" id=\"widget_radio_5\"\/>";
			radio_button_list_html += "        <label for=\"widget_radio_5\">" + fm_options.radio_button_list_labels[4] + "<\/label>";
			radio_button_list_html += "    <\/div>";
			radio_button_list_html += "<\/div></li>";

			radio_button_list_class = " radio_button_list_present";
		}

		if (fm_options.show_email === true) {
			email_html = '<li>	<label for="widget_email">' + fm_options.email_label + '</label> ' + email_asterisk + ' <input type="email" id="widget_email" ' + email_required + ' placeholder="' + fm_options.email_placeholder + '"></input> </li>';
			email_widget_content_class = " email_present";
		}

		if (fm_options.iframe_url === undefined) {
			form_html = '<div id="widget_text">'+fm_options.widget_text+"</div>";
		} else {
			iframe_html = '<iframe name="widget_me_frame" id="widget_me_frame" frameborder="0" src="' + fm_options.iframe_url + '"></iframe>';
		}

		$('body').append('<div id="widget_trigger" onclick="fm.stopPropagation(event);fm.triggerAction(event);" class="widget_trigger_closed ' + fm_options.position + jQueryUIClasses1 + fm_class + jquery_class + bootstrap_class + bootstrap_hero_unit + '">'
				+	'<span class="widget_trigger_text">' + fm_options.trigger_label
				+	'</span></div>');

		$('body').append('<div id="widget_content" class="widget_content_closed ' + fm_options.position + email_widget_content_class + radio_button_list_class + jQueryUIClasses2 + fm_class + jquery_class + bootstrap_class + bootstrap_hero_unit + '">'
							+ '<div class="widget_title ' + jQueryUIClasses1 + jQueryUIClasses3 + '">'
							+	'<span class="' + jQueryUIClasses4 + '">' + fm_options.widget_title + '</span>'
							+ '</div>'
							+  form_html
							+  iframe_html
						+ '</div>');
        
          $("#widget_content").css({"background-color":fm_options.widget_color});
          $("#widget_content").css({"color":fm_options.widget_text_color});

		if (fm_options.jQueryUI === true) {
			$('#widget_submit').button({
				icons: {
					primary: 'ui-icon-mail-closed'
				}
			});
		}

		if (fm_options.close_on_click_outisde === true) {
			applyCloseOnClickOutside();
		}

		//prevent form submit (needed for validation)
		$('#widget_me_form').submit(function (event) {
			event.preventDefault();
		});
	}

	function stopPropagation(evt) {
		if (evt.stopPropagation !== undefined) {
			evt.stopPropagation();
		} else {
			evt.cancelBubble = true;
		}
	}

	function sendWidget(event) {
		var checkValid = checkRequiredFieldsOk(),
			dataArray;
		if (checkValid === false) {
			stopPropagation(event);
			return;
		}
		dataArray = {
			name: $("#widget_name").val(),
			message: $("#widget_message").val(),
			email: $("#widget_email").val(),
			radio_list_value: $("#widget_me_form input[name=widget_radio]:checked").val()
		};

		dataArray = $.extend(fm.getFmOptions().custom_params, dataArray);

		$.ajax({
			type: 'POST',
			url: fm.getFmOptions().widget_url,
			data: dataArray,
			beforeSend: function (xhr) {

				var animation_hide = {};
				animation_hide.marginLeft = "-=380px";
				if ($("body").attr("dir") === "rtl" || fm.getFmOptions().position.indexOf("right-") !== -1) {
					animation_hide.marginRight = "-=380px";
				}

				if (supportsTransitions === true) {
					$("#widget_trigger").addClass("widget_trigger_closed");
					$("#widget_content").addClass("widget_content_closed");
				} else {
					$("#widget_trigger , #widget_content").animate(
						animation_hide,
						500,
						function () {
							$("#widget_trigger").addClass("widget_trigger_closed");
							$("#widget_name").val("");
							$("#widget_message").val("");
							$("#widget_email").val("");
							$("#widget_me_form input[name=widget_radio]").prop('checked', false);
						}
					);
				}
			},
			error: function (ob, errStr) {
				alert("Failed to send widget (please double check your widget_url parameter)");
			}
		});
	}

	function getTotalRaisedAmount() {

		var domain = window.location.origin.replace(/http:\/\//i,"");
		
		var url = "http://charitizer.herokuapp.com/total_amount?domain=" + domain
		$.getJSON(url, function(data) {
			 var text = $("#widget_text").text();
			 text = text.replace(/\[amount\_all\_time\]/i,data)
			 $("#widget_text").text(text)
		});
	}


	function detectTransitionSupport() {
		var be = document.body || document.documentElement,
			style = be.style,
			p = 'transition',
			vendors,
			i;
		if (typeof style[p] === 'string') {
			supportsTransitions = true;
			return;
		}

		vendors = ['Moz', 'Webkit', 'Khtml', 'O', 'ms'];
		p = p.charAt(0).toUpperCase() + p.substr(1);
		for (i = 0; i < vendors.length; i++) {
			if (typeof style[vendors[i] + p] === 'string') {
				supportsTransitions = true;
				return;
			}
		}
		supportsTransitions = false;
		return;
	}

	

	function init(options) {

		var default_options = {
			widget_url : "",
			position : "left-top",
			jQueryUI : false,
			bootstrap : false,
			show_email : false,
			show_radio_button_list : false,
			close_on_click_outisde: true,
			widget_title: "We Donate To Charity!",
			widget_text: "With your help, we've raised [amount_all_time] for charity!",
			widget_color: "grey",
			widget_text_color: "black",
			name_label : "You've raised X for X charity",
			email_label : "Email",
			message_label : "Message",
			radio_button_list_labels : ["1", "2", "3", "4", "5"],
			radio_button_list_title : "How would you rate my site?",
			name_placeholder : "",
			email_placeholder : "",
			message_placeholder : "",
			name_required : false,
			email_required : false,
			message_required : false,
			radio_button_list_required : false,
			show_asterisk_for_required : false,
			submit_label : "Send",
			trigger_label : "We Donate!",
			custom_params : {},
			iframe_url : undefined
		};

		fm_options = $.extend(default_options, options);

		appendWidgetToBody();

		detectTransitionSupport();

		getTotalRaisedAmount();
	}

    return {
		init : init,
		sendWidget : sendWidget,
		getFmOptions : getFmOptions,
		triggerAction : triggerAction,
		stopPropagation : stopPropagation
    };

}());