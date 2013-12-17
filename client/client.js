/**
* Init
*/

Meteor.startup(function() {
	
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

Meteor.Router.add({    
    '/': 'home',
	
	'/auth': {as: 'req', to: function (code){
        Meteor.call('authPocketUser', function (error, result) {
           console.log('Callback Auth started');
		   if(!result){
				console.log('Error authenticating Pocket User');
		   }
		   else{
				console.log('Got Result');
				console.log('result');				
			}
        });
		return 'auth';
    }},
	
	'/req': {as: 'req', to: function (code)  {
		return 'req';
	}},
	'/mu': {as: 'mu', to: function (code)  {
		return 'mu';
	}},
	'/ma': {as: 'ma', to: function (code)  {
		
	}}
});  



/**
* Logic
*/



	
/**
* Templates
*/



