import * as React from 'react';
import { EmpLocationsProps } from "./EmpLocationsProps";
import { Dropdown, Stack } from 'office-ui-fabric-react';
import styles from '../LunchroomSupervisors.module.scss';

export default function EmpLocations (props: EmpLocationsProps) {

    const stackTokens = { childrenGap: 50 };
    // const stackStyles: Partial<IStackStyles> = { root: { width: 650 } };

    const [ selectedLoc, setSelectedLoc ] = React.useState('');

    const onDpdChange = (event: React.FormEvent<HTMLDivElement>, item: any): void => {
        setSelectedLoc(item.key);
        props.getSelectedLoc(item.key);
    };

    return (
        
		<div className={styles.empLocations}>
            
			<Stack horizontal tokens={stackTokens} className={styles.empLocationsStack}>
                <Dropdown 
                    placeholder=''
                    options={props.myLocations}
                    label='Select the School or Department'
                    onChange={onDpdChange}
                    // selectedKey={allLocations && allLocations[0] ? allLocations[0].key : ''}
                    selectedKey={selectedLoc}
                    defaultSelectedKey={props.myLocations.length > 0 ? props.myLocations[0].key : ''}
                    className={styles.empLocsDdp}
                />
                <img height={120} src={require('../../assets/lunch.png')} />
			</Stack>

		</div>
        
	);
}