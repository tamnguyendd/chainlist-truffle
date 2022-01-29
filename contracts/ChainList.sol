pragma solidity ^0.4.18;

import "./Ownable.sol";

contract ChainList is Ownable{
    // custom types
    struct Article{
        uint id;
        address seller;
        address buyer;
        string name;
        string description;
        uint256 price;
    }

    // state variables
    //address owner;
    mapping (uint => Article) public articles;
    uint articleCounter;
    

    // events
    event LogSellArticle(uint indexed _id, address indexed _seller, string _name, uint256 _price);
    event LogBuyArticle(uint indexed _id, address indexed _seller, address _buyer, string _name, uint256 _price);

    // function ChainList() public{
    //     owner = msg.sender;
    // }

    // modifier onlyOwner(){
    //     require(msg.sender == owner);
    //     _; // not return value.
    // }

    // deactive the contract
    function kill() public onlyOwner{
        // only allow the contract ownder
        //require(msg.sender == owner); vi co onlyOwner roi

        selfdestruct(owner);
    }

    //sell an article
    function sellArticle(string _name, string _description, uint256 _price) public{
        // seller = msg.sender;
        // name = _name;
        // description = _description;
        // price = _price;

        // a new article
        articleCounter ++;
        articles[articleCounter] = Article(
            articleCounter,
            msg.sender,
            0x0,
            _name,
            _description,
            _price);

        LogSellArticle(articleCounter, msg.sender, _name, _price);
    }

    // //get an article
    // function getArticle() public view returns(
    //     address _seller, 
    //     address _buyer,
    //     string _name, 
    //     string _description, 
    //     uint256 _price){
    //         return (seller, buyer, name, description, price);
    // }

    // detecht the number of article in thecontract
    function getNumberOfArticles() public view returns(uint){
        return articleCounter;
    }

    // fetch and return all article Ids for articles still for sale
    function getArticleForSale() public view returns(uint[]){
        // prepare output array
        uint[] memory articleIds = new uint[](articleCounter);

        uint numberOfArticlesForSale = 0;

        for(uint i = 1; i <= articleCounter; i++){
            // keep 
            if(articles[i].buyer == 0x0){
                articleIds[numberOfArticlesForSale] = articles[i].id;
                numberOfArticlesForSale++;
            }
        }

        // copy the articlesids array into a smaller forsale array
        uint[] memory forSale = new  uint[](numberOfArticlesForSale);

        for(uint j = 0; j < numberOfArticlesForSale; j++){
            forSale[j] = articleIds[j];
        }

        return forSale;
    }

    // buy an article
    function buyArticle(uint _id) payable public{
        // check there is an article
        require(articleCounter > 0);

        // check tha the article exists
        require(_id > 0  && _id <= articleCounter);

        // retrive article
        Article storage article = articles[_id];

        // we check wherther there is an article for sale
        //require(seller != 0x0);

        // we check that the article has not been sold yet
        require(article.buyer == 0x0);

        //we dont allow the seller to buy his own article
        require(msg.sender != article.seller);

        // check that the value sent correcspnd to the price of the article
        require(msg.value == article.price);

        // keep buyer information
        article.buyer = msg.sender;

        // the buyer can pay the seller
        article.seller.transfer(msg.value);        

        //trigger the event
        LogBuyArticle(_id, article.seller, article.buyer, article.name, article.price);
    }
}