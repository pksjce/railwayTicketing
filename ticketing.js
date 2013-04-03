Ticketing = Ember.Application.create({
	rootElement:"#mainPage"
});

Ticketing.Router.map(function(){
	this.route('bookings', {path: '/bookings/:id'});
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
		var results = this.get('results');
		if(results.get('error')){
			this.set('hasResult', false);
		} else {
			this.set('hasResult', true);
		}
	}
});

Ticketing.BookingsController = Ember.Controller.extend();

Ticketing.BookingsRoute = Ember.Route.extend({
	setupController: function(controller, model){
		console.log(model);
		if(typeof model === 'object'){
			model = model.id;
		}
		var self = this;
		Ticketing.TrainDetail.find(model).then(function(response){
			var trainDetails = Ember.ArrayProxy.create({content:[], isLoaded:false});
			model = trainDetails;
			var data = response.results;
			if(data.length > 0){
				for(var i=0;i< data.length;i++){
					trainDetails.pushObject(Ticketing.TrainDetail.create(data[i]));
				}
				trainDetails.set('isLoaded', true);
			} else {
				trainDetails.pushObject({error:"Oops! No Trains matching these routes found. :("});
			}
			controller.set('content', {'trainDetails': trainDetails});
			console.log(model);
		});
		//var trainDates = Ticketing.TrainDetail.create();
		/*this.set('results', Ticketing.TrainDetail.find(model));
		var results = this.get('results');
		console.log(results);*/
	}
});


/*Ticketing.BookController = Ember.ObjectController.extend({

});*/

Ticketing.SearchView = Ember.View.extend({
	templateName:"search",
	hasResult:false
});
Ticketing.BookingsView = Ember.View.extend({
	templateName: "bookings"
});

Ticketing.TrainDetail = Ember.Object.extend({});

Ticketing.TrainDetail.reopenClass({
	find: function(id){
		Parse.initialize("PIksQ4FqeL44m0lylmj3Lj3N48zTuSNNFSSED7g1", "Qsel3hgjZWN38i4nPJYuwPkfhKsYvbxSqJ44GmKs");
		var query = encodeURIComponent('where={"trainId":' + id + '}');
		var getUrl = 'https://api.parse.com/1/classes/TrainData?' + query;
		return $.ajax({
			url:getUrl,
			contentType:'application/json',
			type:'GET',
			headers:{
				'X-Parse-Application-Id': 'PIksQ4FqeL44m0lylmj3Lj3N48zTuSNNFSSED7g1',
				"X-Parse-REST-API-Key": "xO7JIwnTjsM2eUkPUliLibWsSphE5PVruCvrCM91"
			}
		})/*.done(function(response){
			var data = response.results;
			if(data.length > 0){
				for(var i=0;i< data.length;i++){
					result.pushObject(Ticketing.TrainDetail.create(data[i]));
				}
				result.set('isLoaded', true);
			} else {
				result.pushObject({error:"Oops! No Trains matching these routes found. :("});
			}
			return result;
		})*/;
	}
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
			};
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
				result.pushObject({error:"Oops! No Trains matching these routes found. :("});
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