import * as React from 'react';
import AddEmpProps from './AddEmpProps';
import { PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import EmpCard from '../EmpCard/EmpCard';
import { getCRCStatus, getEmpInfo } from '../../Services/DataRequests';


export default function AddEmp(props: AddEmpProps){

    const [selectedEmp, setSelectedEmp] = React.useState(null); 

    const getPeoplePickerItems = (items: any[]) =>{
        console.log("getPeoplePickerItems", items);
        if (items.length !== 0){
            const empEmail = items[0].secondaryText;
            getEmpInfo(props.context, empEmail).then(res => {
                getCRCStatus(props.context, res[0].MMHubEmployeeNo.replace('00','P'), props.crcYr).then((crcStatus: any) => {
                    setSelectedEmp({...res[0], crcStatus});
                });
            });
        }else{
            setSelectedEmp({});
        }
    };

    // React.useEffect(()=>{
    //     //
    // }, [Object.keys(selectedEmp).length]);

    return(
        <>
            <PeoplePicker
                context={props.context as any}
                titleText="Search an employee"
                personSelectionLimit={1}
                // groupName={'Group71-LunchroomSupervisors-DL@peelsb.com'} // Leave this blank in case you want to filter from all users
                groupId={'2f6e1c92-abc1-4c52-a75b-73d6bf8d45f0'}
                showtooltip={true}
                searchTextLimit={5}
                onChange={getPeoplePickerItems}
                principalTypes={[PrincipalType.User]}
                resolveDelay={1000} 
            />
            <br/>
            {selectedEmp && Object.keys(selectedEmp).length !== 0 &&
                <EmpCard 
                    key = {selectedEmp.id}
                    context={props.context}
                    userInfo={selectedEmp}
                    crcYr={props.crcYr}
                    allocation={null}
                    selectChoicesYears={props.selectChoicesYears}
                />
            }
        </>
    );
}