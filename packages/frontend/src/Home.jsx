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
  const [totalPosRep, setTotalPosRep] = React.useState(0)
  const [totalNegRep, setTotalNegRep] = React.useState(0)
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
              <div>Received Pos Rep {userContext.posRep?.toString()}</div>
              <div>Received Neg Rep {userContext.negRep?.toString()}</div>
              <div>Received Graffiti {userContext.graffiti?.toString()}</div>
              <div>
              <p>pos rep</p>
              <input
                value={posRep}
                onChange={(event) => { 
                  setPosRep(event.target.value ?? 0) 
                } }
              ></input>
              <p>current pos rep: {totalPosRep}</p>
              <p>neg rep</p>
              <input
                value={negRep}
                onChange={(event) => { 
                  setNegRep(event.target.value ?? 0) 
                } }
              ></input>
              <p>current neg rep: {totalNegRep}</p>
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
                userContext.requestReputation(posRep, negRep, graffitiPreimage, nonce)
                setTotalPosRep(Number(posRep)+ Number(totalPosRep))
                setTotalNegRep(Number(negRep)+ Number(totalNegRep))
                setLatestGraffitiPreimage(graffitiPreimage)
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
