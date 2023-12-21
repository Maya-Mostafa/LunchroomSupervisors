import * as React from 'react';
import { EmpCardProps } from "./EmpCardProps";
import { LivePersona } from "@pnp/spfx-controls-react/lib/LivePersona";
import { Persona } from '@fluentui/react';
import { getEmpPicture, getEmpProfile, isSendingValid, sentOn } from '../../Services/DataRequests';
import styles from '../LunchroomSupervisors.module.scss';
import AllocationChoices from '../AllocationChoices/AllocationChoices';
import AllocationYears from '../AllocationYears/AllocationYears';
import {  DefaultButton, IIconStyles, Icon, TeachingBubble } from 'office-ui-fabric-react';
// import SchoolYears from '../SchoolYears/SchoolYears';
import { useBoolean, useId } from '@fluentui/react-hooks';

export default function EmpCard (props: EmpCardProps) {

    // console.log("EmpCardProps", props);

    const iconStyles: Partial<IIconStyles> = { root: { marginRight: 5 } };
    const _onRenderSecondaryText = () =>{
        return (
          <a className={styles.peelLink +' '+ styles.empPersonaLink} href={`https://outlook.office.com/mail/deeplink/compose?to=${props.userInfo.MMHubBoardEmail}`} target='_blank' title='Send Email' rel="noreferrer">
            <Icon iconName="Mail" styles={iconStyles} />
            {props.userInfo.MMHubBoardEmail}
          </a>
        );
    };

    const [selectedChoices, setSelectedChoices] = React.useState(null);
    const [selectedYears, setSelectedYears] = React.useState(null);

    const sendChoicesHandler = (choices: any) => {
        console.log("send choices", choices);
        setSelectedChoices(choices);
    };
    const sendYearsHandler = (choices: any) => {
        console.log("send years", choices);
        setSelectedYears(choices);
    };

    const sendHandler = () => {
        props.selectChoicesYears(selectedChoices, selectedYears, props.userInfo);
    };

    // let emailBtnText = '< Select Choices to send an email';
    // const disabledHandler = () => {
    //     if (selectedChoices && selectedYears && isSendingValid(selectedChoices, selectedYears)){
    //         emailBtnText = 'Send';
    //         return false;
    //     }else{
    //         emailBtnText = '< Select Choices to send an email';
    //         return true;
    //     }
    // };

    const buttonId = useId('targetButton');
    const [teachingBubbleVisible, { toggle: toggleTeachingBubbleVisible }] = useBoolean(false);

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
                    <AllocationChoices allocation={props.allocation} selectChoices={sendChoicesHandler} />
                    <hr/>
                    <AllocationYears allocation={props.allocation} selectYears={sendYearsHandler} />
                    <hr/>
                    <div className={styles.allocEmailBtn}>
                        {props.allocation && props.allocation.ApplicationType 
                            ?
                            <>
                                <DefaultButton primary>Update</DefaultButton>
                                <span className={styles.sentOn}>Sent on <b style={{color: '#2c8c89'}}>{sentOn(new Date(props.allocation.Modified))}</b></span>
                            </>
                            :
                            <>
                                {/* <DefaultButton disabled={disabledHandler()} onClick={sendHandler} primary>{emailBtnText}</DefaultButton> */}
                                { selectedChoices && selectedYears && isSendingValid(selectedChoices, selectedYears) 
                                ?
                                <DefaultButton primary onClick={sendHandler}>Send</DefaultButton>
                                :
                                <>
                                    <DefaultButton
                                        id={buttonId}
                                        onClick={toggleTeachingBubbleVisible}
                                        text='Select'
                                        iconProps={{iconName: 'Info12'}}
                                    />
                                    {teachingBubbleVisible && (
                                        <TeachingBubble
                                            target={`#${buttonId}`}
                                            onDismiss={toggleTeachingBubbleVisible}
                                            headline="Select Choices"
                                            hasCloseButton
                                            illustrationImage={{
                                                    src: require('../../assets/check-help-community.png'), 
                                                    alt: 'Help & Support!',
                                                    height: '100px'
                                                }}
                                            >
                                            Select the staff allocation choices and the school year to send an email to the employee. <br/><br/>
                                            For each Relisting or Transfer you put select Current or Next for School Year. 
                                            The Current is ${props.crcYr-1}-${props.crcYr} and the Next is ${props.crcYr}-${props.crcYr+1}
                                        </TeachingBubble>
                                    )}
                                </>
                                }
                            </>
                        }
                    </div>
                </div>
                {/* <hr/>
                <div className={styles.allocBottom}>
                    <DefaultButton primary>Update</DefaultButton>
                </div> */}
                {/* <SchoolYears allocation={props.allocation} /> */}
            </div>
            
        </div>
    );
}