"use strict";

PDSB = window.PDSB || {}; 
PDSB.ADAL = window.PDSB.ADAL || {}; 
PDSB.api = window.PDSB.api || {}; 
PDSB.ADAL.config = {
	clientId: "5eea9d29-42fd-43a7-a50e-6267cdc14d14", //ClientApp
	redirectUri: window.location.href,
	navigateToLoginRequestUrl: false
}; 
//Create the autentication context 
PDSB.ADAL.authContext = new AuthenticationContext(PDSB.ADAL.config); 
PDSB.api = { 
	authAPI: "api://eb994916-2c73-4bc6-b4bd-c945f62eac26", //SecuredWsApp
	
	main: function() {
		
		var isCallback = PDSB.ADAL.authContext.isCallback(window.location.hash);
		PDSB.ADAL.authContext.handleWindowCallback();

		if (isCallback && !PDSB.ADAL.authContext.getLoginError()) {
			window.location = PDSB.ADAL.authContext._getItem(PDSB.ADAL.authContext.CONSTANTS.STORAGE.LOGIN_REQUEST);
		}

		// If logged in, get access token and make an API request
		var user = PDSB.ADAL.authContext.getCachedUser();
		if (user) {
			console.log(user.userName);
		} else {
			PDSB.ADAL.authContext.login();
			return;
		}
	}
}
$(function(){
	PDSB.api.main();
})

define(["jquery"], function($) {

    //Automating the CRC year value----
    var dt = new Date(),
        currentYear = dt.getFullYear(),
        currentMonth = dt.getMonth(),
        CRCYr;

    if (currentMonth < 3)
        CRCYr = currentYear - 1;
    else
        CRCYr = currentYear;

    var boxCurrYr = CRCYr,
        boxCurrYrShort = boxCurrYr.toString().substring(2,4),
        boxNextYr = CRCYr +1,
        boxNextYrShort = boxNextYr.toString().substring(2,4),
        boxPrevYr = CRCYr -1,
        boxPrevYrShort = boxPrevYr.toString().substring(2,4);

    //---------------------------------

    var t = "#LRA__",
        e = {
            fetchRequest: "fetch-request",
            ODStatusFetchRequest: "od-status-fetch-request",
            profileFetchRequest: "profile-fetch-request",
            valid: "valid",
            invalid: "invalid",
            resign: "Resign",
            immutable: "immutable"
        },
        a = {
            year: "2019",
            site: "/hr/business/apppackages",
            list: "LunchroomApplication",
            listTrim: function() {
                return a.list.replace(/\s/g, "")
            },
            listAllocation: "Lunchroom Staff Allocation",
            user: {}
        },
        n = {
            occupancy: [{
                threshold: 0,
                label: ""
            }, {
                threshold: .8,
                label: "high"
            }, {
                threshold: 1,
                label: "full"
            }]
        },
        l = {
            enable: !1,
            liveUpdate: !1,
            liveUpdater: null,
            liveUpdaterInterval: 5e3,
            liveUpdaterSince: new Date
        },
        i = "",
        s = "ID,MMHubEmployeeNo,ApplicationType,Modified,SelectedSchoolYear",
        o = {
            current: function(t) {
                return i + ("https://pdsbserviceapi.azurewebsites.net/api/wcf/GetLunchRoomSupByLocation?LocationId=") + t;
            },
            transferring: function(t) {
                return i + (a.site + "/_api/web/lists/GetByTitle('") + a.list + "')/items?$filter=FormType eq 'Transferring' and SchoolLocationCode eq '" + t + "'&$select=" + s 
            },
            existing: function(t) {
                var e = l.liveUpdaterSince.toISOString();
                return l.liveUpdaterSince = new Date, i + (a.site + "/_api/web/lists/GetByTitle('") + a.list + "')/items?$filter=Modified ge datetime'" + e + "' and SchoolLocationCode eq '" + t + "'&$select=" + s 
            },
            existingCurrent: function(t) {
                return i + (a.site + "/_api/web/lists/GetByTitle('") + a.list + "')/items?$filter=FormType eq 'Current' and SchoolLocationCode eq '" + t + "'&$select=" + s 
            },
            userProfile: function(t) {
                return "/sites/contentTypeHub/_api/web/lists/GetByTitle('Employees')/items?$select=MMHubEmployeeNo,FullName,MMHubBoardEmail,MMHubJobTitle,MMHubLocationNos,FirstName,LastName&$filter=MMHubEmployeeNo eq '00" + t.substring(1) + "'";
                //return "/_api/SP.UserProfiles.PeopleManager/GetPropertiesFor(accountName=@v)?@v='ad1\\" + t + "'&$select=AccountName,DisplayName,Email,PictureUrl,Title,pdsbMyDepartmentNos"
            },
            userODStatus: function(t) {
                return "https://pdsbserviceapi.azurewebsites.net/api/wcf/GetCourseStatus?EmpId=" + t + "&CourseName=OD" + CRCYr  //passing the automated CRC year instead of the hard coded value
            },
            userSearch: function(t) {
                //return t = t.replace(/\s+/g, "* "), "/_api/search/query?querytext='" + ($("#LRA__User-OVERRIDE").prop("checked") ? "" : "pdsbMyPOSGroups:71 AND ") + "(WorkEmail:" + t + "* OR AccountName:" + t + "*)'&rowlimit=6&sourceid='B09A7990-05EA-4AF9-81EF-EDFAB16C4E31'"
                return t = t.replace(/\s+/g, "* "), "/sites/contentTypeHub/_api/search/query?querytext='" + ($("#LRA__User-OVERRIDE").prop("checked") ? "" : "MMHubEmployeeGroupOWSTEXT:71 AND ") + "(MMHubBoardEmailOWSTEXT:" + t + "* OR EmpNumber:00" + t.substring(1) + "*)'&rowlimit=15&sourceid='3c66e799-a68a-4884-a271-c119cfbaeba1'&selectproperties='RefinableString107,RefinableString106,MMHubBoardEmailOWSTEXT,EmpNumber,JobTitle'"
            },
            newListItem: i + (a.site + "/_api/web/lists/GetByTitle('") + a.list + "')/items",
            updateListItem: function(t) {
                return o.newListItem + "(" + t + ")"
            },
            schools: function(t) {
                //return "/_api/web/lists/getByTitle('schools')/items" + t
                return "/sites/contentTypeHub/_api/web/lists/getByTitle('schools')/items" + t
            },
            allocation: function(t) {
                //return i + (a.site + "/_api/web/lists/GetByTitle('") + a.listAllocation + "')/items?$filter=SchoolNames_x003a_School_x0020_L eq '" + t + "'&$top=1&$select=AllocationST,AllocationELP,AllocationSup,AllocationBF,AllocationSP"
                return i + (a.site + "/_api/search/query?sourceid='108bcab4-f684-4edf-804e-29303c6cc4d4'&selectproperties='AllocationST,AllocationELP,AllocationBF,AllocationSup,AllocationSP,SchoolLocCodesLkUp,SchoolNamesLkUp'&RowLimit=1&querytext='SchoolLocCodesLkUp:"+t+"'");
                //https://pdsb1.sharepoint.com/hr/business/apppackages/_api/search/query?sourceid='108bcab4-f684-4edf-804e-29303c6cc4d4'&selectproperties='AllocationST,AllocationELP,AllocationBF,AllocationSup,AllocationSP,SchoolLocCodesLkUp,SchoolNamesLkUp'&RowLimit=1&querytext='SchoolLocCodesLkUp:1478'
            }
        },
        r = {
            locationDropdown: function(t, e) {
                return '<option value="' + t + '">' + e + "</option>"
            },
            profileAvatar: function(t) {
                return '<div class="LRA__Result__Profile__Avatar" style=\'background-image: url("' + t + "\");''></div>"
            },
            profileODStatus: function(t) {
                return '<div class="LRA__Result__Profile__Status ' + t + '"></div>'
            },
            profile: function(t) {
                return '<div class="LRA__Result__Profile">\n\t\t\t\t\t<div class="LRA__Result__Profile__Name">' + t + '</div>\n\t\t\t\t\t<div class="LRA__Result__Profile__Title">Retrieving...</div>\n\t\t\t\t</div>'
            },
            types: function(t) {
                return '<fieldset class="fieldsetApp">\n\t\t\t\t\t<legend>Returning Type</legend>\n\t\t\t\t\t<input type="checkbox" name="' + t + '__Type" id="' + t + '__Type-ST" value="RegularClasses" >\n\t\t\t\t\t<label for="' + t + '__Type-ST"><span>Regular Classes</span></label>\n\t\t\t\t\t<input type="checkbox" name="' + t + '__Type" id="' + t + '__Type-ELP" value="EarlyLearningPlan" >\n\t\t\t\t\t<label for="' + t + '__Type-ELP"><span>Early Learning Plan</span></label>\n\t\t\t\t\t<input type="checkbox" name="' + t + '__Type" id="' + t + '__Type-Sup" value="Supply" >\n\t\t\t\t\t<label for="' + t + '__Type-Sup"><span>Supply</span></label>\n\t\t\t\t\t<input type="checkbox" name="' + t + '__Type" id="' + t + '__Type-SP" value="SpecialNeeds" >\n\t\t\t\t\t<label for="' + t + '__Type-SP"><span>Special Needs</span></label>\n\t\t\t\t\t<input type="checkbox" name="' + t + '__Type" id="' + t + '__Type-NR" value="NotReturning" >\n\t\t\t\t\t<label for="' + t + '__Type-NR"><span>Not Returning</span></label>\n\t\t\t\t\t<input type="checkbox" name="' + t + '__Type" id="' + t + '__Type-Rs" value="Resign" >\n\t\t\t\t\t<label for="' + t + '__Type-Rs" class="tooltip-bottom" data-title="Permanent Decision"><span>Resign</span></label>\n\t\t\t\t</fieldset>'
            },
            email: function(t) {
                return '<div class="LRA__Send">\n\t\t\t\t\t<div class="message"></div>\n\t\t\t\t\t<button type="button" class="LRA__Send__Update">\n\t\t\t\t\t\t<span class="default">Update</span>\n\t\t\t\t\t\t<span class="active">Send</span>\n\t\t\t\t\t</button>\n\t\t\t\t\t<button type="button" class="LRA__Send__Send">\n\t\t\t\t\t\t<span class="pointerW"></span>\n\t\t\t\t\t\t<span class="default">Select</span>\n\t\t\t\t\t\t<span class="active">Send</span>\n\t\t\t\t\t</button>\n\t\t\t\t\t<a class="LRA__Send__ResignLetter" href="/hr/business/apppackages/Lists/' + a.listTrim() + "/DisplayLetter.aspx?id=" + t + '" target="_blank">\n\t\t\t\t\t\t<span class="default">View Letter</span>\n\t\t\t\t\t</a>\n\t\t\t\t</div>'
            },
            schoolYear : function(t){
                return '<fieldset class="fieldsetYr">\n\t\t\t\t\t<legend>School Year</legend>\n\t\t\t\t\t<input type="checkbox" name="' + t + '__CurrYr" id="' + t + '__CurrYr" value="CurrentYear" >\n\t\t\t\t\t<label for="' + t + '__CurrYr"><span>Current up to June ' + boxCurrYr+'</span></label>\n\t\t\t\t\t<input type="checkbox" name="' + t + '__NextYr" id="' + t + '__NextYr" value="NextYear" >\n\t\t\t\t\t<label for="' + t + '__NextYr"><span>Sept '+boxCurrYr+'- June '+boxNextYr+'</span></label>\n\t\t\t\t\t</fieldset>'
            },
            resultHeader: function() {
                var t = {
                    now: 0,
                    max: 0
                };
                return '<li class="LRA__ResultHeader fixedsticky">\n\t\t\t\t\t<div class="LRA__ResultHeader__1">\n\t\t\t\t\t\t<div>&nbsp;</div>\n\t\t\t\t\t\t<div>Employee Information</div>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class="LRA__ResultHeader__2">\n\t\t\t\t\t\t<div>Returning Choices and Staff Allocation</div>\n\t\t\t\t\t\t<ul>\n\t\t\t\t\t\t\t<li class="allocation" data-ref="AllocationST">\n\t\t\t\t\t\t\t\t<span class="now tooltip-bottom" data-title="Current Allocation for Regular Classes">0</span></li>\n\t\t\t\t\t\t\t<li class="allocation" data-ref="AllocationELP">\n\t\t\t\t\t\t\t\t<span class="now tooltip-bottom" data-title="Current Allocation for Early Learning Plan">0</span></span></li>\n\t\t\t\t\t\t\t<li class="allocation" data-ref="AllocationSup">\n\t\t\t\t\t\t\t\t<span class="now tooltip-bottom" data-title="Current Allocation for Supply">0</span></li>\n\t\t\t\t\t\t\t<li class="allocation" data-ref="AllocationSP">\n\t\t\t\t\t\t\t\t<span class="now tooltip-bottom" data-title="Current Allocation for Special Needs">0</span></li>\n\t\t\t\t\t\t</ul>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class="LRA__ResultHeader__5">\n\t\t\t\t\t\t<div>&nbsp;</div>\n\t\t\t\t\t\t<div>School Year</div>\n\t\t\t\t\t</div>\n\t\t\t\t<div class="LRA__ResultHeader__3">\n\t\t\t\t\t\t<div>&nbsp;</div>\n\t\t\t\t\t\t<div>Email</div>\n\t\t\t\t\t</div>\n\t\t\t\t</li>'
            },
            resultHeaderEmpty: function(t) {
                return '<li class="LRA__ResultHeader">(No employee results found' + (t || "") + ".)</li>"
            },
            resultHeaderAllocation: function(){ //newly added
                return '<li class="LRA__ResultHeader fixedsticky">\n\t\t\t\t\t<div class="LRA__ResultHeader__1">\n\t\t\t\t\t\t<div>&nbsp;</div>\n\t\t\t\t\t\t<div>Employee Information</div>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class="LRA__ResultHeader__2">\n\t\t\t\t\t\t<div>Returning Choices and Staff Allocation</div>\n\t\t\t\t\t\t<ul>\n\t\t\t\t\t\t\t<li class="allocation">\n\t\t\t\t\t\t\t\t<span class="now tooltip-bottom" data-title="Current Allocation for Regular Classes" id="allocRegClasses">0</span></li>\n\t\t\t\t\t\t\t<li class="allocation">\n\t\t\t\t\t\t\t\t<span class="now tooltip-bottom" data-title="Current Allocation for Early Learning Plan" id="allocEarlyLearn">0</span></span></li>\n\t\t\t\t\t\t\t<li class="allocation">\n\t\t\t\t\t\t\t\t<span class="now tooltip-bottom" data-title="Current Allocation for Supply" id="allocSupp">0</span></li>\n\t\t\t\t\t\t\t<li class="allocation">\n\t\t\t\t\t\t\t\t<span class="now tooltip-bottom" data-title="Current Allocation for Special Needs" id="allocSpNeeds">0</span></li>\n\t\t\t\t\t\t</ul>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class="LRA__ResultHeader__5">\n\t\t\t\t\t\t<div>&nbsp;</div>\n\t\t\t\t\t\t<div>School Year</div>\n\t\t\t\t\t</div>\n\t\t\t\t<div class="LRA__ResultHeader__3">\n\t\t\t\t\t\t<div>&nbsp;</div>\n\t\t\t\t\t\t<div>Email</div>\n\t\t\t\t\t</div>\n\t\t\t\t</li>'                
            },
            result: function(t, a, n) {
                var l = n ? 'data-id="' + n + '"' : "";
                return '<li class="LRA__Result ' + a + " " + e.ODStatusFetchRequest + " " + e.profileFetchRequest + '" data-pnum="' + t + '" ' + l + ">\n\t\t\t\t\t" + r.profile(t) + "\n\t\t\t\t\t" + r.types(t) + "\n\t\t\t\t\t" +  r.schoolYear(t) + "\n\t\t\t\t\t" + r.email(n) + "\n\t\t\t\t</li>"
            },
            resultNew: function(t) {
                return '<div class="LRA__Add__Dyn">\n\t\t\t\t\t' + r.types(t) + "\n\t\t\t\t\t" +  r.schoolYear(t) + "\n\t\t\t\t\t" + r.email() + "\n\t\t\t\t</div>"
            },
            resultDuplicate: function(t) {
                return '<div class="LRA__Add__Dyn">\n\t\t\t\t\t<fieldset class="LRA__ResultHeader__2">\n\t\t\t\t\t\t<a class="LRA__Validation__Exist" href="javascript:PDSB.UI.ScrollTo($(\'[data-pnum=' + t + "]:first').offset().top - 120);\">\n\t\t\t\t\t\t\t<strong>Existing Employee</strong>\n\t\t\t\t\t\t\t<span>The employee you are about to add already exists, click to navigate.</span>\n\t\t\t\t\t\t</a>\n\t\t\t\t\t</fieldset>\n\t\t\t\t</div>"
            },
            sentOn: function(t) {
                var e = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "June", "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];
                return 'Sent on <strong class="tooltip" data-title="' + t.toLocaleDateString() + " " + t.toLocaleTimeString() + '">\n\t\t\t\t\t\t\t' + e[t.getMonth()] + " " + t.getDate() + "\n\t\t\t\t\t\t</strong>"
            }
        };
    return {
        MAX_APPLICATION_TYPE: 3,
        isIE: !1,
        Location: t + "Location, " + t + "Location-OVERRIDE",
        Results_Current: t + "Results-Current",
        Results_Transferring: t + "Results-Transferring",
        Add: t + "Add",
        Add__Input: t + "Add__Input",
        Add__Submit: t + "Add__Submit",
        Add__Avatar: t + "Add__Avatar",
        Add__Title: t + "Add__Title",
        Add__Meta: t + "Add__Meta",
        Current: a,
        Allocation: n,
        Polling: l,
        Selector: e,
        Endpoint: o,
        jLoc: "",
        jPosition: "",
        jSection: ["3"],
        Template: r,
        CSS: {
            backgroundImage: function(t) {
                return 'url("' + t + '")'
            }
        },
        EasterEgg: {}
    }
    
    
});
//# sourceMappingURL=./Lunchroom.Config.js.map