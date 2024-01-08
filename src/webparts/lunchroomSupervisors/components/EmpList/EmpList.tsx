import * as React from 'react';
import { EmpListProps } from "./EmpListProps";
import EmpCard from '../EmpCard/EmpCard';
import styles from '../LunchroomSupervisors.module.scss';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react';

export default function EmpList(props:EmpListProps){

    // console.log("EmpListProps", props);
    const sortedEmps = props.emps.sort((a:any, b:any) => a.LastnameFirstname.localeCompare(b.LastnameFirstname));

    return(
        <>
            
            {props.emps && props.emps.length !== 0 &&
                <>
                    <h3>{props.employeesType} Employees</h3>
                    <div className={styles.hdrCntnr}>
                        <div className={styles.hdrEmpInfo}>Employee Information</div>
                        <div className={styles.hdrChoices}>
                            <div>Returning Choices and Staff Allocation</div>
                            {/* <div className={styles.allocationNumbers}>
                                <div className={styles.allocReg}>{props.allocationsCount.regCount}</div>
                                <div className={styles.allocEarly}>{props.allocationsCount.earlyCount}</div>
                                <div className={styles.allocSupp}>{props.allocationsCount.supplyCount}</div>
                                <div className={styles.allocNeeds}>{props.allocationsCount.needsCount}</div>
                            </div> */}
                        </div>
                        <div className={styles.hdrYear}>School Year</div>
                        <div className={styles.hdrEmail}>Email</div>
                    </div>
                </>
            }

            {props.emps && props.emps.length === 0 && 
                <>
                    <h3>{props.employeesType} Employees</h3>
                    <MessageBar messageBarType={MessageBarType.warning}>
                        There are no {props.employeesType} Employees for this location.
                    </MessageBar>
                </>
            }
            
            {props.emps && sortedEmps.map((emp: any) => {
                return(
                    <EmpCard 
                        key = {emp.Id}
                        context={props.context}
                        userInfo={emp}
                        crcYr={props.crcYr}
                        allocation={props.allocations[emp.MMHubBoardEmail]}
                        selectChoicesYears={props.selectChoicesYears}
                        formType={props.employeesType}
                    />
                )    
            })}
        </>
    );
}