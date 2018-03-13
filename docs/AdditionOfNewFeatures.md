# Anna
---
### ADDITION OF NEW FEATURES 
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/Anna-Assistant/Anna/issues) 

To every new feature added in the Anna-Chrome Extension, first it must be declared as an **INTENT** in the corrosponding API agent. The `background.js` contains the main code and acts as a platform to addition of new features.

**TO ASSIGN ANNA A NEW FEATURE**  
To assign **_ANNA_** a new feature is pretty simple! :smiley:   
Once you open the `background.js` file you will find under _tasks()_ function the similar kind of _else if_ statements are used. You may think of this as a code snippet.  

> }else if (data.result.metadata.intentName === "INTENT_NAME") {  
> action to be performed.

The usage of `else if` statement is for obvious reasons, it checks for the Intent by it's name and accordingly performs the operation. Remember to submit a pull-request or comment on the open issue of feature addition in order for the corresponding API agent that parses the speech to be modified to include your intent (that goes in tasks), otherwise it will fail. Preferably before you start working on it, so that you can test before you submit a pull request!

#### NAMING CONVENTION
We all love consistency in the code. In order to tweak code or modify we ensure that we should not get confused by the thousands of lines of code, therefore we use a particular naming convention. We are proud to say that we too follow a particular naming convention with proper indentation of code so that a new contributor does not get confused with the flow of the code amd can easily contribute to the project.

 * **VARIABLES**  
   
   For variables we love to use "inner caps" for Multiple-Word Names.  
   For instance,look below at the code extracts taken from `background.js`.  
   
   > var byteString;  
   >var baseUrl = "https://api.api.ai/v1/";  
   >var targetId = null;  
   
   _The variable name should be relevent with the type of action to which that variable is used for._  
   
 * **FUNCTIONS**  
   
   For naming functions we too opt with the "inner caps" method for Multiple-Word Names.  
   For reducing the number of lines of code we love to put the starting parenthesis at the end of every function name only when the body of function is to be wriiten.   
   For example, look below at the code extracts taken from _background.js_.  
   
   >function takeScreenshot() {  
   >function processIt(data) {    
   
    _The function name should be relevent with the type of operation it is to be performed._  
                          
#### Followings steps can be taken into consideration for the ADDITION OF NEW FEATURE

* Think of something creatively that can be added as a feature.
* Create the corrosponding INTENT in the API.
* Tweak the code and assign the desired chrome operation to it.
* Follow the same convention as stated above for naming functions and variables in order to maintain uniformity in the code.
* Allot the permission in _manifest.json_ file,if the Chrome operation needs any permission.
* You are done.:+1:

## CONTRIBUTING  

If you wish to help, develop and contribute to **ANNA** follow up the below given guidelines-

### Getting started
Before you get started, make sure you have:

  * [Installed](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
  and [Configured](https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup)
  Git on your local machine

  * Registered with a [GitHub account.](https://github.com/signup/free)
  
### Exploring 

Fork the [Anna repository](https://github.com/Anna-Assistant/Anna) on your GitHub Account and check out the [issues](https://github.com/Anna-Assistant/Anna/issues) section.  
Pick up any issue you want to contribute to and do comment it right there. Once, we will assign you with the issue that you picked up, pace up your strategy and get yourself ready to contribute. 
For any queries, do not hesitate to shoot them across our [zulip channel](https://anna.zulipchat.com/).

### Development
Once you are done with the issue; commit the changes and send a Pull Request to us.  
We love accepting Your Pull Requests. Once it paases the Codacy test and the Collaborator approves your Pull Request, you become the contributor of the Project.Contribute more, and become a part of ANNA.

### Opening an issue 
Encountered an issue or a bug in **ANNA**?  
Do you have suggestions for new features or improvements for **ANNA**?  
These are all great and valid reasons for opening an issue in our [GitHub issue  
tracker](https://github.com/Anna-Assistant/Anna/issues), where we maintain a list of issues about **ANNA** that need to be fixed. Do click on the ISSUE Option and raise a new issue.   
Please provide as much information and details as you can in your issue so we can address your issue properly.
 * If you're trying to report a bug, please describe the problem in depth with
  any accompanying screenshots or links as to where the bug occurred - the more
  information that is given, the better we can diagnose the problem and fix it.

   
**WE WOULD:heart:TO HEAR SOME INNOVATIVE FEATURES FROM YOU!!**


