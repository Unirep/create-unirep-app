import React from 'react'
import { observer } from 'mobx-react-lite'
import './home.css'
import Button from './components/Button'

import User from './contexts/User'

export default observer(() => {
  const userContext = React.useContext(User)
  const [remainingTime, setRemainingTime] = React.useState(0)
  const [reqRep, setReqRep] = React.useState({})
  const [repProofInputs, setRepProofInputs] = React.useState({})
  const [repProof, setRepProof] = React.useState(null)

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

  React.useEffect(() => {
    if (!userContext.userState) {
      setTimeout(() => {
        userContext.epochKey(reqRep.nonce ?? 0).then((key) => setReqRep((v) => ({ ...v, epochKey: key })))
      }, 1000)
    } else {
        userContext.epochKey(reqRep.nonce ?? 0).then((key) => setReqRep((v) => ({ ...v, epochKey: key })))
    }
  }, [reqRep.nonce])

  if (!userContext.userState) {
    return (
      <div className="container">
        Loading...
      </div>
    )
  }

  if (!userContext.hasSignedUp) {
    return (
      <div className="container">
        <Button onClick={() => userContext.signup()}>Join</Button>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="info-container">
        <div>Remaining time in epoch: {remainingTime}</div>
        <div>Current epoch: {userContext.userState?.calcCurrentEpoch()}</div>
        <div>Latest transition epoch: {userContext.latestTransitionedEpoch}</div>
      </div>
      <div className="info-container">
        <div className="title1">
          Total Reputation
        </div>
        <div>Pos Rep: {userContext.reputation.posRep?.toString()}</div>
        <div>Neg Rep: {userContext.reputation.negRep?.toString()}</div>
        <div>Graffiti: 0x{userContext.reputation.graffiti?.toString(16)}</div>
      </div>
      <div className="info-container">
        <div className="title1">
          Provable Reputation
        </div>
        <div>Pos Rep: {userContext.provableReputation.posRep?.toString()}</div>
        <div>Neg Rep: {userContext.provableReputation.negRep?.toString()}</div>
        <div>Graffiti: 0x{userContext.provableReputation.graffiti?.toString(16)}</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
        <div className="action-container">
          <div className="title1">Request reputation</div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <p>Positive reputation:</p>
            <div style={{ width: '4px' }} />
            <input
              value={reqRep.posRep ?? ''}
              onChange={(event) => {
                if (!/^\d*$/.test(event.target.value)) return
                setReqRep((v) => ({...v, posRep: event.target.value ?? 0}))
              } }
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <p>Negative reputation:</p>
            <div style={{ width: '4px' }} />
            <input
              value={reqRep.negRep ?? ''}
              onChange={(event) => {
                  if (!/^\d*$/.test(event.target.value)) return
                  setReqRep((v) => ({...v, negRep: event.target.value ?? 0}))
              } }
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <p>Graffiti preimage:</p>
            <div style={{ width: '4px' }} />
            <input
              value={reqRep.graffitiPreImage ?? ''}
              onChange={(event) => {
                setReqRep((v) => ({ ...v, graffitiPreImage: event.target.value ?? 0 }))
              } }
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <p>Epoch key nonce</p>
            <div style={{ width: '4px' }} />
            <select value={reqRep.nonce ?? 0} onChange={(event) => {
              setReqRep((v) => ({ ...v, nonce: event.target.value }))
            }}>
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
            </select>
          </div>
          <p>Requesting reputation with epoch key: {reqRep.epochKey ?? ''}</p>

          <Button onClick={async () => {
            await userContext.requestReputation(
              reqRep.posRep ?? 0,
              reqRep.negRep ?? 0,
              reqRep.graffitiPreimage ?? 0,
              reqRep.nonce ?? 0
            )
            setReqRep({})
          }}>
            Request Rep
          </Button>
        </div>
        <div className="action-container">
          <div className="title1">Prove reputation</div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <p>Minimum reputation:</p>
            <div style={{ width: '4px' }} />
            <input
              value={repProofInputs.minRep ?? ''}
              onChange={(event) => {
                if (!/^\d*$/.test(event.target.value)) return
                setRepProofInputs((v) => ({ ...v, minRep: event.target.value ?? 0}))
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <p>Graffiti preimage:</p>
            <div style={{ width: '4px' }} />
            <input
              value={repProofInputs.graffitiPreImage ?? ''}
              onChange={(event) => {
                setRepProofInputs((v) => ({ ...v, graffitiPreImage: event.target.value ?? 0 }))
              }}
            />
          </div>
          <Button onClick={async ()=> {
            const proof = await userContext.proveReputation(repProofInputs.minRep, repProofInputs.graffitiPreimage)
            setRepProofInputs({})
            setRepProof(proof)
          }}>
            Generate proof
          </Button>
          {repProof ?
            (
              <>
                <div>Is proof valid?: {repProof?.valid?.toString() ?? ''}</div>
                <textarea readOnly value={JSON.stringify(repProof, null, 2)} />
              </>
            ) :
            null
          }
        </div>
      </div>
      <div className="action-container">
        <div className="title1">User state transition</div>
        <Button onClick={()=> userContext.stateTransition()}>Transition</Button>
      </div>
    </div>
  )
})
