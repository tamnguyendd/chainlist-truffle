var ChainList = artifacts.require("./ChainList.sol");


//test suite
contract("chainlist", function(accounts){
    var chainListInstance;
    var seller = accounts[1];
    var buyer = accounts[2];
    var articleName = "article 1";
    var articleDescription = "Description for a 1";
    var articlePrice = 10;

    // no article for sale yet
    it("should throw an exception if you try to buy an article when there is no article for sale", function(){
        return ChainList.deployed().then(function(instance){
            chainListInstance = instance;

            return chainListInstance.buyArticle({
                from: buyer,
                value: web3.toWei(articlePrice, "ether")
            });            
        }).then(assert.fail)
        .catch(function(error){
            assert(true);
        }).then(function(){
            return chainListInstance.getArticle();
        }).then(function(data){
            assert.equal(data[0], 0x0, "seller must be empty");
            assert.equal(data[1], 0x0, "buyer must be empty");
            assert.equal(data[2], "", "name must be empty");
            assert.equal(data[3], "", "description must be empty");
            assert.equal(data[4].toNumber(), 0, "price must be zero");
        });
    });

    // buying an article you are selling
    it("should thrwo an exception if you try to buy your own article", function(){
        return ChainList.deployed().then(function(instance){
            chainListInstance = instance;
            return chainListInstance.sellArticle(articleName, articleDescription, web3.toWei(articlePrice, "ether"), { from:seller});

        }).then(function(receipt){
            return chainListInstance.buyArticle({from: seller, value: web3.toWei(articlePrice, "ether")});
        }).then(assert.fail)
        .catch(function(error){
            assert(true);
        }).then(function(){
            return chainListInstance.getArticle()
        })
        .then(function(data){
            assert.equal(data[0], seller, "seller must be empty");
            assert.equal(data[1], 0x0, "buyer must be empty");
            assert.equal(data[2], articleName, "name must be empty");
            assert.equal(data[3], articleDescription, "description must be empty");
            assert.equal(data[4].toNumber(), web3.toWei(articlePrice, "ether"), "price must be zero");
        });
    });
});