import * as React from 'react';
import styles from './OneBitlyUrlShortener.module.scss';

export default function NoBitlyLinksMessage(): JSX.Element {
    return (
        <div className={styles.wFull}>
            <div className={`${styles.flex} ${styles.mxAuto} ${styles.wFit} ${styles.gap2}`}>
                <img src={require('../assets/shortcut-link-banner.png')} className={styles.h60} alt="Empty list image" />
                <div className={styles.myAuto}>
                    <h2>Empty</h2>
                    <p>Your shortcut link list is empty.  Click Add to create your first link.</p>
                </div>
            </div>
        </div>
    )
}