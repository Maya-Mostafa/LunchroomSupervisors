import * as React from 'react';
import { SchoolYearsProps } from "./SchoolYearsProps";
import styles from '../LunchroomSupervisors.module.scss';
import { DefaultButton, Toggle, TooltipHost } from 'office-ui-fabric-react';
import { useId } from '@fluentui/react-hooks';

export default function SchoolYears (props: SchoolYearsProps) {

    // const allocationsConst = [
    //     {
    //       text: 'Current',
    //       textCode: 'CurrentYear',
    //       type: 'Regular',
    //       selectedBg : regBg,
    //       checked: false,
    //       disabled: false,
    //     },
    //     {
    //       text: 'Next',
    //       textCode: 'NextYear',
    //       type: 'Regular',
    //       selectedBg : regBg,
    //       checked: false,
    //       disabled: false,
    //     },
    // ];

    const buttonStyles = {
        root: {
          background: 'transparent',
          border: 'none',
          minWidth: '16px',
          padding: 0,
        },
    };

    // const selectedSchoolYear = props.allocation && props.allocation.SelectedSchoolYear;
    // const allocationProps = props.allocation ? props.allocation.toString() : '';

    // const [allocationState, setAllocationState] = React.useState(allocationsConst);
    const [showTooltip, setShowTooltip] = React.useState(false);
    const tooltipId = useId('tooltipId');

    // React.useEffect(()=>{
    //     if (selectedSchoolYear){
    //         setAllocationState(allocationsConst.map((item: any)=>{
    //             if (selectedSchoolYear.includes(item.textCode))
    //             return {...item, checked: true, disabled: true};
    //             return {...item, disabled: true};
    //         }));
    //     }else{
    //         setAllocationState(allocationsConst);
    //     }
    // }, [allocationProps]);


    // const onChangeHandler = (checked: boolean, text: string) => {
    //     setAllocationState(allocationState.map((item: any)=>{
    //         if (item.text === text) return {...item, checked: checked};
    //         return {...item, checked: false};
    //     }));
    // };

    const onChangeHandler = (ev: React.MouseEvent<HTMLElement>, checked?: boolean) =>{
        console.log("first")
    };


    const iconWithTooltip = (
        <>
          <TooltipHost content={showTooltip ? 'For each Relisting or Transfer you put select Current or Next for School Year. The Current is 2019-2020 and the Next is 2020-2021.​​' : undefined} id={tooltipId}>
            <DefaultButton
              aria-label={'more info'}
              aria-describedby={showTooltip ? tooltipId : undefined}
              onClick={() => setShowTooltip(!showTooltip)}
              styles={buttonStyles}
              iconProps={{ iconName: 'Info' }}
            />
          </TooltipHost>
        </>
      );


    return (
        <div className={styles.allocationsChoices}>
          <Toggle label={<div>Select School Year {iconWithTooltip}</div>} onText="Next Year" offText="Current Year" onChange={onChangeHandler} />
        </div>
    );
}