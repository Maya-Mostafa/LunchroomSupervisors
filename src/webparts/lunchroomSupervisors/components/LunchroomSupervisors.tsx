import * as React from 'react';
import styles from './LunchroomSupervisors.module.scss';
import { ILunchroomSupervisorsProps } from './ILunchroomSupervisorsProps';
import { getAllLocations, getSupervisorsInfo, getCRCYear, getCRCStatus, objToMap, getSupervisorsTransfersInfo, getEmpAllocations, getMyLocsDpd, resolveAllocationData, createAllocation, updateAllocation } from '../Services/DataRequests';
import EmpLocations from './EmpLocations/EmpLocations';
import EmpList from './EmpList/EmpList';
import AddEmp from './AddEmp/AddEmp';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react';

export default function LunchroomSupervisors(props: ILunchroomSupervisorsProps){

  // console.log("context", props.context);
  // const userEmail = props.context.pageContext.user.email;
  // const userName = props.context.pageContext.user.displayName;

  //const [userInfo, setUserInfo] = React.useState([]);
  const CRCYear = getCRCYear();
  const [ myLocations, setMyLocations ] = React.useState([]);
  const [empsList, setEmpsList] = React.useState([]);
  const [empsTransferList, setEmpsTransferList] = React.useState([]);
  const [allocations, setAllocations] = React.useState([]);
  const [allocationsTransfer, setAllocationsTransfer] = React.useState([]);
  const [selectedLocation, setSelectedLocation] = React.useState({key:'', text:'', area:''});
  // const [allocationsCount, setAllocationsCount] = React.useState({regCount:0, earlyCount:0, supplyCount:0, needsCount:0});
  // const [empsGrpLunch, setEmpsGrpLunch] = React.useState([]);
  const [preloaderVisible, setPreloaderVisible] = React.useState(true);
  const [processing, setProcessing] = React.useState(false);

  React.useEffect(()=>{
    //getEmpInfo(props.context, userEmail).then(r=>setUserInfo(r));
    getMyLocsDpd(props.context).then((myLocsRes: any) => {
      const myLocs = myLocsRes.map((item:any) => item.key);
      if (myLocs.includes('0016') || myLocs.includes('0022')){
        getAllLocations(props.context).then(r=>{
          setMyLocations(r);
          setPreloaderVisible(false);
        });
      }else{
        setMyLocations(myLocsRes);
        getSelectedLocHandler(myLocsRes[0].key);
        setPreloaderVisible(false);
      }
    });
    // getEmpsGrpLunch(props.context).then(r=>setEmpsGrpLunch(r));
  }, []);

  const loadCurrentSupervisorsAllocation = async (selLoc: string, callback: any) => {
    //setEmpsList([]);
    getSupervisorsInfo(props.context, selLoc).then(supervisorsRes => {
      // Getting employees in the selected location
      const supervisorsResFlat = supervisorsRes.flat();
      setEmpsList(supervisorsResFlat);
      //Getting CRC status for employees in the selected location
      if(supervisorsResFlat){
        const updatedCrcEmpsList: any = [];
        for (let i=0; i<supervisorsResFlat.length; i++){
          getCRCStatus(props.context, supervisorsResFlat[i].MMHubEmployeeNo.replace('00','P'), CRCYear).then((crcStatus: any) => {
            updatedCrcEmpsList.push({...supervisorsResFlat[i], crcStatus});
            // if (i === supervisorsRes.length -1) setEmpsList([...updatedCrcEmpsList]);
            setEmpsList([...updatedCrcEmpsList]);
          });
        }
      }
      // Getting employees allocations for the selected location & with formType equals 'Current'
      getEmpAllocations(props.context, selLoc, "Current").then((allocationsRes) => {
        // setAllocationsCount({...getAllocationCount(allocationsRes)});
        setAllocations(objToMap(allocationsRes, 'Title'));
        setPreloaderVisible(false);
      });
    }).then(()=>callback);
  };
  const loadTransferringSupervisorsAllocation = async (selLoc: string, callback: any) => {
    setEmpsTransferList([]);
    getEmpAllocations(props.context, selLoc, "Transferring").then(allocationsRes => {
      if (allocationsRes.length !== 0){
        const empsTransferEmails = allocationsRes.map((item: any) => item.Title);
        getSupervisorsTransfersInfo(props.context, empsTransferEmails).then(supervisorsTransferRes => {
          setEmpsTransferList(supervisorsTransferRes);
          // Getting CRC status for employees in the selected location
          const updatedCrcEmpsList: any = [];
          for (let i=0; i<supervisorsTransferRes.length; i++){
            getCRCStatus(props.context, supervisorsTransferRes[i].MMHubEmployeeNo.replace('00','P'), CRCYear).then((crcStatus: any) => {
              updatedCrcEmpsList.push({...supervisorsTransferRes[i], crcStatus});
              if (i === supervisorsTransferRes.length -1) setEmpsTransferList(updatedCrcEmpsList);
            });
          }
        });
      }
      setAllocationsTransfer(objToMap(allocationsRes, 'Title'));
      setPreloaderVisible(false);
    }).then(()=>callback);
  };

  const getSelectedLocHandler = (selLoc: string) => {
    selLoc = selLoc.trim();
    const mySelectedLoc: string = myLocations.filter((item: any)=>item.key===selLoc)[0].text;
    setSelectedLocation({key:selLoc, text:mySelectedLoc.substring(0, mySelectedLoc.indexOf(' ('))});
    
    setEmpsList([]);
    setEmpsTransferList([]);

    setPreloaderVisible(true);
    loadCurrentSupervisorsAllocation(selLoc, setPreloaderVisible(false));//.then(()=>console.log("loadCurrentSupervisorsAllocation done"));
    loadTransferringSupervisorsAllocation(selLoc, setPreloaderVisible(false));//.then(()=>console.log("loadTransferringSupervisorsAllocation done"));
  };

  

  const selectChoicesYearsHandler = (choices: any, years: any, userInfo: any, formType: string, isNew: boolean, existingAlloc: any) => {
    //console.log("selectChoicesYearsUserHandler", choices, years, userInfo, formType);
    const allocationData = resolveAllocationData(choices, years, formType, userInfo, selectedLocation);
    setProcessing(true);
    if (isNew) {
      createAllocation(props.context, allocationData).then(()=>{
        if (formType === 'Current') loadCurrentSupervisorsAllocation(selectedLocation.key, setProcessing(false));
        else loadTransferringSupervisorsAllocation(selectedLocation.key, setProcessing(false));
      });
    }
    else{
      updateAllocation(props.context, allocationData, existingAlloc.ID).then(()=>{
        if (formType === 'Current') loadCurrentSupervisorsAllocation(selectedLocation.key, setProcessing(false));
        else loadTransferringSupervisorsAllocation(selectedLocation.key, setProcessing(false));
      });
    }
  };

  return (
    <div className={styles.lunchroomSupervisors}>
      <EmpLocations 
        context={props.context} 
        myLocations={myLocations}
        getSelectedLoc={getSelectedLocHandler}
      />

      <br/>

      {preloaderVisible &&
        <div>
            <Spinner label="Loading data, please wait..." ariaLive="assertive" labelPosition="right" />
        </div>
      }

      {processing &&
        <div className={styles.overlayBg}><Spinner className={styles.overlaySpinner} size={SpinnerSize.large} /></div>
      }

      <EmpList
        emps={empsList}
        context={props.context}
        crcYr = {CRCYear}
        allocations={allocations}
        // allocationsCount={allocationsCount}
        selectChoicesYears={selectChoicesYearsHandler}
        employeesType="Current"
      />
      
      <hr/>
      
      <EmpList
        emps={empsTransferList}
        context={props.context}
        crcYr = {CRCYear}
        allocations={allocationsTransfer}
        // allocationsCount={allocationsCount}
        selectChoicesYears={selectChoicesYearsHandler}
        employeesType="Transferring"
      />

      <hr/>

      <br/>

      <h2>Add Employee</h2>
      <AddEmp 
        // emps={empsGrpLunch} 
        context={props.context}
        crcYr = {CRCYear}
        selectChoicesYears={selectChoicesYearsHandler}
      />
    </div>
  );
}


