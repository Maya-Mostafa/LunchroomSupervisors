import * as React from 'react';
import AllocationChoicesProps from './AllocationChoicesProps';
import AllocationBtn from '../AllocationBtn/AllocationBtn';
import styles from '../LunchroomSupervisors.module.scss';

export default function AllocationChoices(props: AllocationChoicesProps) {

  // console.log("AllocationChoicesProps", props);

  const regBg = '#92DDDB';
  const resignBg = '#FFCD70';
  const noReturnBg = '#E08F8F';

  const allocationsConst = [
    {
      text: 'Regular Classes',
      textCode: 'RegularClasses',
      type: 'Regular',
      selectedBg : regBg,
      origChecked: false,
      checked: false,
      prevChecked: false,
      disabled: false,
    },
    {
      text: 'Early Learning Plan',
      textCode: 'EarlyLearningPlan',
      type: 'Regular',
      selectedBg : regBg,
      origChecked: false,
      checked: false,
      prevChecked: false,
      disabled: false,
    },
    {
      text: 'Supply',
      textCode: 'Supply',
      type: 'Regular',
      selectedBg : regBg,
      origChecked: false,
      checked: false,
      prevChecked: false,
      disabled: false,
    },
    {
      text: 'Special Needs',
      textCode: 'SpecialNeeds',
      type: 'Regular',
      selectedBg : regBg,
      origChecked: false,
      checked: false,
      prevChecked: false,
      disabled: false,
    },
    {
      text: 'Not Returning',
      textCode: 'NotReturning',
      type: 'Irregular',
      selectedBg : noReturnBg,
      origChecked: false,
      checked: false,
      prevChecked: false,
      disabled: false,
    },
    {
      text: 'Resign',
      textCode: 'Resign',
      type: 'Irregular',
      selectedBg : resignBg,
      origChecked: false,
      checked: false,
      prevChecked: false,
      disabled: false,
    }
  ];

  const selectedApplicationType = props.allocation && props.allocation.ApplicationType;
  const allocationProps = props.allocation ? props.allocation.toString() : '';

  const [allocationState, setAllocationState] = React.useState(allocationsConst);

  React.useEffect(()=>{
    if (selectedApplicationType){
      setAllocationState(allocationsConst.map((item: any)=>{
        if (selectedApplicationType.includes(item.text))
          return {...item, origChecked: true, checked: true, disabled: true};
        return {...item, disabled: true};
      }));
    }else{
      setAllocationState(allocationsConst);
    }
  }, [allocationProps]);

  React.useEffect(()=>{
    if (props.openEdit){
      setAllocationState(allocationState.map((item: any)=>{
        if (item.origChecked) return {...item, checked: false, prevChecked: true, disabled: false};
        return {...item, disabled: false};
      }));
    }
  }, [props.openEdit]);

  const onCheckHandler = (checked: boolean, text: string) => {
    const updatedChoices = allocationState.map((item: any)=>{
      switch(text){
        case 'Not Returning':
          if (item.text !== 'Not Returning') return {...item, checked: false};
          return {...item, checked: checked};
        case 'Resign':
          if (item.text !== 'Resign') return {...item, checked: false};
          return {...item, checked: checked};
        default:
          if (item.text === text) return {...item, checked: checked};
          if (item.text === 'Not Returning' || item.text === 'Resign') return {...item, checked: false};
          return item;
      }
    });
    setAllocationState(updatedChoices);
    props.selectChoices(updatedChoices);
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
            prevChecked = {allocation.prevChecked}
          />
        );
      })}
    </div>
  )
}

