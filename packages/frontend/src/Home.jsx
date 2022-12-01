import React from 'react'
import { observer } from 'mobx-react-lite'
import './home.css'
import Button from './components/Button'

import User from './contexts/User'

export default observer(() => {
  const userContext = React.useContext(User)
  const [remainingTime, setRemainingTime] = React.useState(0)
  const [posRep, setPosRep] = React.useState(0)
  const [negRep, setNegRep] = React.useState(0)
  const [graffitiPreimage, setGraffitiPreImage] = React.useState('0')
  const [nonce, setNonce] = React.useState(0)
  const [latestGraffitiPreimage, setLatestGraffitiPreimage] = React.useState(0)
  const [minRep, setMinRep] = React.useState(0)
  const [proveGraffitiPreimage, setProveGraffitiPreimage] = React.useState(0)

  const updateTimer = () => {
    if (!userContext.userState) {
      setRemainingTime('Loading...')
      return
    }
    const time = userContext.userState.calcEpochRemainingTime()
    setRemainingTime(time)
  }
  React.useEffect(() => {
    setInterval(() => {
      updateTimer()
    }, 1000)
  }, [])

  return (
    <div>
      {
        !userContext.hasSignedUp ? (
          <Button onClick={() => userContext.signup()}>Join</Button>
        ) :
        <div>
          <div>Remaining time in epoch: {remainingTime}</div>
              <div>Current epoch {userContext.currentEpoch}</div>
              <div>Latest transition epoch {userContext.latestTransitionedEpoch}</div>
              <div style={{ fontSize: '18px', fontWeight: '500'}}>
                Total Reputation
              </div>
              <div>Pos Rep {userContext.reputation.posRep?.toString()}</div>
              <div>Neg Rep {userContext.reputation.negRep?.toString()}</div>
              <div>Graffiti {userContext.reputation.graffiti?.toString()}</div>
              <div style={{ fontSize: '18px', fontWeight: '500'}}>
                Provable Reputation
              </div>
              <div>Pos Rep {userContext.provableReputation.posRep?.toString()}</div>
              <div>Neg Rep {userContext.provableReputation.negRep?.toString()}</div>
              <div>Graffiti {userContext.provableReputation.graffiti?.toString()}</div>
              <div>
              <p>pos rep</p>
              <input
                value={posRep}
                onChange={(event) => {
                  setPosRep(event.target.value ?? 0)
                } }
              ></input>
              <p>current pos rep: {userContext.reputation.posRep.toString()}</p>
              <p>neg rep</p>
              <input
                value={negRep}
                onChange={(event) => {
                  setNegRep(event.target.value ?? 0)
                } }
              ></input>
              <p>current neg rep: {userContext.reputation.negRep.toString()}</p>
              <p>graffiti preimage</p>
              <input
                value={graffitiPreimage}
                onChange={(event) => {
                  setGraffitiPreImage(event.target.value ?? 0)
                } }
              ></input>
              <p>current graffiti preimage: {latestGraffitiPreimage}</p>
              <p>epoch key nonce</p>
              <input
                value={nonce}
                onChange={(event) => { setNonce(event.target.value ?? 0) } }
              ></input>
              <p>current epoch key nonce: {nonce}</p>

              <Button onClick={()=> {
                setLatestGraffitiPreimage(graffitiPreimage)
                return userContext.requestReputation(posRep, negRep, graffitiPreimage, nonce)
                }}>request</Button>
              <br/>
              <Button onClick={()=> userContext.stateTransition()}>transition</Button>
              <br/>
              <p>min rep</p>
              <input
                value={minRep}
                onChange={(event) => {
                  setMinRep(event.target.value ?? 0)
                } }
              ></input>
              <p>graffiti preimage</p>
              <input
                value={proveGraffitiPreimage}
                onChange={(event) => {
                  setProveGraffitiPreimage(event.target.value ?? 0)
                } }
              ></input>
              <Button onClick={()=> userContext.proveReputation(minRep, proveGraffitiPreimage)}>prove</Button>
              <div>public signals: {userContext.publicSignals?.map(n=>n.toString())}</div>
              <div>proof: {userContext.proof?.map(n=>n.toString())}</div>
              <div>Is proof valid?: {userContext.valid?.toString()}</div>
            </div>
        </div>
      }
    </div>
  )
})
