import React from 'react'
import { Link } from "react-router-dom";
import { observer } from 'mobx-react-lite'
import './start.css'
import Hummingbird from '../components/Hummingbird'
import Button from '../components/Button'
import Arrow from '../components/Arrow';

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
                <Hummingbird />
            </div>
            <div className='content'>
                <div style={{fontSize: '80px', fontWeight: '600'}}>Congratulations</div>
                <p>You have created a new UniRep attester.</p>
                <p>Clicking 'Join' adds a user to this attester's membership group.</p>
                <div className='join'>
                    {!userContext.hasSignedUp ? (
                        <Button onClick={() => userContext.signup()}>Join<span><Arrow /></span></Button>
                    ) : (
                        <div>
                            <p>USER ADDED!</p>
                            <Link to='/dashboard'><Button>go to Dashboard<span><Arrow /></span></Button></Link>
                        </div>
                    )}          
                </div>
                <p>After joining, the member can interact with reputation in the attester's application. </p>
                <p>Customize this landing page to onboard new users to your app.</p>
            </div>
        </>

    )
})