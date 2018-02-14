// Heureka Data Handling Class v1.0

class Heureka {
	constructor(){
		this.categories = {};
		this.productCategoryIDs = [];
		this.offerProductIDs = [];
		this.categoriesGetURL = "https://testdaycatalogueapi-vtnovk529892.codeanyapp.com/categories/";
		this.categoryGetURL = "https://testdaycatalogueapi-vtnovk529892.codeanyapp.com/category/{categoryId}/";
		this.productsGetURL = "https://testdaycatalogueapi-vtnovk529892.codeanyapp.com/products/{categoryId}/";
		this.productGetURL = "https://testdaycatalogueapi-vtnovk529892.codeanyapp.com/product/{productId}/";
		this.offersGetURL = "https://testdaycatalogueapi-vtnovk529892.codeanyapp.com/offers/{productId}/";
	}
	loadCategories(callback){
		if(typeof(callback) === 'undefined'){
			callback = function(){};
		}
		$.getJSON(this.categoriesGetURL,(function(inst){
			return function(data){
				for(var i in data){
					inst.categories[data[i].categoryId] = {
						title: data[i].title,
						products: {},
						productsLoaded: false,
						productsCount: 0
					};
				}
				callback();
			}
		})(this, callback));
	}
	loadProducts(catgid, callback){
		if(typeof(callback) === 'undefined'){
			callback = function(){};
		}
		let jsonURL = this.productsGetURL.replace("{categoryId}",catgid);
		//console.log(jsonURL);
		$.getJSON(jsonURL,(function(inst,cid, cb){
			return function(data){
				var count = 0;
				for(var i in data){
					count++;
					inst.productCategoryIDs[data[i].productId] = cid;
					inst.categories[cid].productsLoaded = true;
					inst.categories[cid].products[data[i].productId] = {
						title: data[i].title,
						offers: {},
						offersLoaded: false
						//offersCount: 0
					};
				}
				inst.categories[cid].productsCount = count;
				cb();
			}
		})(this,catgid, callback));
	}
	loadOffers(prodid, callback){
		if(typeof(callback) === 'undefined'){
			callback = function(){};
		}
		let jsonURL = this.offersGetURL.replace("{productId}",prodid);
		//console.log(jsonURL);
		$.getJSON(jsonURL,(function(inst,pid, cb){
			return function(data){
				for(var i in data){
					inst.offerProductIDs[data[i].offerId] = pid;
					var catgid = inst.productCategoryIDs[pid];
					inst.categories[catgid].products[pid].offersLoaded = true;
					inst.categories[catgid].products[pid].offers[data[i].offerId] = {
						title: 			data[i].title,
						description: 	data[i].description,
						url: 			data[i].url,
						imgUrl: 		data[i].imgUrl,
						price: 			data[i].price
					};
				}
				cb();
			}
		})(this,prodid,callback));
	}
	loadProductWithOffers(prodid, callback){
		if(typeof(callback) === 'undefined'){
			callback = function(){};
		}
		let jsonURL = this.productGetURL.replace("{productId}",prodid);
		//console.log(jsonURL);
		$.getJSON(jsonURL,(function(inst,pid, cb){
			return function(data){
				console.log(data[0]);
				var cid = parseInt(data[0].categoryId);
				console.log('prodid loaded')
				inst.productCategoryIDs[data[0].productId] = cid;
				//inst.categories[cid].productsLoaded = true;
				inst.categories[cid].products[data[0].productId] = {
					title: data[0].title,
					offers: {},
					offersLoaded: false
				};
				inst.loadOffers(pid,cb);
			}
		})(this,prodid, callback));
	}

}
Heureka.prototype.hello = function(name){
	alert('Hello ' + name);
}