
//startup
 Meteor.startup(function () {
		
 });

// Account handling

Accounts.onCreateUser(function(options, user){
    if (options.profile)
	user.profile = options.profile;
    user.pocket = {isUserCode: 0, isAppCode: 0, accessCode: null};
    return user;
});

 Accounts.addAutopublishFields({
    forLoggedInUser: ['pocket'],
  });

/*Meteor.publish('pocketCredentialStatus', function(){
	return Meteor.users.find({_id: this.userId}, {fields: {pocket: 1}});
});*/


// Methods

Meteor.methods({
    pocketCredentials: function() {
        return {
            consumer_key : '17580-7de40cb3f846864f61048d5d',
        }
    },
	
	resetPocketCredentials: function() {
		Meteor.users.update({_id: Meteor.userId()}, {$set: {pocket: {isUserCode: 0, isAppCode: 0, accessCode: ''}}}, function(){
						console.log('User disconnected Pocket');
					});
		return (Meteor.user().pocket.isUserCode == 0);
	},

    
    authPocketApp: function(redirect_uri) {
		console.log('Pocket: app auth started');
		this.unblock();
		
		//setting back user access data
		Meteor.users.update({_id: Meteor.userId()}, {$set: {pocket: {isUserCode: 0, isAppCode: 0, accessCode: ''}}}, function(){
						console.log('User reset before getting new Access code');
				});
		
		if(Meteor.user()){
			var authUrl = 'https://getpocket.com/v3/oauth/request';
			var response = HTTP.call('POST', authUrl, {params: {'consumer_key': Meteor.call('pocketCredentials').consumer_key, 'redirect_uri': redirect_uri}});
			var reqToken = '';
			
			if(response.statusCode==200){
				reqToken = response.content.replace('code=', '');
				Meteor.users.update({_id: Meteor.userId()}, {$set: {pocket: {isUserCode: 0, isAppCode: 1, accessCode: reqToken}}}, function(){
					console.log('Access code received');
				});
				return true;
			}
			else throw new Meteor.Error(response.statusCode);
		}
		else throw new Meteor.Error('Not logged in');		
	},
	
	authPocketUser: function() {
		this.unblock();
		if(Meteor.user()){
			console.log('Pocket: user authorization started');
			var authUrl = 'https://getpocket.com/v3/oauth/authorize';
			var response = HTTP.call('POST', authUrl, {params: {'consumer_key': Meteor.call('pocketCredentials').consumer_key, 'code': Meteor.user().pocket.accessCode}});//, {headers: {"content-type": "application/x-www-form-urlencoded; charset=UTF8", "X-Accept": "application/x-www-form-urlencoded"}});
			if(response.statusCode==200){
				reqToken = response.content.split("&");
				var accessCodeTemp = reqToken[0].replace('access_token=', '');
				console.log('User Code received');
				Meteor.users.update({_id: Meteor.userId()}, {$set: {pocket: {isUserCode: 1, isAppCode: 1, accessCode: accessCodeTemp}}}, function(){
					console.log('Access code saved');
					
				});
			}
			else throw new Meteor.Error(response.statusCode + response.content);
		}
		else throw new Meteor.Error('Error in user authentication');
		}
	});	
