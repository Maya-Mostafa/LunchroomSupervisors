import * as React from 'react';
import { AllocationYearsProps } from "./AllocationYearsProps";
import styles from '../LunchroomSupervisors.module.scss';
import AllocationBtn from '../AllocationBtn/AllocationBtn';

export default function AllocationYears (props: AllocationYearsProps) {

    const regBg = '#92DDDB';

    const allocationsConst = [
        {
          text: 'Current',
          textCode: 'CurrentYear',
          type: 'Regular',
          selectedBg : regBg,
          checked: false,
          disabled: false,
        },
        {
          text: 'Next',
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
        setAllocationState(allocationState.map((item: any)=>{
            if (item.text === text) return {...item, checked: checked};
            return {...item, checked: false};
        }));
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