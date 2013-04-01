Ticketing = Ember.Application.create({
	rootElement:"#mainPage"
});

Ticketing.Router.map(function(){
	this.route('search', {path: '/'});
});

Ticketing.SearchController = Ember.ObjectController.extend({
	hasResult:false,
	source:"",
	destination:"",
	results:null,
	searchTrain: function(){
		var source = this.get('source');
		var dest = this.get('destination');
		var ticketingModel = Ticketing.TrainInfo.create();
		this.set("results", ticketingModel.searchTrain(source, dest));
		var results = this.get('results')
		if(results.get('error')){
			this.set('hasResult', false);
		} else {
			this.set('hasResult', true);
		}
	},
});

Ticketing.SearchView = Ember.View.extend({
	templateName:"search",
	hasResult:false,
});
Ticketing.ResultView = Ember.View.extend({
	templateName: "result"
});

Ticketing.TrainInfo = Ember.Object.extend({
	searchTrain: function(source, destination){
		Parse.initialize("PIksQ4FqeL44m0lylmj3Lj3N48zTuSNNFSSED7g1", "Qsel3hgjZWN38i4nPJYuwPkfhKsYvbxSqJ44GmKs");
/*		var data = Ticketing.TrainInfo.data;
		for(var i=1;i<data.length;i++){
		$.ajax({
			url:'https://api.parse.com/1/classes/TrainObj',
			data:JSON.stringify(data[i]),
			contentType:'application/json',
			type:'POST',
			headers:{
				'X-Parse-Application-Id': 'PIksQ4FqeL44m0lylmj3Lj3N48zTuSNNFSSED7g1',
				"X-Parse-REST-API-Key": "xO7JIwnTjsM2eUkPUliLibWsSphE5PVruCvrCM91"
			}
		}).done(function(msg){
			alert(msg);
		});
	}*/
		var result = Ember.ArrayProxy.create({content:[], isLoaded:false});
		if(!source || !destination){
			return {
				error:"Please enter sufficient Information to search"
			}
		}
		var query = encodeURIComponent('where={"source":"' + source + '", "destination": "' + destination +'"}');
		var getUrl = 'https://api.parse.com/1/classes/TrainObj?' + query;
		$.ajax({
			url:getUrl,
			contentType:'application/json',
			type:'GET',
			headers:{
				'X-Parse-Application-Id': 'PIksQ4FqeL44m0lylmj3Lj3N48zTuSNNFSSED7g1',
				"X-Parse-REST-API-Key": "xO7JIwnTjsM2eUkPUliLibWsSphE5PVruCvrCM91"
			}
		}).done(function(response){
			var data = response.results;
			if(data.length >0){
				for(var i=0;i< data.length;i++){
					result.pushObject(Ticketing.TrainInfo.create(data[i]));
				}
				result.set('isLoaded', true);
			} else {
				result.pushObject({error:"there is no such route"});	
			}
		});
		return result;
	}	
});

Ticketing.TrainInfo.data = [
	{
		id:1,
		source:'Bangalore',
		destination:'Mysore',
		trainId:001,
		name:"Tuticorin"
	},
	{
		id:1,
		source:'Bangalore',
		destination:'Mysore',
		trainId:001,
		name:"Tuticorin"
	},
	{
		id:2,
		source:'Bangalore',
		destination:'Mysore',
		trainId:010,
		name:"Express"
	},
	{
		id:3,
		source:'Bangalore',
		destination:'Mysore',
		trainId:011,
		name:"Passenger"
	},
	{
		id:4,
		source:'Bangalore',
		destination:'Chennai',
		trainId:029,
		name:"Shatabdi"
	},
	{
		id:5,
		source:'Bangalore',
		destination:'Pune',
		trainId:023,
		name:"Express"
	},
	{
		id:6,
		source:'Bangalore',
		destination:'Mysore',
		trainId:041,
		name:"Shatabdi"
	}
	]