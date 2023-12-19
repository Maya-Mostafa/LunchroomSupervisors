import * as React from 'react';
import { EmpCardProps } from "./EmpCardProps";
import { LivePersona } from "@pnp/spfx-controls-react/lib/LivePersona";
import { Persona } from '@fluentui/react';
import { getEmpPicture, getEmpProfile } from '../../Services/DataRequests';
import styles from '../LunchroomSupervisors.module.scss';
import AllocationChoices from '../AllocationChoices/AllocationChoices';
import AllocationYears from '../AllocationYears/AllocationYears';
import {  DefaultButton, IIconStyles, Icon } from 'office-ui-fabric-react';
// import SchoolYears from '../SchoolYears/SchoolYears';

export default function EmpCard (props: EmpCardProps) {

    // console.log("EmpCardProps", props);

    const iconStyles: Partial<IIconStyles> = { root: { marginRight: 5 } };
    const _onRenderSecondaryText = () =>{
        return (
          <a href={`https://outlook.office.com/mail/deeplink/compose?to=${props.userInfo.MMHubBoardEmail}`} target='_blank' title='Send Email' rel="noreferrer">
            <Icon iconName="Mail" styles={iconStyles} />
            {props.userInfo.MMHubBoardEmail}
          </a>
        );
    }

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
                                {props.userInfo.crcStatus === 'FALSE' && <Icon iconName='Cancel' />}
                                {props.userInfo.crcStatus === 'TRUE' && <Icon iconName='CheckMark' />}
                            </div>
                        </>
                    }
                />
            </div>
            <div className={styles.empCardAlloc}>
                <div className={styles.allocTop}>
                    <AllocationChoices allocation={props.allocation} />
                    <hr/>
                    <AllocationYears allocation={props.allocation} />
                    <hr/>
                    <div className={styles.allocEmailBtn}>
                        <span>Sent on June 2022</span>
                        <DefaultButton primary>Update</DefaultButton>
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