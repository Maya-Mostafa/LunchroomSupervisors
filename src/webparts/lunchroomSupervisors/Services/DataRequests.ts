import { WebPartContext } from "@microsoft/sp-webpart-base";
import {SPHttpClient, ISPHttpClientOptions} from "@microsoft/sp-http";
import { AllocationDataType } from "./Types";
import { IDropdownOption } from "office-ui-fabric-react";
import { AadHttpClient } from '@microsoft/sp-http';

/* Utility Functions */
export const objToMap = (arrObjs: any, key: string) => {
  return arrObjs.reduce((map: any, obj: any) => (map[obj[key]] = obj, map), {});
};

/* Employees Information */
export const getEmpPicture = (email: string) => {
  return `https://pdsb1.sharepoint.com/_layouts/15/userphoto.aspx?size=S&username=${email}`
};
export const getEmpProfile = (email: string) => {
  return `https://can.delve.office.com/?p=${email}`
};
export const getEmpInfo = async (context: WebPartContext, email: string) => {

  const responseUrl = `https://pdsb1.sharepoint.com/sites/contentTypeHub/_api/web/lists/GetByTitle('Employees')/items?$filter=MMHubBoardEmail eq '${email}'`;

  try{
    const response = await context.spHttpClient.get(responseUrl, SPHttpClient.configurations.v1);
    if (response.ok){
      const results = await response.json();
      console.log("getEmpInfo results", results);
      if(results){
        return results.value;
      }
    }
  }catch(error){
    console.log("getEmpInfo fnc Error");
  }
};
export const getEmpsInfoQuery = async (context: WebPartContext, query: string) => {
  const responseUrl = `https://pdsb1.sharepoint.com/sites/contentTypeHub/_api/web/lists/GetByTitle('Employees')/items?$filter=${query}`;
    try{
      const response = await context.spHttpClient.get(responseUrl, SPHttpClient.configurations.v1);
      if (response.ok){
        const results = await response.json();
        if(results){
          return results.value;
        }
      }
    }catch(error){
      console.log("getEmpsInfoQuery fnc Error");
    }
};

/* Locations */
export const getAllLocations = async (context: WebPartContext) : Promise <IDropdownOption[]> => {
  const responseUrl : string = `https://pdsb1.sharepoint.com/sites/contentTypeHub/_api/web/Lists/GetByTitle('schools')/items?$top=400&$orderBy=School_x0020_Name`; 
  const response = await context.spHttpClient.get(responseUrl, SPHttpClient.configurations.v1);

  if(response.ok){
      const results = await response.json();
      return results.value.map((school: any) => {
          return {
              key: school.School_x0020_Location_x0020_Code, 
              text: `${school.School_x0020_Name} (${school.School_x0020_Location_x0020_Code})`
          }
      });
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
export const getMyLocsDpd = async (context: WebPartContext, testingEmail?: string) =>{
    const currUserEmail = testingEmail ? testingEmail : context.pageContext.user.email;
    const myLocsNos = await getMyLocations(context, currUserEmail).then(r=>r);
    const myLocsDpd = [];

    for(const myLocNo of myLocsNos){
        const myLocDpd = await getMyLocationsInfo(context, myLocNo);//.then(r=>r);
        myLocsDpd.push(myLocDpd);
    }

    return Promise.all(myLocsDpd);
};

/* CRC */
export const getCRCYear = () =>{
  const 
        dt = new Date(),
        currentYear = dt.getFullYear(),
        currentMonth = dt.getMonth();
    let CRCYr;

    if (currentMonth < 3) CRCYr = currentYear - 1;
    else CRCYr = currentYear;

    return CRCYr;
};
export const getCRCStatus = async (context: WebPartContext, empId: string, CRCYr: number) => {
    const responseUrl = `https://pdsbserviceapi.azurewebsites.net/api/wcf/GetCourseStatus?EmpId=${empId}&CourseName=OD${CRCYr}`;
    const apiId : string = "eb994916-2c73-4bc6-b4bd-c945f62eac26";
    
    const aadHttpClient = await context.aadHttpClientFactory.getClient(apiId);
    const response = await aadHttpClient.get(responseUrl, AadHttpClient.configurations.v1);
    const results = await response.json();
    return results.odStatus;
};

/* Supervisors Info */
export const getSupervisors = async (context:WebPartContext, locNo: string) => {

  const responseUrl = `https://pdsbserviceapi.azurewebsites.net/api/wcf/GetLunchRoomSupByLocation?LocationId=${locNo}`;
  const apiId : string = "eb994916-2c73-4bc6-b4bd-c945f62eac26";
  
  const aadHttpClient = await context.aadHttpClientFactory.getClient(apiId);
  const response = await aadHttpClient.get(responseUrl, AadHttpClient.configurations.v1);
  const results = await response.json();
  return results;
};
export const getSupervisorsInfo = async (context: WebPartContext, locNo: string) => {

  const supersPNos = await getSupervisors(context, locNo);

  if (supersPNos){
    const pNumsArr = JSON.parse(supersPNos).map((item: any) => item.P_NUMBER.replace('P','00'));
    
    let query = '';
    for (let i = 0; i < pNumsArr.length; i++){
      query += `MMHubEmployeeNo eq '${pNumsArr[i]}'`;
      if (i !== pNumsArr.length -1) query += ' or ';
    }
    
    const empInfoResults = await getEmpsInfoQuery(context, query);
    return empInfoResults;
  }
  return [];
};

/* Allocations Info */
export const getEmpAllocations = async (context: WebPartContext, locId: string, formType: string) => {
    //formType: Current, Transferring
    const responseUrl = `https://pdsb1.sharepoint.com/hr/business/apppackages/_api/web/lists/GetByTitle('LunchroomApplication')/items?$filter=FormType eq '${formType}' and SchoolLocationCode eq '${locId}'`;

    try{
        const response = await context.spHttpClient.get(responseUrl, SPHttpClient.configurations.v1);
        if (response.ok){
          const results = await response.json();
          if(results){
            return results.value;
            // return objToMap(results.value, 'Title');
          }
        }
      }catch(error){
        console.log("userAllocations fnc Error");
      }
}; 
export const getAllocationCount = (arr: any) => {
  let regCount = 0, earlyCount = 0, supplyCount = 0, needsCount = 0;
  for (const item of arr){
    if (item.ApplicationType.includes("RegularClasses")) regCount +=1;
    if (item.ApplicationType.includes("EarlyLearningPlan")) earlyCount +=1;
    if (item.ApplicationType.includes("Supply")) supplyCount +=1;
    if (item.ApplicationType.includes("SpecialNeeds")) needsCount +=1;
  }
  return {regCount, earlyCount, supplyCount, needsCount};
}
export const createAllocation = async (context: WebPartContext, allocationData : AllocationDataType, formType: string) => {
  // for create allocation (formType: Current) or add and employee (formType: Transferring)

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
export const sentOn = (modDate: Date) => {
  const months = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "June", "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];
  return  months[modDate.getMonth()] + ' ' + modDate.getDate();
};
export const isSendingValid = (choices: any, years: any) => {
  if (choices && years){
    let isChoicesValid = false, isYearsValid = false;
    for (const choice of choices){
      if (choice.checked){
        isChoicesValid = true;
        break;
      }
    }
    for (const year of years){
      if (year.checked){
        isYearsValid = true;
        break;
      }
    }
    return isChoicesValid && isYearsValid;
  }
  return false;
};

export const searchEmp = () => {
    return;
};






