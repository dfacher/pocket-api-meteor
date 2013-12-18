
Template.readList.helpers({
	articles: function(){}/*
		var userReads = PocketReads.findOne({_id: Meteor.userId()}, { fields: {'reads': 1, _id: 1 }});
		var arrify = function(obj){
		
			obj = prep(obj);
			
			var result = [];
			for (var key in obj) result.push({title: obj[key].resolved_title, word_count: obj[key].word_count});
			return result;
		}
		var prep = function(obj){
				var result = [];
				for (var key in obj) result.push(obj[key]);
				return result;
			}
					
		return arrify(userReads.reads);
		}*/
});

Template.readList.events = {
    'click #fetchCallPocket' : function(event){
		if(Meteor.user()){
		Meteor.call('pocketUpdateDB', {'since': '1387333983'}, function(error, result){
			if(!result){
				console.log('Error fetching from Pocket' + error);
			}
			else {
				console.log(result);
				res = result;
			}
		});
	} 
	}
}