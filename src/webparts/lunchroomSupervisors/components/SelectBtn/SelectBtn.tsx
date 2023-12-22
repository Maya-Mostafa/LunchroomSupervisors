import * as React from 'react';
import { SelectBtnProps } from "./SelectBtnProps";
import { DefaultButton, TeachingBubble } from 'office-ui-fabric-react';
import { useBoolean, useId } from '@fluentui/react-hooks';

export default function SelectBtn(props: SelectBtnProps){

    const buttonId = useId('targetButton');
    const [teachingBubbleVisible, { toggle: toggleTeachingBubbleVisible }] = useBoolean(false);

    return(
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
                    The Current is {props.crcYr-1}-{props.crcYr} and the Next is {props.crcYr}-{props.crcYr+1}
                </TeachingBubble>
            )}
        </>
    );
}