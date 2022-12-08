import React from 'react'
import { Link } from "react-router-dom";
import { observer } from 'mobx-react-lite'
import './start.css'
import Tooltip from '../components/Tooltip';
import Button from '../components/Button'

import User from '../contexts/User'

export default observer(() => {
    const userContext = React.useContext(User)

    // if (!userContext.userState) {
    //     return (
    //     <div className="container">
    //         Loading...
    //     </div>
    //     )
    // }

    return (
        <>
            <div className='bg'>
                <img src={require('../../public/hummingbird.svg')} alt="hummingbird at a flower"/>
            </div>
            <div className='content'>
                <div style={{fontSize: '70px', fontWeight: '600'}}>Congratulations</div>
                <div className='attester'>
                    <div style={{marginRight: '12px'}}>You have created a new UniRep attester </div>
                    <Tooltip text='Attesters define their own reputation systems and are able to attest to users, giving them reputation and graffiti.'/>
                </div>
                <p>Clicking 'Join' adds a user to this attester's membership group.</p>
                <div className='join'>
                    {!userContext.hasSignedUp ? (
                        <Button onClick={() => userContext.signup()}>Join<span style={{marginLeft: '12px'}}><img src={require('../../public/arrow.svg')} alt="right arrow"/></span></Button>
                    ) : (
                        <div>
                            <p style={{ fontWeight: '400', lineHeight: '.5em'}}>USER ADDED!</p>
                            <Link to='/dashboard'><Button>Dashboard<span style={{marginLeft: '12px'}}><img src={require('../../public/arrow.svg')} alt="right arrow"/></span></Button></Link>
                        </div>
                    )}
                </div>
                <p>After joining, the member can interact with reputation in the attester's application. </p>
                <p>Customize this landing page to onboard new users to your app.</p>
            </div>
        </>

    )
})
