
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
    
	pocketUser: function(){
		if (Meteor.user()) {                 
			return {
				accessCode: Meteor.user().pocket.accessCode,
				isUserCode: Meteor.user().pocket.isUserCode
			}					
		}  
		else throw new Meteor.Error('User not registered or accessible on Pocket');	
	},
	

	pocketCredentials: function() {
        return {
            consumer_key : '17580-7de40cb3f846864f61048d5d',
			request: 'https://getpocket.com/v3/request',
			retrieve : 'https://getpocket.com/v3/get',
			auth: 'https://getpocket.com/v3/oauth/authorize',
			
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
		var authUrl = 'https://getpocket.com/v3/request';
		
		//setting back user access data
		Meteor.users.update({_id: Meteor.userId()}, {$set: {pocket: {isUserCode: 0, isAppCode: 0, accessCode: ''}}}, function(){
						console.log('User reset before getting new Access code');
				});
		
		if(Meteor.user()){
			var response = HTTP.call('POST', authUrl, {params: {'consumer_key': Meteor.call('pocketCredentials').consumer_key, 'redirect_uri': redirect_uri}});
			var reqToken = '';
			
			if(response.statusCode==200){
				reqToken = response.content.replace('code=', '');
				Meteor.users.update({_id: Meteor.userId()}, {$set: {pocket: {isUserCode: 0, isAppCode: 1, accessCode: reqToken}}}, function(){
					console.log('Access code received');
				});
				return true;
			}
			else throw new Meteor.Error(authURL + ' --- ' + response.statusCode);
		}
		else throw new Meteor.Error('Not logged in');		
	},
	
	authPocketUser: function() {
		this.unblock();
		if(Meteor.user()){
			console.log('Pocket: user authorization started');
			var authUrl = Meteor.call('pocketCredentials').auth;
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
	},
	
	//Method for getting user reading list from pocket
	// @params: date -> last date of entry to specify call
	
	pocketFetch: function(options){
				
		function getLastActivity(){
			var lastAct = PocketReads.findOne({_id: Meteor.userId()}, { fields: {'lastActive': 1, _id:0}});
				if(lastAct.lastActive === undefined) res ='';
				else res = lastAct.lastActive;
			return res;
		}
		var consumer_key = Meteor.call('pocketCredentials').consumer_key,
			access_token = Meteor.call('pocketUser').accessCode,
			authUrl = Meteor.call('pocketCredentials').retrieve,
			lastActive = getLastActivity();
					
		if(!consumer_key || !access_token || Meteor.call('pocketUser').isUserCode == 0) {
            throw new Meteor.Error('400', 'Missing parameter for authorized Pocket API call');
        }
		
		var params = {
			'consumer_key': consumer_key, 
			'access_token': access_token, 
			'state': 'all', 
			'sort': 'newest',
			'since': lastActive,
		};
		
		var allowedParams = {
			'consumer_key':'','access_token':'','state':'','sort':'','favorite':'','tag':'','contentType':'','detailType':'','search':'','domain':'','since':'','count':'','offset':''
		};
		
		function extend(a, b, ok){
			for(var key in b)
				if(b.hasOwnProperty(key) && key in ok)
					a[key] = b[key];
			return a;
		};
		
		params = extend(params, options, allowedParams);
		
        this.unblock();
		// need to build options into call & handle
		var response = HTTP.call('POST', authUrl, {params: params});
		if(response.statusCode==200){
			var json = JSON.parse(response.content);
			var contents = {reads: json.list};
			//PocketReads.insert({_id: Meteor.userId() , reads: json.list});
			return contents;
		}
		
		else{ 
			throw new Meteor.Error(response.statusCode + response.content);
		}
		
	},
	
	pocketUpdateDB: function(options){
		/*todo:
			-define options for which call to make (API)
		*/
	
		//fetch results
		var results = {};
		Meteor.call('pocketFetch', options, function(err, res){
			if(!res){
				throw new Meteor.Error('Error in calling Pocket API fetch - '+ err);
			}
			else {
				
				modifyApiData = function(obj){
					var newObject = obj; 
					if(obj.hasOwnProperty('reads')){
						newObject = {_id: Meteor.userId(), reads: obj.reads}
					}
					return newObject;
				};
				
				results = modifyApiData(res);
				
			}
		});
		console.log(results);
				
		return results;
		
		//search user
		//update existing entries
		//add new entries
		//update lastActive
	},
	
	pocketRefresh: function(options){
		//remote available method for client
	},
	
	getReadsByUser: function(){
		//check if result is enumerable; else throw exception
		/*
		if(res.propertyIsEnumerable('reads')){
			Object.getOwnPropertyNames(res.reads));
			modifyPocketData = function(obj){
				var result = {};
				for (var key in obj) result.push({'itemiddd': obj[key].item_id});
				return result;
			}*/
	
	},
	
		
	});	
