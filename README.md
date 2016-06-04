# Cloud_Lending_Borrower_Portal
Borrower portal using Cloud Lending API

Programming Assignment notes: Prerequisites:
Any one accessing the borrower portal should be logged in to salesforce developers console with following credentials,
• Username: *****
• Password: *****

Frontend:
Access https://cloud-lending-test-dev-ed--c.na22.visual.force.com/apex/userLoginPage and you will be redirected to the home page of the application.


   Let’s start with the application flow:
Login into borrower portal with following credentials,
• Username: *****
• Password: *****
It takes little bit of time,
Reasons:
• My server is hosted in AWS with free tier eligible config thus it isn’t great with response
time.
Wait is indicated with wait cursor.
Will be redirected to loan page,
  I wrote server in node.js, will share more details about it soon.
Loan names are clickable, once clicked you’ll be redirected to another view
  Thus once clicked you will see this page,
This may take little bit of time as,
• Its another API call to get Individual loan details.
• Lot of java script process is running behind this page.
 
These are individual loan details which is a collapsible list.
 Once loan detail is clicked, corresponding details will be viewed right beneath its name.
 
Backend:
User login endpoint:
https://c8391123.ngrok.io/clBorrower/:username/:password
example: https://c8391123.ngrok.io/clBorrower/example@demo.com/<password>
Individual loan endpoint: https://c8391123.ngrok.io/clBorrower/:loanNumber
example:
https://c8391123.ngrok.io/clBorrower/<loan number>
