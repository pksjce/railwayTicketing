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
		var self = this;
		Ticketing.TrainInfo.searchTrain(source, dest).then(function(response){
			var result = Ember.ArrayProxy.create({content:[], isLoaded:false});
			var data = response.results;
			if(data.length >0){
				for(var i=0;i< data.length;i++){
					result.pushObject(Ticketing.TrainInfo.create(data[i]));
				}
				result.set('isLoaded', true);
			} else {
				result.pushObject({error:"Oops! No Trains matching these routes found. :("});
			}
			self.set('results', result);
			var results = self.get('results');
			if(results.get('error')){
				self.set('hasResult', false);
			} else {
				self.set('hasResult', true);
			}
		});
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
		});
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

Ticketing.BookTicketView = Ember.View.extend({
	templateName:"bookTicket",
	toBook:false,
	bookNow: function(){
		var noOfTickets = this.get('noOfTickets');
		var userName = this.get('userName');
		var mobile = this.get('mobile');
		var trainDetails = this.get('train');
		var objectId = trainDetails.get('objectId');
		if(!noOfTickets || !userName || !mobile){
			alert("Please give all details");

		} else{
			var bookingDetails = {
				noOfTickets: noOfTickets,
				userName:userName,
				mobile: mobile,
				trainId: objectId,
				type:this.get('type')
			};
			var self = this;
			var updatedObj = Ticketing.BookingDetails.saveBooking(bookingDetails)
			.then(function(response){
				var that = self;
				var type = self.get('type');
				var newAvailable = self.get('available') -noOfTickets;
				Ticketing.TrainDetail.updateAvailability(newAvailable, type , objectId)
				.then(function(response){
					var key = 'class'+type+'Seats';
					//that.get('parentView').set(key, newAvailable);
				});
			});
			
			this.set('toBook', false);
		}
	},
	showBooking: function(){
		console.log(this.get('temp'));
		this.set('toBook', true);
	}
});

Ticketing.BookingDetails = Ember.Object.extend({

});

Ticketing.BookingDetails.reopenClass({
	saveBooking: function(bookingDetails){
		console.log("I will save " + bookingDetails);
		return $.ajax({
			url:"https://api.parse.com/1/classes/BookingDetails",
			contentType:'application/json',
			type:'POST',
			headers:{
				'X-Parse-Application-Id': 'PIksQ4FqeL44m0lylmj3Lj3N48zTuSNNFSSED7g1',
				"X-Parse-REST-API-Key": "xO7JIwnTjsM2eUkPUliLibWsSphE5PVruCvrCM91"
			},
			data: JSON.stringify(bookingDetails)
		});
	}
});

Ticketing.TrainDetail = Ember.Object.extend({

});

Ticketing.TrainDetail.reopenClass({
	updateAvailability: function(availability, type, objectId){
		console.log('I will update availability' +  availability);
		var key = 'class'+type+'Seats';
		var data = {};
		data[key] = availability;
		return $.ajax({
			url:"https://api.parse.com/1/classes/TrainData/" + objectId ,
			contentType:'application/json',
			type:'PUT',
			headers:{
				'X-Parse-Application-Id': 'PIksQ4FqeL44m0lylmj3Lj3N48zTuSNNFSSED7g1',
				"X-Parse-REST-API-Key": "xO7JIwnTjsM2eUkPUliLibWsSphE5PVruCvrCM91"
			},
			data: JSON.stringify(data)
		});

	},
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
});

Ticketing.TrainInfo.reopenClass({
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
		if(!source || !destination){
			return {
				error:"Please enter sufficient Information to search"
			};
		}
		var query = encodeURIComponent('where={"source":"' + source + '", "destination": "' + destination +'"}');
		var getUrl = 'https://api.parse.com/1/classes/TrainObj?' + query;
		return $.ajax({
			url:getUrl,
			contentType:'application/json',
			type:'GET',
			headers:{
				'X-Parse-Application-Id': 'PIksQ4FqeL44m0lylmj3Lj3N48zTuSNNFSSED7g1',
				"X-Parse-REST-API-Key": "xO7JIwnTjsM2eUkPUliLibWsSphE5PVruCvrCM91"
			}
		});
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