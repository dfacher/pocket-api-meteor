/**
* Init
*/


Meteor.startup(function() {
	//Start Backbone Router
	var router = new Auth_Router();
    Backbone.history.start({pushState: true});

	//Change account config to reflect Pocket entries
   Accounts.ui.config({
       requestPermissions: {},
       requestOfflineToken: {},
       passwordSignupFields: 'USERNAME_ONLY'
   });
   
	//dependencies
	//var pocketLoginStatus_dep = new Deps.Dependency();
    //Meteor.subscribe("pocketCredentialStatus");

	
/*Deps.autorun(function () {
	var pocketLoginStatus = Meteor.users.find({_id: Meteor.userId()}, {fields: {pocket: 1}}).fetch(), function(){
		pocketLoginStatus_dep.changed();
	});
});*/
 });

/**
* Client Side Router
*/

var Auth_Router = Backbone.Router.extend({
    routes: {
        "": "root",
        "auth":   "auth"
    },
    root: function () {},
    auth: function (code)  {
        Meteor.call('authPocketUser', function (error, result) {
           console.log('Callback Auth started');
		   if(!result){
				console.log('Error authenticating Pocket User');
		   }
		   else{
				console.log('Got Result');
				console.log('result');
				window.close();
			}
        });
        //this.navigate('');
    }
});  

/**
* Logic
*/

var clientAuthApp = function(){
	// todo: check if app already authorized
	// get redirect uri
	var redirect_uri = '';
	Meteor.call('pocketCredentials', function(error, result){
		if(result) redirect_uri = result.redirect_uri;
	});
	
	//call auth
    Meteor.call('authPocketApp', function(error, result){
            if(result==true){
				var url =  'https://getpocket.com/auth/authorize?request_token='+Meteor.user().pocket.accessCode+'&redirect_uri='+redirect_uri;
				var win = window.open(url);
			}
			else{
				console.log('Error authenticating Pocket App');
				throw new Meteor.Error(error);
			}
        });
}
	
/**
* Templates
*/

Template.users.pocketAuthorized = function() {
	if(Meteor.user()){
		var pocket = Meteor.user().pocket;
		if (pocket.isUserCode == 1) return true;
    }
    return false;
}

Template.unAuthorizedPocket.events = {
    'click #connectToPocket' : function(event){
		console.log('Client: Connect Button pressed');
		//check current value of pocket entry
		if(Meteor.user()){
			var pocket = Meteor.user().pocket;
			
			//if no app authorization, authorize app
			if(pocket.isUserCode == 0){
				console.log('Client: App authorization started');
				//callback user authorization
				clientAuthApp();
				
			}
		
				//call authorized event @server		
				
						
			//else if return ture & call authorized event @server
			else if(pocket.isUserCode == 1){
				console.log('Client: User code existing')
				return true;
			}
			//throw exception
			return false;
			
		}    
   }
    
}

Template.authorizedPocket.events = {
    'click #disconnectPocket' : function(event){
		Meteor.call('resetPocketCredentials', function(error, result){
			console.log('Result: '+result);
			if(result==true){
				alert('Pocket disconnected');
			}
			else console.log('Disconnect error');
		});
	}
}

Template.input.events = {
    'keydown input#message' : function(event){
	if (event.which == 13){
	    var name = 'An';
	    var message = document.getElementById('message');
	}
	if (message.value != ''){
	    Messages.insert({
		name: name,
		message: message.value,
		time: Date.now(),
	    });
	    document.getElementById('message').value = '';
            message.value = '';
	}
}

}
