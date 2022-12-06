import React from 'react'
import './start.css'
import Button from '../components/Button'

export default () => {
    return (
        <div className='landing'>
            <div>
            <div className='join'>
                <h2>Congratulations 🎉</h2>
                <p>You have created a new UniRep attester.</p>
                <p>Clicking 'Join' adds a user to this attester's membership group.</p>
                <Button onClick={() => userContext.signup()}>Join</Button>
                <p>After joining, the member can interact with reputation in the attester's application. </p>
                <p>Customize this landing page to onboard new users to your app!</p>
            </div>
            </div>
        </div>
    )
}