import { WebPartContext } from "@microsoft/sp-webpart-base";
import {SPHttpClient, ISPHttpClientOptions} from "@microsoft/sp-http";
import { AllocationDataType } from "./Types";
import { IDropdownOption } from "office-ui-fabric-react";
import { AadHttpClient } from '@microsoft/sp-http';

const testSite = 'https://pdsb1.sharepoint.com/sites/Lunchroom';
//const liveSite = 'https://pdsb1.sharepoint.com/hr/business/apppackages';
const siteUrl = testSite;
const contentTypeHubSiteUrl = 'https://pdsb1.sharepoint.com/sites/contentTypeHub';

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

  const responseUrl = `${contentTypeHubSiteUrl}/_api/web/lists/GetByTitle('Employees')/items?$filter=MMHubBoardEmail eq '${email}'`;

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
  const responseUrl = `${contentTypeHubSiteUrl}/_api/web/lists/GetByTitle('Employees')/items?$filter=${query}`;
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
export const getEmpsGrpLunch = async (context: WebPartContext) => {

  const responseUrl = `${contentTypeHubSiteUrl}/_api/web/lists/GetByTitle('Employees')/items?$filter=substringof('71', MMHubEmployeeGroup)&$top=1000`;

  try{
    const response = await context.spHttpClient.get(responseUrl, SPHttpClient.configurations.v1);
    if (response.ok){
      const results = await response.json();
      console.log("getEmpsGrpLunch results", results);
      if(results){
        return results.value;
      }
    }
  }catch(error){
    console.log("getEmpsGrpLunch fnc Error");
  }
};

/* Locations */
export const getAllLocations = async (context: WebPartContext) : Promise <IDropdownOption[]> => {
  const responseUrl : string = `${contentTypeHubSiteUrl}/_api/web/Lists/GetByTitle('schools')/items?$top=400&$orderBy=School_x0020_Name`; 
  const response = await context.spHttpClient.get(responseUrl, SPHttpClient.configurations.v1);

  if(response.ok){
      const results = await response.json();
      const validLocs = results.value.filter((item:any) => item.School_x0020_Location_x0020_Code > 1000 && item.School_x0020_Location_x0020_Code < 3000)
      return validLocs.map((school: any) => {
        return {
            key: school.School_x0020_Location_x0020_Code, 
            text: `${school.School_x0020_Name} (${school.School_x0020_Location_x0020_Code})`,
            area: school.Area
        }
      });
  }

};
const getMyLocationsInfo = async (context: WebPartContext, locNum: string) =>{
    const   restUrl = `${contentTypeHubSiteUrl}/_api/web/Lists/GetByTitle('schools')/items?$select=Title,School_x0020_My_x0020_School_x00,School_x0020_Name&$filter=Title eq '${locNum}'`,
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
    const restUrl = `${contentTypeHubSiteUrl}/_api/web/Lists/GetByTitle('Employees')/items?$filter=MMHubBoardEmail eq '${currUserEmail}'&$select=MMHubLocationNos`;
  
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

/* Current Supervisors Info */
export const getSupervisors = async (context:WebPartContext, locNo: string) => {

  const responseUrl = `https://pdsbserviceapi.azurewebsites.net/api/wcf/GetLunchRoomSupByLocation?LocationId=${locNo}`;
  const apiId : string = "eb994916-2c73-4bc6-b4bd-c945f62eac26";
  
  const aadHttpClient = await context.aadHttpClientFactory.getClient(apiId);
  const response = await aadHttpClient.get(responseUrl, AadHttpClient.configurations.v1);
  const results = await response.json();
  return results;
};
const formRestQuery = (arr: any, filterField: string) : string => {
  let query = '';
  for (let i = 0; i < arr.length; i++){
    query += `${filterField} eq '${arr[i].trim()}'`;
    if (i !== arr.length -1) query += ' or ';
  }
  return query;
};
export const getSupervisorsInfo = async (context: WebPartContext, locNo: string) => {
  const supersPNos = await getSupervisors(context, locNo);

  if (supersPNos && supersPNos !== 'No record found'){
    const pNumsArr = JSON.parse(supersPNos).map((item: any) => item.P_NUMBER.replace('P','00'));
    const empInfoPromisesArr = [];
    const queryCounter = Math.ceil(pNumsArr.length / 40 );
    let query = '';

    if (pNumsArr.length > 40){
      for (let i=0; i<queryCounter ; i++){
        const pNumsArrBatch = pNumsArr.splice(0,40);
        query = formRestQuery(pNumsArrBatch, 'MMHubEmployeeNo');
        const empInfoResults = await getEmpsInfoQuery(context, query);
        empInfoPromisesArr.push(empInfoResults);
      }
      return Promise.all(empInfoPromisesArr);
    }else{
      for (let i = 0; i < pNumsArr.length; i++){
        query += `MMHubEmployeeNo eq '${pNumsArr[i].trim()}'`;
        if (i !== pNumsArr.length -1) query += ' or ';
      }
      const empInfoResults = await getEmpsInfoQuery(context, query);
      return empInfoResults;
    }
  }
  return [];
};

/* Transferring Supervisors Info */
export const getSupervisorsTransfersInfo = async (context: WebPartContext, empsArr: any) => {
  const query = formRestQuery(empsArr, 'MMHubBoardEmail');
  const empInfoResults = await getEmpsInfoQuery(context, query);
  return empInfoResults;
};

/* Allocations Info */
export const getEmpAllocations = async (context: WebPartContext, locId: string, formType: string) => {
    //formType: Current, Transferring
    const responseUrl = `${siteUrl}/_api/web/lists/GetByTitle('LunchroomApplication')/items?$filter=FormType eq '${formType}' and SchoolLocationCode eq '${locId}'`;
    
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
export const getAllEmpAllocations = async (context: WebPartContext, locId: string) => {
  //formType: Current, Transferring
  const responseUrl = `${siteUrl}/_api/web/lists/GetByTitle('LunchroomApplication')/items?$filter=SchoolLocationCode eq '${locId}'`;
    
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
export const resolveAllocationData = (choices: any, years: any, formType: string, userInfo:any, selectedLocation: {key:string, text:string, area: string}) :AllocationDataType => {
  
  const applicationType = choices.filter((item: any)=>item.checked).map((item: any)=>item.text);
  const selectedSchoolYear = years.filter((item: any)=>item.checked)[0].textCode;

  const data :AllocationDataType = {
    ApplicationType: applicationType,
    ApplicationTypeChoices: applicationType.join(', '),
    // ApplicationType1: applicationType[0],
    // ApplicationType2: applicationType[1],
    // ApplicationType3: applicationType[3],
    EmailSent: false,
    FirstName: userInfo.FirstName,
    FormType: formType,
    LastName: userInfo.LastName,
    JobTitle: userInfo.JobTitle,
    MMHubEmployeeName: userInfo.LastnameFirstname,
    MMHubEmployeeNo: userInfo.MMHubEmployeeNo.replace('00','P'),
    SchoolLocationCode: selectedLocation.key,
    SchoolName: selectedLocation.text,
    Area: selectedLocation.area,
    SelectedSchoolYear: selectedSchoolYear,
    Title: userInfo.MMHubBoardEmail,
  }
  return data;
};
export const createAllocation = async (context: WebPartContext, allocationData : AllocationDataType) => {
  // for create allocation (formType: Current) or add and employee (formType: Transferring)

    const responseUrl = `${siteUrl}/_api/web/lists/GetByTitle('LunchroomApplication')/items`;

    const body: string = JSON.stringify({
      ApplicationType: allocationData.ApplicationType,
      ApplicationTypeChoices: allocationData.ApplicationType.join(', '),
      // ApplicationType1: allocationData.ApplicationType1, 
      // ApplicationType2: allocationData.ApplicationType2, 
      // ApplicationType3: allocationData.ApplicationType3,
      EmailSent: allocationData.EmailSent,
      FirstName: allocationData.FirstName,
      FormType: allocationData.FormType,
      LastName: allocationData.LastName,
      JobTitle: allocationData.JobTitle, 
      MMHubEmployeeName: allocationData.MMHubEmployeeName,
      MMHubEmployeeNo: allocationData.MMHubEmployeeNo,
      SchoolLocationCode: allocationData.SchoolLocationCode,
      SchoolName: allocationData.SchoolName,
      Area: allocationData.Area,
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
export const updateAllocation = async (context: WebPartContext, allocationData : AllocationDataType, itemId: string) => {
    const responseUrl = `${siteUrl}/_api/web/lists/GetByTitle('LunchroomApplication')/items(${itemId})`;

    const body: string = JSON.stringify({
      ApplicationType: allocationData.ApplicationType,
      ApplicationTypeChoices: allocationData.ApplicationType.join(', '),
        // ApplicationType1: allocationData.ApplicationType1, 
        // ApplicationType2: allocationData.ApplicationType2, 
        // ApplicationType3: allocationData.ApplicationType3,
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








