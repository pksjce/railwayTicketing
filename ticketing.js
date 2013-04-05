Ticketing = Ember.Application.create({
	rootElement:"#mainPage"
});

Ticketing.Router.map(function(){
	this.route('login', {path: '/'});
	this.route('bookings', {path: '/bookings/:id'});
	this.route('search');
});

Ticketing.LoginRoute = Ember.Route.extend({
});

Ticketing.LoginController = Ember.ObjectController.extend({
	isUserLoggedIn: false,
	username: "",
	password: "",
	loginFail: false,
	errorMsg: "",
	loginUser: function(){
		this.set('loginFail', false);
		var user = this.get('username');
		var pass = this.get('password');
		var self = this;
		if(!user || !pass){
			this.set('loginFail', true);
			this.set('errorMsg', "Empty Credentials");
		} else {
			Ticketing.LoginModel.login(user, pass).always(function(resp, textStatus, jqXHR){
				if(textStatus === "error" && resp.status === 404){
					self.set('loginFail', true);
					self.set('errorMsg', "Invalid Credentials");
				} else if(resp.username === user){
					self.set('loginFail', false);
					self.set('isUserLoggedIn', true);
					self.transitionToRoute('search');
				}
			});
		}
	},
	clearFields: function(){
		this.set('loginFail', false);
		this.set('username', "");
		this.set('password', "");
	}
});

Ticketing.SearchRoute = Ember.Route.extend({
	setupController: function(controller, model){
		if(!this.controllerFor('login').get('isUserLoggedIn')){
			controller.transitionToRoute('login');
		}
	}
});

Ticketing.SearchController = Ember.ObjectController.extend({
	needs: 'login',
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
				result.pushObject({error:"No Trains travelling from " + source +" to "+ dest+" found. :("});
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

Ticketing.BookingsController = Ember.Controller.extend({
	needs: 'login',
	bookingDone:false,
	updateModel:function(id){
		var that = this;
		Ticketing.TrainDetail.find(id).then(function(response){
			var trainDetails = Ember.ArrayProxy.create({content:[], isLoaded:false});
			model = trainDetails;
			var data = response.results;
			if(data.length > 0){
				for(var i=0;i< data.length;i++){
					trainDetails.pushObject(Ticketing.TrainDetail.create(data[i]));
				}
				trainDetails.every(function(trainDetail, index, self){
					trainDetail.addObserver('classASeats', function(){
						return that.updateAvailability(this, 'classASeats');
					});
					trainDetail.addObserver('classBSeats', function(){
						return that.updateAvailability(this, 'classBSeats');
					});
					trainDetail.addObserver('classCSeats', function(){
						return that.updateAvailability(this, 'classCSeats');
					});
				})
				trainDetails.set('isLoaded', true);
			} else {
				trainDetails.pushObject({error:"Oops! No Trains matching these routes found. :("});
			}
			that.set('content', {'trainDetails': trainDetails});
		});
	},
	updateAvailability: function(object, type){
		var self = this;
		Ticketing.TrainDetail.updateAvailability(object, type)
			.then(function(){
				self.set('bookingDone', true);
			});
	}
});

Ticketing.BookingsRoute = Ember.Route.extend({
	setupController: function(controller, model){
		if(!this.controllerFor('login').get('isUserLoggedIn')){
			controller.transitionToRoute('login');
		} else{
			if(typeof model === 'object'){
				model = model.id;
			}
			controller.updateModel(model);
		}
	}
});

Ticketing.SearchView = Ember.View.extend({
	templateName:"search",
	hasResult:false
});

Ticketing.BookingsView = Ember.View.extend({
	templateName: "bookings",
	showChildOnly: function(childId){
		this.get('childViews').forEach(function(item, index){
			var elementId = item.get('elementId');
			if(elementId != childId){
				$('#' + elementId).next().css('display', 'none');
			}
		});
	},
	showAll: function(){
		this.get('childViews').forEach(function(item, index){
			var elementId = item.get('elementId');
			$('#' + elementId).next().css('display', '');
		});
	}

});

Ticketing.PerTrainView = Ember.View.extend({
	templateName: "perTrain"
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
			this.set('errorMsg', 'Please enter all the above data for successful booking');

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
				self.get('train').set('class'+type+'Seats', newAvailable);
				self.set('bookingSuccess', true);
				self.set('bookingId', response.objectId);
			});
			
/*			var parent = this.get('parentView');
			parent.get('parentView').showAll();*/
		}
	},
	responseDone: function(){
		this.set('toBook', false);
	},
	showBooking: function(){
		console.log(this.get('temp'));
		this.set('toBook', true);
		/*var parent = this.get('parentView');
		parent.get('parentView').showChildOnly(parent.get('elementId'));*/
	},
	cancel: function(){
		this.set('toBook', false);
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
	updateAvailability: function(obj, type){
		console.log('I will update availability' +  obj.get(type));
		
		var data = {};
		data[type] = obj.get(type);
		return $.ajax({
			url:"https://api.parse.com/1/classes/TrainData/" + obj.get('objectId') ,
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
		});
	}
});

Ticketing.TrainInfo = Ember.Object.extend({
});

Ticketing.TrainInfo.reopenClass({
	searchTrain: function(source, destination){
		Parse.initialize("PIksQ4FqeL44m0lylmj3Lj3N48zTuSNNFSSED7g1", "Qsel3hgjZWN38i4nPJYuwPkfhKsYvbxSqJ44GmKs");
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

Ticketing.LoginModel = Ember.Object.extend({
});

Ticketing.LoginModel.reopenClass({
	login: function(user, pass){
		Parse.initialize("PIksQ4FqeL44m0lylmj3Lj3N48zTuSNNFSSED7g1", "Qsel3hgjZWN38i4nPJYuwPkfhKsYvbxSqJ44GmKs");
		var username = encodeURIComponent(user);
		var password = encodeURIComponent(pass);
		var getUrl = 'https://api.parse.com/1/login?username=' + username + '&password='+password;
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