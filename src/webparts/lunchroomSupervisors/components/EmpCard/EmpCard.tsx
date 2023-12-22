import * as React from 'react';
import { EmpCardProps } from "./EmpCardProps";
import { LivePersona } from "@pnp/spfx-controls-react/lib/LivePersona";
import { Persona } from '@fluentui/react';
import { getEmpPicture, getEmpProfile, isSendingValid, sentOn } from '../../Services/DataRequests';
import styles from '../LunchroomSupervisors.module.scss';
import AllocationChoices from '../AllocationChoices/AllocationChoices';
import AllocationYears from '../AllocationYears/AllocationYears';
import {  DefaultButton, IIconStyles, Icon, TooltipHost } from 'office-ui-fabric-react';
import { useId } from '@fluentui/react-hooks';
import SelectBtn from '../SelectBtn/SelectBtn';

export default function EmpCard (props: EmpCardProps) {

    // console.log("EmpCardProps", props);

    const tooltipId = useId('tooltip');
    const iconStyles: Partial<IIconStyles> = { root: { marginRight: 5 } };
    const _onRenderSecondaryText = () =>{
        return (
          <a className={styles.peelLink +' '+ styles.empPersonaLink} href={`https://outlook.office.com/mail/deeplink/compose?to=${props.userInfo.MMHubBoardEmail}`} target='_blank' title='Send Email' rel="noreferrer">
            <Icon iconName="Mail" styles={iconStyles} />
            {props.userInfo.MMHubBoardEmail}
          </a>
        );
    };
    const Tooltip = () => {
        return(
            <div>Please click on <b>Update</b> button first in order to process LRS, then select &nbsp;
                <b>Returning Choices and Staff Allocation</b> and <b>School Year</b>, then click on <b>Send</b>.
            </div>
        );
    };

    const [selectedChoices, setSelectedChoices] = React.useState(null);
    const [selectedYears, setSelectedYears] = React.useState(null);
    const [openEdit, setOpenEdit] = React.useState(false);

    const sendChoicesHandler = (choices: any) => {
        setSelectedChoices(choices);
    };
    const sendYearsHandler = (choices: any) => {
        setSelectedYears(choices);
    };
    const sendHandler = () => {
        props.selectChoicesYears(selectedChoices, selectedYears, props.userInfo);
    };
    const updateHandler = () => {
        setOpenEdit(true);
    };

    // React.useEffect(()=>{
    //     //
    // }, [selectedChoices, selectedYears]);

    return(
        <div className={styles.empCard}>
            <div className={styles.empPersonaCntnr}>
                <LivePersona upn={props.userInfo.MMHubBoardEmail}
                    serviceScope={props.context.serviceScope as any}
                    template={
                        <>
                            <Persona 
                                className={styles.empPersona}
                                text={props.userInfo.LastnameFirstname} 
                                onRenderSecondaryText={_onRenderSecondaryText} 
                                coinSize={48} 
                                imageUrl={getEmpPicture(props.userInfo.LastnameFirstname)}
                                tertiaryText={getEmpProfile(props.userInfo.LastnameFirstname)}
                            />
                            <div className={styles.empJobTitle}>{props.userInfo.MMHubJobTitle}</div>
                            <div className={styles.crc}>
                                {props.userInfo.crcStatus === 'FALSE' 
                                    ? 
                                    <span className={styles.invalidOD}><Icon iconName='ErrorBadge' />Invalid OD</span> 
                                    : 
                                    <span className={styles.validOD}><Icon iconName='Completed' />Valid OD</span>
                                }
                            </div>
                        </>
                    }
                />
            </div>
            <div className={styles.empCardAlloc}>
                <div className={styles.allocTop}>
                    <AllocationChoices 
                        openEdit = {openEdit} 
                        allocation={props.allocation} 
                        selectChoices={sendChoicesHandler} 
                    />
                    <hr/>
                    <AllocationYears 
                        openEdit = {openEdit} 
                        allocation={props.allocation} 
                        selectYears={sendYearsHandler} 
                    />
                    <hr/>
                    <div className={styles.allocEmailBtn}>
                        {props.allocation && props.allocation.ApplicationType 
                            ?
                            <>
                                {openEdit
                                ?
                                    <>
                                        {isSendingValid(selectedChoices, selectedYears)
                                        ?
                                            <DefaultButton primary onClick={sendHandler}>Send</DefaultButton>
                                        :
                                            <SelectBtn crcYr={props.crcYr} />
                                        }
                                    </>
                                :
                                    <DefaultButton primary onClick={updateHandler}>Update</DefaultButton>
                                }
                                <span className={styles.sentOn}>
                                    <TooltipHost
                                        content={<Tooltip />}
                                        id={tooltipId}>
                                        <Icon iconName='Info'/>
                                    </TooltipHost>
                                    <span>Sent on <b style={{color: '#2c8c89'}}>{sentOn(new Date(props.allocation.Modified))}</b></span>
                                </span>
                            </>
                            :
                            <>
                                {isSendingValid(selectedChoices, selectedYears)
                                ?
                                    <DefaultButton primary onClick={sendHandler}>Send</DefaultButton>
                                :
                                    <SelectBtn crcYr={props.crcYr} />
                                }
                            </>
                        }   
                    </div>
                </div>
            </div>
        </div>
    );
}