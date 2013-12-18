/**
* Init
*/

var uri = {
	home: 'http://ec2-54-200-192-192.us-west-2.compute.amazonaws.com:3000/',
	auth: 'http://ec2-54-200-192-192.us-west-2.compute.amazonaws.com:3000/auth',
	req: 'http://ec2-54-200-192-192.us-west-2.compute.amazonaws.com:3000/req'	
	};

Handlebars.registerHelper("uri", function() {
  return uri;
});

Template.pocketStatus.pocketAuthorized = function() {
	if(Meteor.user()){
		var pocket = Meteor.user().pocket;
		if (pocket.isUserCode == 1) return true;
    }
    return false;
}



Template.req.rendered = function(){
	//'click #connectToPocket' : 	function(event){
		console.log('Client: Connect started');
		console.log(Meteor.user());
		//check current value of pocket entry
		if(Meteor.user()){
			var pocket = Meteor.user().pocket;
			if(pocket.isUserCode == 1){
				console.log('Client: User code existing')
				return true;
			}
		}

		//call auth
		var redirect_uri = uri.auth;
		Meteor.call('authPocketApp', redirect_uri, function(error, result){
			if(result==true){
				var url =  'https://getpocket.com/auth/authorize?request_token='+Meteor.user().pocket.accessCode+'&redirect_uri='+redirect_uri;
				window.location.replace(url);
			}
			else{
				console.log('Error authenticating Pocket App');
				throw new Meteor.Error(error);
			}
			});
	}
//}

Template.pocketStatus.events = {
    'click #disconnectPocket' : function(event){
		//currently do nothing
		Meteor.call('resetPocketCredentials', function(error, result){
			console.log('Result: '+result);
			if(result==true){
				alert('Pocket disconnected');
			}
			else console.log('Disconnect error');
		});
	},
	
	'click #connectToPocket' : function(event){
		var popup = openCenteredPopup(                                                                     
		uri.req,                                                                                             
		970,                                                         
		615); 
	}
	
}


/**
* PopUp
*/


var openCenteredPopup = function(url, width, height) {                                                // 41
  var screenX = typeof window.screenX !== 'undefined'                                                 // 42
        ? window.screenX : window.screenLeft;                                                         // 43
  var screenY = typeof window.screenY !== 'undefined'                                                 // 44
        ? window.screenY : window.screenTop;                                                          // 45
  var outerWidth = typeof window.outerWidth !== 'undefined'                                           // 46
        ? window.outerWidth : document.body.clientWidth;                                              // 47
  var outerHeight = typeof window.outerHeight !== 'undefined'                                         // 48
        ? window.outerHeight : (document.body.clientHeight - 22);                                     // 49
  // XXX what is the 22?                                                                              // 50
                                                                                                      // 51
  // Use `outerWidth - width` and `outerHeight - height` for help in                                  // 52
  // positioning the popup centered relative to the current window                                    // 53
  var left = screenX + (outerWidth - width) / 2;                                                      // 54
  var top = screenY + (outerHeight - height) / 2;                                                     // 55
  var features = ('width=' + width + ',height=' + height +                                            // 56
                  ',left=' + left + ',top=' + top + ',scrollbars=yes');                               // 57
                                                                                                      // 58
  var newwindow = window.open(url, 'Login', features);                                                // 59
  if (newwindow.focus)                                                                                // 60
    newwindow.focus();                                                                                // 61
  return newwindow;                                                                                   // 62
};