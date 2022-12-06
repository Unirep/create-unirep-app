import React from 'react'
import './start.css'
import Hummingbird from '../components/Hummingbird'
import Button from '../components/Button'

export default () => {
    return (
        <>
            <div className='bg'>
                <Hummingbird />
            </div>
            <div className='container'>
                <h1>Congratulations</h1>
                <h2>You have created a new UniRep attester.</h2>
                <h2>Clicking 'Join' adds a user to this attester's membership group.</h2>
                <Button onClick={() => userContext.signup()}>Join</Button>
                <p>After joining, the member can interact with reputation in the attester's application. </p>
                <p>Customize this landing page to onboard new users to your app.</p>
            </div>
        </>

    )
}