// Main controller
var productsPerPage = 5;
var loadTimeout = 0;
var state = {}; // variable for storing the current state

// decoding URL params
$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
       return null;
    }
    else{
       return decodeURI(results[1]) || 0;
    }
}

// Function that executes after main page load
var afterLoadCatg = function(show){
	if(typeof(show) === 'undefined'){
		show = 1;
	}
	console.log(show);
	switchLoading(0);
	$("nav ul").html('');
	$(".categories ul").html('');
	$('title').html('Heureka');
	$(".categories").css("display",(show ? "block" : "none"));
	$(".offers").css("display","none");
	$(".items").css("display","none");
	$(".paginator").css("display","none");
	for(var k in h.categories){
		tit = h.categories[k].title;
		$("nav ul").append("<li id='nav"+k+"' onclick='showCategory("+k+")'><a onclick=\"event.preventDefault();\" href=\"#\">"+tit+"</a></li>");
		$(".categories ul").append("<li id='catg"+k+"' onclick='showCategory("+k+")'><span><a onclick=\"event.preventDefault();\" href=\"#\"><img src=\"iphone.jpg\"><p>"+tit+"</p></a></span></li>");
	}
}

// History tracking and handling
window.onpopstate = function(event){
	s = event.state;
	console.log(s);
	if(s.type=='main' || s == null){
		afterLoadCatg();
	}
	if(s.type == 'category'){
		showCategory(s.id, s.pg, 0);
	}
	if(s.type == 'product'){
		showOffers(s.id,0);
	}
}

// Switching loading symbol
function switchLoading(toggle){
	window.clearTimeout(loadTimeout);
	if(toggle){
		$(".loading").css("display","block");
		loadTimeout = window.setTimeout("switchLoading(0)",5000);
	} else {
		$(".loading").css("display","none");
	}
}

// Function for showing a products from specifioc category
// Function has a callback afterLoadProducts which handles the main functionality after data loading

function showCategory(cid, page, pushState){
	if(typeof(page) === 'undefined'){
		//console.log('defining page');
		page = 1;
	}
	if(typeof(pushState) === 'undefined'){
		//console.log('defining pushState');
		pushState = 1;
	}
	var afterLoadProducts = function(cid, page, pushState){
		return function(){
			var paginator = $(".paginator ul");			
			var itemList = $(".items ul");
			paginator.html('');
			itemList.html('');
			nPage = Math.ceil(h.categories[cid].productsCount / productsPerPage);
			//console.log(nPage);
			// Make Paginator when there are more than one page
			if(nPage>1){
				if(page<=1){
					paginator.append('<li class="disabled"><</li>');
				} else {
					paginator.append('<li onclick=\"event.preventDefault();showCategory('+cid+', '+(page-1)+')\"><a href="#"><</a></li>');
				}
				
				for(var l = 0;l<nPage;l++){
					if(l+1 == page) paginator.append('<li class="active" onclick=\"event.preventDefault();showCategory('+cid+', '+(l+1)+')\"><a href="#">'+(l+1)+'</a></li>');
					else paginator.append('<li onclick=\"event.preventDefault();showCategory('+cid+', '+(l+1)+')\"><a href="#">'+(l+1)+'</a></li>');
				}
				
				if(page>=nPage){
					paginator.append('<li class="disabled">></li>');
				} else {
					paginator.append('<li onclick=\"event.preventDefault();showCategory('+cid+', '+(page+1)+')\"><a href="#">></a></li>');
				}
			}
			
			// Show specific product for one page
			nl = 0;
			for(var k in h.categories[cid].products){
				nl++;
				//console.log(nl + ' ' + (page));
				if(nl <= (page-1)*productsPerPage || nl > (page)*productsPerPage){
					continue;
				}
				var name = h.categories[cid].products[k].title;
				itemList.append('<li id=\'product-'+k+'\'><div class="item-left"><img src="na.jpg"></div>\n<div class="item-center">\n<h3>'+name+'</h3>\n<p>No description</p>\n</div><div class="item-right">\n<div class="item-price"><p>N/A Kč</p></div>\n<div class="item-compare-price"><button type="button" onclick="showOffers('+k+')">Srovnat ceny</button></div></div></li>');
				getProductDetails(k);
			}
			
			// Update title and history states
			$('title').html('Heureka - ' + h.categories[cid].title);
			if(pushState){
				if(page == 1)
					window.history.pushState({type:'category',id:cid, pg:page}, 'Heureka - '+h.categories[cid].title,'./category-'+cid);
				else window.history.pushState({type:'category',id:cid, pg:page}, 'Heureka - '+h.categories[cid].title,'./category-'+cid+'-p-'+page);
			}
			
			//Hide the unwanted sections
			$(".categories").css("display","none");
			$(".offers").css("display","none");
			$(".items").css("display","block");
			$(".paginator").css("display","block");	
		}
	}
	//
	if(!h.categories[cid].productsLoaded){
		switchLoading(1);
		h.loadProducts(cid, afterLoadProducts(cid, page, pushState));
	} else {
		console.log('already loaded');
		(afterLoadProducts(cid,page,pushState))(cid, page, pushState);
	}
}

// Loading offers for specific product
// Push state determines if history state is created bz calling this function
function getProductDetails(prodid, pushState){
	if(typeof(pushState) === 'undefined'){
		console.log('defining pushState');
		pushState = 1;
	}
	cid = h.productCategoryIDs[prodid];
	// Callback when loading offers is finished
	var afterLoadOffers = function(prodid){
		return function(){
			dsc= '';
			pricelow = 999999;
			pricehigh = 0;
			imgurl = '';
			for( var k  in h.categories[cid].products[prodid].offers){
				offer = h.categories[cid].products[prodid].offers[k];
				prc = parseInt(offer.price);
				(dsc == '' && offer.description != null) ? dsc = offer.description : '';
				(imgurl == '' && offer.imgUrl != null && offer.imgUrl != '(unknown)') ? imgurl = offer.imgUrl : '';

				(dsc != '' && offer.description != null && Math.random() < 0.4) ? dsc = offer.description : '';
				(imgurl != '' && offer.imgUrl != null && offer.imgUrl != '(unknown)' && Math.random() < 0.4) ? imgurl = offer.imgUrl : '';
				(pricelow > prc) ? pricelow = prc : '';
				(pricehigh < prc) ? pricehigh = prc : '';
			}
			
			if(imgurl != '') $('#product-'+prodid+' img').attr("src",imgurl);
			if(dsc != '') $('#product-'+prodid+' .item-center p').html(dsc);
			$('#product-'+prodid+' .item-price p').html(pricelow +' - '+pricehigh + ' Kč');
			switchLoading(0);
		}
	}
	
	//
	if(!h.categories[cid].products[prodid].offersLoaded){
		switchLoading(1);
		h.loadOffers(prodid, afterLoadOffers(prodid, pushState));
	} else {
		//console.log('already loaded offers');
		(afterLoadOffers(prodid, pushState))(prodid, pushState);
	}
}

// Function that shows product details and offers
// Push state determines if history state is created by calling this function
function showOffers(prodid, pushState){
	if(typeof(pushState) === 'undefined'){
		console.log('defining pushState');
		pushState = 1;
	}
	//console.log('poffers'+prodid);
	
	cid = h.productCategoryIDs[prodid];
	offers = $('.offers ul');
	offers.html('');
	offers.addClass('collapsed');
	dsc= [];
	imgurl = [];
	$('.loadmore').show();
	
	// Get data from offers
	for( var k  in h.categories[cid].products[prodid].offers){
		offer = h.categories[cid].products[prodid].offers[k];
		prc = parseInt(offer.price);
		offers.append('<li><span class="eshop-name">'+offer.title+'</span><span class="eshop-price"><p>'+prc+' Kč</p></span><span class="eshop-buy"><a href="'+offer.url+'"><p>Koupit</p></a></span></li>');
		
		(offer.description != null) ? dsc.push(offer.description) : '';
		(offer.imgUrl != null && offer.imgUrl != '(unknown)') ? imgurl.push(offer.imgUrl) : '';
	}
	// Selecting one description and one main image, showing other images as thumbs
	gallery = $('.item-description .gallery');
	gallery.html('');
	if(imgurl.length>0)	gallery.append('<span class="main"><a href=""><img src="'+imgurl[Math.round(Math.random()*(imgurl.length-1))]+'"></a></span>');
	else gallery.append('<span class="main"><a href=""><img src="na.jpg"></a></span>')
	for(var k =0; k<Math.min(imgurl.length,3);k++){
		gallery.append('<span><a href=""><img src="'+imgurl[k]+'"></a></span>')
	}
	$('.item-description .description').html('<h3>'+h.categories[cid].products[prodid].title+'</h3><p>'+dsc[Math.round(Math.random()*(dsc.length-1))]+'</p>');
	
	// Making title and history state
	$('title').html('Heureka - ' + h.categories[cid].products[prodid].title);
	if(pushState)
		window.history.pushState({type:'product',id:prodid}, 'Heureka - '+h.categories[cid].products[prodid].title,'./product-'+prodid);
	
	// Hide the unwanted sections
	$(".categories").css("display","none");
	$(".offers").css("display","block");
	$(".items").css("display","none");
	$(".paginator").css("display","none");
}

// Just disclose more offers to this product
function showMoreOffers(){
	$('.offers ul').removeClass('collapsed');
	$('.loadmore').hide();
}

function visitAddress(addr){
	window.location.href = addr;
}

// Instantiate main class
var h = new Heureka();

if($.urlParam('type')!=null){
	type = $.urlParam('type');
	id = $.urlParam('id');
	pid = $.urlParam('page');
	console.log(type,id);
	h.loadCategories((function(type,h){
		return function(){
			afterLoadCatg(0);
			switch(type){
				case 'category':
					showCategory(id, (pid==null || pid == '' ? 1 : pid), 1);
					break;
				case 'product':
					console.log('tst')
					h.loadProductWithOffers(id,(function(prodid){
						return function(){
							showOffers(prodid, 1);
						}
					})(id));
					break;
			}
		}
	})(type,h));
} else {
	h.loadCategories(afterLoadCatg);
}
window.history.pushState({type:'main'},'Heureka','');

// Some functionality for menu and product details
$(document).ready(function(){
	$("nav").css("transition","margin 0.5s 0.0s");

	$(".hamburger-menu").click(function(e){
		//alert('clicked');
		if($(".hamburger-menu").hasClass("opened")){
			$(".hamburger-menu").removeClass("opened"); 
			$("nav").css("transition-delay","0s").removeClass("opened");
			$("main").css("transition-delay","0.1s").removeClass("opened");
		} else {
			$(".hamburger-menu").addClass("opened");
			$("nav").css("transition-delay","0.1s").addClass("opened");
			$("main").css("transition-delay","0s").addClass("opened");
		}
	});
	$(".item-description-expand").click(function(e){
		if($(".item-description-expand").hasClass("opened")){
			$(".item-description-expand").removeClass("opened");
			$(".item-description .description").removeClass("description-expanded");
		} else {
			$(".item-description-expand").addClass("opened");
			$(".item-description .description").addClass("description-expanded");
		}
	});
	
});
