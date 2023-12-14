import { WebPartContext } from "@microsoft/sp-webpart-base";
import {SPHttpClient, ISPHttpClientOptions} from "@microsoft/sp-http";
import { AllocationDataType } from "./Types";

export const getEmpInfo = async (context: WebPartContext, empNo: string) => {

  const responseUrl = `https://pdsb1.sharepoint.com/sites/contentTypeHub/_api/web/lists/GetByTitle('Employees')/items?$filter=MMHubEmployeeNo eq ${empNo}`;

  try{
    const response = await context.spHttpClient.get(responseUrl, SPHttpClient.configurations.v1);
    if (response.ok){
      const results = await response.json();
      if(results){
        return results;
      }
    }
  }catch(error){
    console.log("getEmpInfo fnc Error");
  }
};

export const getEmpPicture = (email: string) => {
    return `https://pdsb1.sharepoint.com/_layouts/15/userphoto.aspx?size=S&username=${email}`
};

export const getEmpProfile = (email: string) => {
    return `https://can.delve.office.com/?p=${email}`
};

export const getCRCStatus = async (empId: string) => {
    const 
        dt = new Date(),
        currentYear = dt.getFullYear(),
        currentMonth = dt.getMonth();
    let CRCYr;

    if (currentMonth < 3) CRCYr = currentYear - 1;
    else CRCYr = currentYear;

    const responseUrl = `https://pdsbserviceapi.azurewebsites.net/api/wcf/GetCourseStatus?EmpId=${empId}&CourseName=OD${CRCYr}`;
    try{
        const response = await fetch(responseUrl);
        if (response.ok){
          const results = await response.json();
          if(results){
            return results;
          }
        }
      }catch(error){
        console.log("getCRCStatus fnc Error");
      }
};

export const getSupervisors = async (locNo: string) => {
    const responseUrl = `https://pdsbserviceapi.azurewebsites.net/api/wcf/GetLunchRoomSupByLocation?LocationId=${locNo}`;
    try{
        const response = await fetch(responseUrl);
        if (response.ok){
          const results = await response.json();
          if(results){
            return results;
          }
        }
      }catch(error){
        console.log("getAllocations fnc Error");
      }
};

export const userAllocations = async (context: WebPartContext, locId: string, formType: string) => {
    //formType: Current, Transferring
    const responseUrl = `https://pdsb1.sharepoint.com/hr/business/apppackages/_api/web/lists/GetByTitle('LunchroomApplication')/items?$filter=FormType eq '${formType}' and SchoolLocationCode eq '${locId}')`;

    try{
        const response = await context.spHttpClient.get(responseUrl, SPHttpClient.configurations.v1);
        if (response.ok){
          const results = await response.json();
          if(results){
            return results;
          }
        }
      }catch(error){
        console.log("userAllocations fnc Error");
      }
}; 

const getMyLocationsInfo = async (context: WebPartContext, locNum: string) =>{
    const   restUrl = `/sites/contentTypeHub/_api/web/Lists/GetByTitle('schools')/items?$select=Title,School_x0020_My_x0020_School_x00,School_x0020_Name&$filter=Title eq '${locNum}'`,
            _data = await context.spHttpClient.get(restUrl, SPHttpClient.configurations.v1);
    let locInfo = {};
    
    if(_data.ok){
        const result = await _data.json();
        locInfo = {key: result.value[0].Title, text: `${result.value[0].School_x0020_Name} (${result.value[0].Title})` };
    }
    return locInfo;
};
const getMyLocations = async (context: WebPartContext, testingEmail: string) =>{
    const currUserEmail = testingEmail;
    const restUrl = `/sites/contentTypeHub/_api/web/Lists/GetByTitle('Employees')/items?$filter=MMHubBoardEmail eq '${currUserEmail}'&$select=MMHubLocationNos`;
  
    let myLocsNum : [] = [];
    const myLocs = await context.spHttpClient.get(restUrl, SPHttpClient.configurations.v1).then(response => response.json());
    myLocsNum = myLocs.value[0].MMHubLocationNos.split(";");
  
    return myLocsNum.filter(loc => loc !== '0089');
    //return myLocsNum;
};
export const getMyLocsDpd = async (context: WebPartContext, testingEmail: string) =>{
    const currUserEmail = testingEmail ? testingEmail : context.pageContext.user.email;
    const myLocsNos = await getMyLocations(context, currUserEmail).then(r=>r);
    const myLocsDpd = [];

    for(const myLocNo of myLocsNos){
        const myLocDpd = await getMyLocationsInfo(context, myLocNo);//.then(r=>r);
        myLocsDpd.push(myLocDpd);
    }

    return Promise.all(myLocsDpd);
};

// for create allocation (formType: Current) or add and employee (formType: Transferring)
export const createAllocation = async (context: WebPartContext, allocationData : AllocationDataType, formType: string) => {
    const responseUrl = `https://pdsb1.sharepoint.com/hr/business/apppackages/_api/web/lists/GetByTitle('LunchroomApplication')/items`;

    const body: string = JSON.stringify({
        ApplicationType: {
            __metadata: {
                type: "Collection(Edm.String)"
            },
            results: allocationData.ApplicationType
        },
        ApplicationType1: allocationData.ApplicationType1, 
        ApplicationType2: allocationData.ApplicationType2, 
        ApplicationType3: allocationData.ApplicationType3,
        EmailSent: allocationData.EmailSent,
        FirstName: allocationData.FirstName,
        FormType: formType,
        LastName: allocationData.LastName,
        JobTitle: allocationData.JobTitle, 
        MMHubEmployeeName: allocationData.MMHubEmployeeName,
        MMHubEmployeeNo: allocationData.MMHubEmployeeNo,
        SchoolLocationCode: allocationData.SchoolLocationCode,
        SchoolName: allocationData.SchoolName,
        SelectedSchoolYear: allocationData.SelectedSchoolYear,
        Title: allocationData.Title
    });
    const spOptions: ISPHttpClientOptions = {
        headers:{
            Accept: "application/json;odata=nometadata", 
            "Content-Type": "application/json;odata=nometadata",
            "odata-version": ""
        },
        body: body
    };
    const _data = await context.spHttpClient.post(responseUrl, SPHttpClient.configurations.v1, spOptions);
    if(_data.ok){
        console.log('New Allocation is added!');
    }
};

export const updateAllocation = async (context: WebPartContext, allocationData : AllocationDataType) => {
    const responseUrl = `https://pdsb1.sharepoint.com/hr/business/apppackages/_api/web/lists/GetByTitle('LunchroomApplication')/items`;

    const body: string = JSON.stringify({
        ApplicationType: {
            __metadata: {
                type: "Collection(Edm.String)"
            },
            results: allocationData.ApplicationType
        },
        ApplicationType1: allocationData.ApplicationType1, 
        ApplicationType2: allocationData.ApplicationType2, 
        ApplicationType3: allocationData.ApplicationType3,
        EmailSent: allocationData.EmailSent,
        JobTitle: allocationData.JobTitle, 
        SelectedSchoolYear: allocationData.SelectedSchoolYear,
    });
    const spOptions: ISPHttpClientOptions = {
        headers:{
            Accept: "application/json;odata=nometadata", 
            "Content-Type": "application/json;odata=nometadata",
            "odata-version": "",
            "IF-MATCH": "*",
            "X-HTTP-Method": "MERGE",    
        },
        body: body
    };
    const _data = await context.spHttpClient.post(responseUrl, SPHttpClient.configurations.v1, spOptions);
    if(_data.ok){
        console.log('Allocation is updated!');
    }
};

export const searchEmp = () => {
    return;
};