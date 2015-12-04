// qio 1.0
// Displays a quick overview of users inventories on their profile.
// https://github.com/Codeia/Martini

$(function(){
	$(document).ready(function(){

		if ( $("body").hasClass("profile_page") )
		{
			profilePage();
		}

	});

});

function profilePage(){

    if ( !$(".profile_customization_area").length )
    {
        $(".profile_leftcol").prepend('<div class="profile_customization_area"></div>');
    }

    $(".profile_customization_area").prepend('<div id="quick_inventory" class="profile_customization">\
    <div class="profile_customization_header">Quick Inventory Overview</div>\
        <div class="profile_customization_block">\
            <div class="gamecollector_showcase">\
                <div class="showcase_content_bg showcase_stats_row" style="padding: 20px;">\
                <div class="qi_error" style="display: none;">Could not get inventory from the steam API (<a class="whiteLink" target="_blank" href="https://steamstat.us/">More Info</a>)</div>\
                <div class="qi_loader"><svg style="margin: 10px; width: 20px; opacity: 0.85;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="white" hola_ext_inject="disabled"><path opacity=".25" d="M16 0 A16 16 0 0 0 16 32 A16 16 0 0 0 16 0 M16 4 A12 12 0 0 1 16 28 A12 12 0 0 1 16 4"/><path d="M16 0 A16 16 0 0 1 32 16 L28 16 A12 12 0 0 0 16 4z" transform="rotate(202.794 16 16)"><animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="0.8s" repeatCount="indefinite"/></path></svg></div>\
                <div class="qi_items" style="display:none;"></div>\
                </div>\
            </div>\
            <div style="clear: both"></div>\
        </div>\
    </div>');


	function buildHTML(keys, knives, rifles, cases, total){

		function buildLink(keys, text){
			return '<a style="display:none;" class="showcase_stat" href="#"><div class="value">' + keys + '</div><div class="label">' + text + '</div></a>';
		}

		var html = [];

		html.push( buildLink(keys,"Keys") );
		html.push( buildLink(knives,"Knives") );
		html.push( buildLink(rifles,"Rifles") );
		html.push( buildLink(cases,"Cases") );
		html.push( buildLink(total,"Total Items") );

		$(".profile_leftcol #quick_inventory .qi_loader").fadeOut(400,function(){
			$(".profile_leftcol #quick_inventory .qi_items").append(html).fadeIn().find(".showcase_stat").each(function(i){
				$(this).delay(140*i).fadeIn();
			});

		});
	}

	
	// when entering a profile, retreive the inventory and count keys
	var url = window.location.href;

	var steamID = url.indexOf("/profiles/") > 0 ? url.match(/profiles\/([^\/]*)/)[1] : url.match(/id\/([^\/]*)/)[1];

	var keys = 0;
	var knives = 0;
	var rifles = 0;
	var cases = 0;

	var type = steamID.match(/^[0-9]+$/) != null ? "profiles" : "id";

	var url = "https://steamcommunity.com/" + type + "/" + steamID + "/inventory/json/730/2";
	$.ajax({
		method: "GET",
		url: url,
		context: this
	}).fail(function(jqXHR, textStatus, errorThrown){

	}).done(function( res ) {

		 // console.warn(res);

		 if (typeof res.rgInventory === "undefined") {
			console.warn("Warning! Couldn't not get inventory info.");
			$(".profile_leftcol #quick_inventory .qi_loader").fadeOut(400,function(){
				$(".profile_leftcol #quick_inventory .qi_error").fadeIn();
			});

		 	return;
		 }

		 // all the items we gonna focus
		 var keysArr = [];
		 var knivesArr = [];
		 var riflesArr = [];
		 var casesArr = [];

		// 1. go through all items to see what types of skins/items he has
		Object.keys(res.rgDescriptions).forEach(function(val,i){

			var type = res.rgDescriptions[val].type;

			if ( type.indexOf("Key") >= 0 ){
				keysArr.push(val.split("_")[0]); // take the first string which is the class id (classid_instanceid)
			}
			if ( type.indexOf("Covert Knife") >= 0 ){
				knivesArr.push(val.split("_")[0]);
			}
			if ( type.indexOf("Rifle") >= 0 ){
				riflesArr.push(val.split("_")[0]);
			}
			if ( type.indexOf("Base Grade Container") >= 0 ){
				casesArr.push(val.split("_")[0]);
			}
		});	

		// 2. We have the types, now lets count how many he has from each one of the item that we look for.
		var total=0;
		Object.keys(res.rgInventory).forEach(function(val,i){
			var classid = res.rgInventory[val].classid;

			keysArr.forEach(function(value,index){	
				if ( classid.indexOf(value) >= 0 ){
					keys++;
				}
			})

			knivesArr.forEach(function(value,index){	
				if ( classid.indexOf(value) >= 0 ){
					knives++;
				}
			})

			riflesArr.forEach(function(value,index){	
				if ( classid.indexOf(value) >= 0 ){
					rifles++;
				}
			})

			casesArr.forEach(function(value,index){	
				if ( classid.indexOf(value) >= 0 ){
					cases++;
				}
			})

			total++;
		});

		console.warn("Total Items in Inventory", total);
		buildHTML(keys, knives, rifles, cases, total);

	});
}