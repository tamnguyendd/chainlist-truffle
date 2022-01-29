App = {
     web3Provider: null,
     contracts: {},
     account :0x0,
     loading: false,

     init: function() {
         return App.initWeb3();
     },

     initWeb3: function() {
          // initialize web3          
          if(typeof web3 !== 'undefined'){
               //reuse the provider of the Web3 object injected by Metamask
               App.web3Provider = web3.currentProvider;
          }else{
               // create a new provider and plug it directly into our local node
               App.web3Provider = new Web3.providers.HttpProvider('HTTP://localhost:7545');               
          }

          web3 = new Web3(App.web3Provider);

          App.displayAccountInfo();

          return App.initContract();
     },

     displayAccountInfo: function(){
          web3.eth.getCoinbase(function(err, account){
               if(err == null){
                    App.account = account;
                    $('#account').text(account);

                    web3.eth.getBalance(account, function(err, balance){
                         if(err === null){
                              $('#accountBalance').text(web3.fromWei(balance, "ether") + " ETH");
                         }
                    });
               }
          });
     },

     initContract: function() {
          //file ChainList.json co duong dan duoc config trong bs-config.json file
          $.getJSON('ChainList.json', function(chainListArtifact){
               //get the contract artifac file and use it to instantita a truffle contract abstract
               App.contracts.ChainList = TruffleContract(chainListArtifact);

               // set the provider for our contracts
               App.contracts.ChainList.setProvider(App.web3Provider);

               // listen to events
               App.listenToEvents();

               //retrive the article from the contract
               return App.reloadArticles();
          });
     },

     reloadArticles: function(){
          // avoid reenty
          if(App.loading){
               return;
          }
          App.loading = true;

          // refresh account information because the balance might have changed
          App.displayAccountInfo();

          var chainListInstance;

          //retrive the article placeholder and clear it
          //$('#articlesRow').empty();

          App.contracts.ChainList.deployed().then(function(instance){
               chainListInstance = instance;
               return chainListInstance.getArticleForSale(); // call contract method
          }).then(function(articleIds){
               // if(article[0] == 0x0){
               //      // no article
               //      return;
               // }

               $('#articlesRow').empty();

               for(var i = 0; i < articleIds.length; i++){
                    var articleId = articleIds[i];
                    chainListInstance.articles(articleId.toNumber()).then(function(article){
                         App.dispayArticle(article[0],article[1],article[3],article[4],article[5]);
                    });
               }
               App.loading = false;


               // var price = web3.fromWei(article[4], "ether");

               // //retrive the article template and fill it
               // var articleTemplate = $('#articleTemplate');
               // articleTemplate.find('.article-title').text(article[2]);
               // articleTemplate.find('.article-description').text(article[3]);
               // articleTemplate.find('.article-price').text(price);
               // articleTemplate.find('.btn-buy').attr("data-value", price);
               
               // var seller = article[0];
               // if(seller == App.account){
               //      seller = "You"; 
               // }               
               // articleTemplate.find('.article-seller').text(seller);

               // // buyer
               // var buyer = article[1];
               // if(buyer == App.account){
               //      buyer = "You";
               // }else if(buyer == 0x0){
               //      buyer = "No one yet";
               // }
               // articleTemplate.find(".article-buy").text(buyer);
               // if(article[0] == App.account || article[1] != 0x0){
               //      articleTemplate.find(".btn-buy").hide();
               // }else{
               //      articleTemplate.find(".btn-buy").show();
               // }

               // // 
               // $('#articlesRow').append(articleTemplate.html());

          }).catch(function(err){
               console.log(err.message);
               App.loading = false;
          });
     },

     dispayArticle: function(id, seller, name, description, price){
          var articlesRow = $('#articlesRow');

          var etherPrice = web3.fromWei(price, "ether");
           // //retrive the article template and fill it
          var articleTemplate = $('#articleTemplate');
          articleTemplate.find('.panel-title').text(name);          
          articleTemplate.find('.article-description').text(description);
          articleTemplate.find('.article-price').text(etherPrice + " ETH");
          articleTemplate.find('.btn-buy').attr("data-id", id);
          articleTemplate.find('.btn-buy').attr("data-value", etherPrice);

          //seller
          if(seller == App.account){
               articleTemplate.find('.article-seller').text("You");
               articleTemplate.find(".btn-buy").hide();
          }else{
               articleTemplate.find('.article-seller').text(seller);
               articleTemplate.find(".btn-buy").show();
          }
          
          // add to the list
          $('#articlesRow').append(articleTemplate.html());
     },

     sellArticle: function(){
          // retrive the details of the article
          var _article_name = $('#article_name').val();
          var _price = web3.toWei(parseFloat( $('#article_price').val() || 0), "ether");
          var _description = $('#article_description').val();

          if(_article_name.trim() == '' || _price == 0){
               //nothing to sell
               return;
          }

          App.contracts.ChainList.deployed().then(function(instance){
               return instance.sellArticle(_article_name, _description, _price, {
                    from: App.account,
                    gas: 500000
               });
          }).then(function(result){
               App.reloadArticles();
          }).catch(function(err){
               console.error(err);
          })
     },

     // listen to events triggered by the contract
     listenToEvents: function(){
          $('#events').empty();
          App.contracts.ChainList.deployed().then(function(instance){
               instance.LogSellArticle({}, {}).watch(function(error, event){
                    if(!error){
                         console.log(event.args._name);
                         $("#events").append('<li class="list-group-item">' + event.args._name + ' is now for sale </>');
                    }else{
                         console.error(error)
                    }

                    App.reloadArticles();
               });

               instance.LogBuyArticle({}, {}).watch(function(error, event){
                    if(!error){
                         console.log(event.args._name);
                         $("#events").append('<li class="list-group-item">' + event.args._buyer + ' bought ' + event.args._name +'</>');
                    }else{
                         console.error(error)
                    }

                    App.reloadArticles();
               });
          });
     },

     buyArticle: function(){
          event.preventDefault();

          //retrive the article price
          var _articleId = $(event.target).data('id');
          var _price = parseFloat($(event.target).data('value'));
          console.log(_price);

          App.contracts.ChainList.deployed().then(function(instance){
               return instance.buyArticle(_articleId, {
                    from: App.account,
                    value: web3.toWei(_price, "ether"),
                    gas: 500000
               })
          }).catch(function(err){
               console.log(err)
          })
     },
};

$(function() {
     $(window).load(function() {
          App.init();
     });
});
