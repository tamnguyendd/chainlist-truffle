var ChainList = artifacts.require("./ChainList.sol");

//test suite
contract('chainList', function(accounts){
    var chainListInstance;
    var seller = accounts[1];
    var buyer = accounts[2];
    var articleName = "article 1";
    var articleDescription = "Description for a 1";
    var articlePrice = 10;
    var sellerBalanceBeforeBuy, sellerBalanceAfterBuy;
    var buyerBalanceBeforeBuy, buyerBalanceAfterBuy;

    it("should be initialize with empty values", function(){
        return ChainList.deployed().then(function(instance){
            return instance.getArticle();
        }).then(function(data){
            //console.log("data[3]=", data[3]);
            assert.equal(data[0], 0x0, "seller must be empty");
            assert.equal(data[1], 0x0, "buyer must be empty");
            assert.equal(data[2], "", "name must be empty");
            assert.equal(data[3], "", "description must be empty");
            assert.equal(data[4].toNumber(), 0, "price must be zero");
        })
    });

    it("should sell an article", function(){
        return ChainList.deployed().then(function(instance){
            chainListInstance = instance;
            return chainListInstance.sellArticle(articleName, articleDescription,
                    web3.toWei(articlePrice, "ether"), {from: seller});
        }).then(function(){
            //promis after called sellArticle
            return chainListInstance.getArticle();
        }).then(function(data){
            //promis after called getArticle
            assert.equal(data[0], seller, "seller must be "+seller);
            assert.equal(data[1], 0x0, "buyer must be empty");
            assert.equal(data[2], articleName, "name must be " + articleName);
            assert.equal(data[3], articleDescription, "description must be " +articleDescription);
            assert.equal(data[4].toNumber(), web3.toWei(articlePrice, "ether"), "price must be " + web3.toWei(articlePrice, "ether"));
        });
    });

    it("shoule buy an article", function(){
        return ChainList.deployed().then(function(instance){
            chainListInstance = instance;
            //record balance of seller and buyer before buy
            sellerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
            buyerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();

            return chainListInstance.buyArticle({
                from: buyer,
                value: web3.toWei(articlePrice, "ether")
            });
        }).then(function(receipt){
            assert.equal(receipt.logs.length,1,"one event should have been triggerd");
            assert.equal(receipt.logs[0].event, "LogBuyArticle","event shoulbe LogBuyArticle");
            assert.equal(receipt.logs[0].args._seller, seller, "seller must be "+seller);
            assert.equal(receipt.logs[0].args._buyer, buyer, "buyer must be "+buyer);
            assert.equal(receipt.logs[0].args._name, articleName, "name must be " + articleName);
            assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice, "ether"), "price must be " + web3.toWei(articlePrice, "ether"));

            // record balance of buyer and seller after the buy
            sellerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
            buyerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();

            // check the effect of buy on balance of buyer and seller. accounting for gas
            assert(sellerBalanceAfterBuy == sellerBalanceBeforeBuy + articlePrice, "seller should have earned ");
            assert(buyerBalanceAfterBuy <= buyerBalanceBeforeBuy - articlePrice, "seller should have earned ");// <= vi buyer have payed some gas 

            return chainListInstance.getArticle();
            
        }).then(function(data){
            assert.equal(data[0], seller, "seller must be "+seller);
            assert.equal(data[1], buyer, "buyer must be " + buyer);
            assert.equal(data[2], articleName, "name must be " + articleName);
            assert.equal(data[3], articleDescription, "description must be " +articleDescription);
            assert.equal(data[4].toNumber(), web3.toWei(articlePrice, "ether"), "price must be " + web3.toWei(articlePrice, "ether"));
        });
    });

    it("should trigger an event when a new article is sole", function(){
        return ChainList.deployed().then(function(instance){
            chainListInstance = instance;
            return chainListInstance.sellArticle(articleName, articleDescription, web3.toWei(articlePrice, "ether"),
            {from: seller} );
        }).then(function(receipt){
            assert.equal(receipt.logs.length,1,"one event should have been triggerd");
            assert.equal(receipt.logs[0].event, "LogSellArticle","event shoulbe LogSellArticle");
            assert.equal(receipt.logs[0].args._seller, seller, "seller must be "+seller);
            assert.equal(receipt.logs[0].args._name, articleName, "name must be " + articleName);
            assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice, "ether"), "price must be " + web3.toWei(articlePrice, "ether"));

        })
    })
});
