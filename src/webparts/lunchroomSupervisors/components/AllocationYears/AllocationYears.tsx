import * as React from 'react';
import { AllocationYearsProps } from "./AllocationYearsProps";
import styles from '../LunchroomSupervisors.module.scss';
import AllocationBtn from '../AllocationBtn/AllocationBtn';
import { getCRCYear } from '../../Services/DataRequests';

export default function AllocationYears (props: AllocationYearsProps) {

    const regBg = '#92DDDB';
    const CRCYr = getCRCYear();

    const allocationsConst = [
        {
          text: `Current up to June ${CRCYr}`,
          textCode: 'CurrentYear',
          type: 'Regular',
          selectedBg : regBg,
          checked: false,
          disabled: false,
        },
        {
          text: `Sept ${CRCYr} - June ${CRCYr+1}`,
          textCode: 'NextYear',
          type: 'Regular',
          selectedBg : regBg,
          checked: false,
          disabled: false,
        },
    ];

    const selectedSchoolYear = props.allocation && props.allocation.SelectedSchoolYear;
    const allocationProps = props.allocation ? props.allocation.toString() : '';

    const [allocationState, setAllocationState] = React.useState(allocationsConst);

    React.useEffect(()=>{
        if (selectedSchoolYear){
            setAllocationState(allocationsConst.map((item: any)=>{
                if (selectedSchoolYear.includes(item.textCode))
                return {...item, checked: true, disabled: true};
                return {...item, disabled: true};
            }));
        }else{
            setAllocationState(allocationsConst);
        }
    }, [allocationProps]);


    const onCheckHandler = (checked: boolean, text: string) => {
      const updatedYears = allocationState.map((item: any)=>{
        if (item.text === text) return {...item, checked: checked};
        return {...item, checked: false};
      });
      setAllocationState(updatedYears);
      props.selectYears(updatedYears);
    };


    return (
        <div className={styles.allocationsChoices}>
          {allocationState.map((allocation: any)=>{
            return(
              <AllocationBtn
                key = {allocation.text}
                text = {allocation.text}
                checked = {allocation.checked}
                selectedBg = {allocation.selectedBg}
                onCheckHandler={onCheckHandler}
                disabled = {allocation.disabled}
              />
            );
          })}
        </div>
    );
}