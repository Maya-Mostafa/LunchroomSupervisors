import * as React from 'react';
import AllocationBtnProps from './AllocationBtnProps';
import { DefaultButton } from 'office-ui-fabric-react';
import styles from '../LunchroomSupervisors.module.scss';

export default function AllocationBtn(props: AllocationBtnProps) {

    //const [isChecked, setIsChecked] = React.useState(false);

    const onClickHandler = () => {
        props.onCheckHandler(!props.checked, props.text);
    };

    let fontColor = '#242424';
    if (!props.checked && props.disabled) fontColor = '#bdbdbd';
    if (props.checked && props.disabled) fontColor = '#242424';

    return (
        <DefaultButton
            toggle
            checked = {props.checked}
            text = {props.text}
            onClick = {onClickHandler}
            className = {styles.allocBtn}
            style = {{backgroundColor : props.checked ? props.selectedBg : '#eee', color: fontColor}}
            disabled = {props.disabled}
        />
    );
}