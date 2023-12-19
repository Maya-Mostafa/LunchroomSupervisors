import * as React from 'react';
import { EmpListProps } from "./EmpListProps";
import EmpCard from '../EmpCard/EmpCard';

export default function EmpList(props:EmpListProps){

    // console.log("EmpListProps", props);

    return(
        props.emps.map((emp: any) => {
            return(
                <EmpCard 
                    key = {emp.Id}
                    context={props.context}
                    userInfo={emp}
                    crcYr={props.crcYr}
                    allocation={props.allocations[emp.MMHubBoardEmail]}
                />
            )    
        })
    );
}