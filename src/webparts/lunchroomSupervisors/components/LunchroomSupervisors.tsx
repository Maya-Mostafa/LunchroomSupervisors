import * as React from 'react';
import styles from './LunchroomSupervisors.module.scss';
import { ILunchroomSupervisorsProps } from './ILunchroomSupervisorsProps';
import { getAllLocations, getSupervisorsInfo, getCRCYear, getCRCStatus, objToMap, getSupervisorsTransfersInfo, getEmpAllocations, getEmpsGrpLunch } from '../Services/DataRequests';
import EmpLocations from './EmpLocations/EmpLocations';
import EmpList from './EmpList/EmpList';
import AddEmp from './AddEmp/AddEmp';

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
  // const [allocationsCount, setAllocationsCount] = React.useState({regCount:0, earlyCount:0, supplyCount:0, needsCount:0});
  const [empsGrpLunch, setEmpsGrpLunch] = React.useState([]);

  React.useEffect(()=>{
    //getEmpInfo(props.context, userEmail).then(r=>setUserInfo(r));
    // getMyLocsDpd(props.context).then(r=>setMyLocations(r));
    getAllLocations(props.context).then(r=>setMyLocations(r));
    getEmpsGrpLunch(props.context).then(r=>setEmpsGrpLunch(r));
  }, []);

  const getSelectedLocHandler = (selLoc: string) => {
    
    // Current Employees
    getSupervisorsInfo(props.context, selLoc).then((supervisorsRes => {
      // Getting employees in the selected location
      setEmpsList(supervisorsRes);
      //Getting CRC status for employees in the selected location
      const updatedCrcEmpsList: any = [];
      for (let i=0; i<supervisorsRes.length; i++){
        getCRCStatus(props.context, supervisorsRes[i].MMHubEmployeeNo.replace('00','P'), CRCYear).then((crcStatus: any) => {
          updatedCrcEmpsList.push({...supervisorsRes[i], crcStatus});
          if (i === supervisorsRes.length -1) setEmpsList(updatedCrcEmpsList);
        });
      }
      // Getting employees allocations for the selected location & with formType equals 'Current'
      getEmpAllocations(props.context, selLoc, "Current").then((allocationsRes) => {
        // setAllocationsCount({...getAllocationCount(allocationsRes)});
        setAllocations(objToMap(allocationsRes, 'Title'));
      });
    })); 

    // Transferring Employees
    getEmpAllocations(props.context, selLoc, "Transferring").then((allocationsRes) => {
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
    });

  };

  const selectChoicesYearsHandler = (choices: any, years: any, userInfo: any) => {
    console.log("selectChoicesYearsUserHandler", choices, years, userInfo);
  };

  return (
    <div className={styles.lunchroomSupervisors}>
      <EmpLocations 
        context={props.context} 
        myLocations={myLocations}
        getSelectedLoc={getSelectedLocHandler}
      />

      <br/>

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
        emps={empsGrpLunch} 
        context={props.context}
        crcYr = {CRCYear}
        selectChoicesYears={selectChoicesYearsHandler}
      />
    </div>
  );
}


