var express = require('express');
var Client = require('node-rest-client').Client;

//Objects
var client = new Client();

var app = express();

//For retrieving Access token
var client_id="xxxxxx";
    client_secret="xxx";
    secret_token="xxx";
    borrower_id="xxx";
    access_token = "";
    token_type = "";

//globally allowing CORS
app.all('/clBorrower/:username/:password', function(req, res, next) {
  res.header('Access-Control-Allow-Origin','*');
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
      next();
     });

//endpoint for user login - retrieving access token, user profile & loan details
app.get('/clBorrower/:username/:password',function(req,res){
  var requestForAccessToken = "https://login.salesforce.com/services/oauth2/token?grant_type=password&client_id="+client_id+"&client_secret="+client_secret+"&username="+req.params.username+"&password="+req.params.password+secret_token;
  var args = {
    headers:{"content-Type": "application/x-www-form-urlencoded"}
  };
  //requesting access token
  client.post(requestForAccessToken, args, function(data,response) {
    accessTokenData=data;
    if(data.hasOwnProperty('access_token')) {
    console.log("AccessToken Data: "+JSON.stringify(data));
    accessToken=JSON.stringify(data.access_token);
    var authArgs = {
      headers: {"Authorization": accessTokenData['token_type']+" "+accessTokenData['access_token']}
    }
    //request for user profile
    var userDetails = client.get(accessTokenData.id,authArgs, function(data,response){
      userData=data;
      console.log("User Profile: "+JSON.stringify(data));
      // request for loan details
      var requestForLoanDetails = "https://na10.salesforce.com/services/apexrest/peer/v1/loanAccounts?borrowerId="+borrower_id;
      var loanDetails = client.get(requestForLoanDetails,authArgs,function(loanData,loanResponse){

        console.log("LoanDetails: " +JSON.stringify(data));

        var finalloan = {
          "status":"success",
          "loanDetails":breakdownLoanDetails(loanData),
          "userProfile":breakdownUserProfile(userData)
        };
        access_token = accessTokenData['access_token'];
        token_type = accessTokenData['token_type'];
        res.json(finalloan);

      });
    });
  }
  else {
    res.json({"status":"failure"});
  }
});
});

//endpoint for retreiving Individual loan details
app.get('/clBorrower/:loanNumber',function(req,res){
  res.header('Access-Control-Allow-Origin','*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  //access token
  var individualLoan = "https://na10.salesforce.com/services/apexrest/peer/v1/loanAccounts/getDetails/"+req.params.loanNumber;
  var authArgs = {
    headers: {"Authorization": accessTokenData['token_type']+" "+accessTokenData['access_token']}
  }
  var individualLoanDetails = client.get(individualLoan,authArgs, function(data,response){
    console.log("LoanDetails: " +JSON.stringify(data));

    res.json(breakdownCommonLoanDetails(data));
    //res.json(data);

  });

});


//processing json value for storing only required user profile details
function breakdownUserProfile(userData) {
  try {
  var returnJson = {
    "displayname" : userData.display_name,
    "picture" : userData.photos[0],
    "username" : userData.username,
    "email" : userData.email
  }
  return returnJson;
}
catch(err) {
  console.log("error at breakdownUserProfile: "+ err);
}
}

//processing json value for storing only required loan details
function breakdownLoanDetails(loanData) {
  try {
  var returnArray = [];
  var returnJson = {};
  for(var i=0;i<loanData.content.length;i++) {
    returnJson = {};
    returnJson['loanName'] = loanData.content[i].Name;
    returnJson['loan_id'] = loanData.content[i].Id;
    returnJson['purpose'] = loanData.content[i].loan__Loan_Purpose__r.Name;
    returnJson['status'] = loanData.content[i].loan__Loan_Status__c;
    returnArray.push(returnJson);
  }
  return returnArray;
}
catch(err) {
  console.log("error at breakdownLoanDetails: "+err);
}
}

//processing individual loan details for storing into json by removing unneccesary string values
function breakdownCommonLoanDetails(loanData) {
  try {
  var finalresult = {};
  var finalReturnJson = [];
      generalData = {};
      loanLoanPurpose = {};
      OnlyOneJSON = {};

  for(var prop in loanData.content[0]) {

    if(prop == "loan__Charges__r" || prop == "loan__Loan_Payment_Transactions__r" || prop == "loan__Other_Loan_Transactions__r" || prop == "loan__Repayment_Schedule__r" || prop == "loan__Repayment_Schedule_Summary__r") {
      //OnlyOneJSON[splitTheString(prop).trim()] = convertToJsonObj(loanData.content[0][prop]);
      OnlyOneJSON[prop] = convertToJsonObj(loanData.content[0][prop]);
    }
    else if(prop == "loan__Loan_Purpose__r") {
      var temp = [];
      temp.push(generalData);
      var temp1 = {};
      OnlyOneJSON["generalData"] = temp;
      temp = [];
      temp1 = {};
      for(key in loanData.content[0][prop]) {
        if(key != "attributes") {
          loanLoanPurpose[key] = loanData.content[0][prop][key];
        }
      }
      temp.push(loanLoanPurpose);
      OnlyOneJSON["loanLoanPurpose"] = temp;
    }
    else {
      if(prop != "attributes") {
        var splitString =  splitTheString(prop);
        generalData[splitString.trim()] = loanData.content[0][prop];
      }
    }
  }
  finalReturnJson.push(OnlyOneJSON);
  finalresult["result"] = finalReturnJson;
return finalresult;
}
catch(err) {
  console.log("error at breakdownCommonLoanDetails: " + err);
}
}

//To split key values (string) and save in the json variable
function splitTheString(inputVal) {
  try {
  var separators = ['_','__'];
  var splitString = inputVal.split(new RegExp(separators.join('|'), 'g'));

  //console.log("splitString: "+splitString);

  if(splitString[0] == "loan") {
    var keyVal = '';
    for(var i=1;i<splitString.length-1;i++) {
      //console.log("splitString[i]" + splitString[i]);
        if(splitString[i] != '') {
          keyVal += " " + splitString[i];
      }
    }
    console.log(keyVal);
    return keyVal;
  }
  else {
    console.log(inputVal);
    return inputVal;
  }
}
catch(err) {
  console.log("error at splitTheString: " + err);
}
}

//storing values into json variable
function convertToJsonObj(input) {
  var returnJson = [];
  try {
  for(var i=0;i<input.records.length;i++) {
    var innerJson = {};
    for(var prop in input.records[i]) {
      if(prop != "attributes") {
        var returnVal = splitTheString(prop);
        innerJson[returnVal.trim()] = input.records[i][prop];
      }
    }
    returnJson.push(innerJson);
  }
}
catch(err) {
  console.log("Error at convertToJsonObj: " + err);
}
  return returnJson;

}

app.listen(8235);
console.log('Server Started on 8235');
