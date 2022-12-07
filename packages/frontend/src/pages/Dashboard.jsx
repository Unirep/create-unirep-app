import React from 'react'
import { observer } from 'mobx-react-lite'
import './dashboard.css'
import Button from '../components/Button'
import Tooltip from '../components/Tooltip'

import User from '../contexts/User'

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

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="container">
        <div className="info-container">
          <div className='info-item'>
            <h3>Epoch</h3>
            <Tooltip text='This is info about the epoch.'/>
          </div>
          <div className='info-item'>
            <div>Current epoch #</div>
            <div className='stat'>{userContext.userState?.calcCurrentEpoch()}</div>
          </div>
          <div className='info-item'>
            <div>Remaining time</div>
            <div className='stat'>{remainingTime}</div>
          </div>
          <div className='info-item'>
            <div>Latest transition epoch</div>
            <div className='stat'>{userContext.latestTransitionedEpoch}</div>
          </div>

          <hr/>

          <div className='info-item'>
            <h3>Latest Reputation</h3>
            <Tooltip text='This is info about latest reputation.'/>
          </div>
          <div className='info-item'>
            <div>Positive</div>
            <div className='stat'>{userContext.reputation.posRep?.toString()}</div>
          </div>
          <div className='info-item'>
            <div>Negative</div>
            <div className='stat'>{userContext.reputation.negRep?.toString()}</div>
          </div>
          <div className='info-item'>
            <div>Graffiti</div>
            <div className='stat'>0x{userContext.reputation.graffiti?.toString(16)}</div>
          </div>

          <hr/>

          <div className='info-item'>
            <h3>Provable Reputation</h3>
            <Tooltip text='This is info about provable reputation.'/>
          </div>
          <div className='info-item'>
            <div>Positive</div>
            <div className='stat'>{userContext.provableReputation.posRep?.toString()}</div>
          </div>
          <div className='info-item'>
            <div>Negative</div>
            <div className='stat'>{userContext.provableReputation.negRep?.toString()}</div>
          </div>
          <div className='info-item'>
            <div>Graffiti</div>
            <div className='stat'>0x{userContext.provableReputation.graffiti?.toString(16)}</div>
          </div>
        </div>

        <div style={{ width: '70%' }}>
          <div className="action-container transition">
            <div className='icon'>
              <h2>User State Transition</h2>
              <Tooltip text='This is info about user state transition.'/>
            </div>
            <Button onClick={()=> userContext.stateTransition()}>Transition</Button>
          </div>
        
          <div style={{ display: 'flex' }}>
            <div className="action-container">
              <div className='icon'>
                <h2>Request Reputation</h2>
                <Tooltip text='This is info about requesting reputation.'/>
              </div>
              <p>Positive</p>
              <input
                value={reqRep.posRep ?? ''}
                onChange={(event) => {
                  if (!/^\d*$/.test(event.target.value)) return
                  setReqRep((v) => ({...v, posRep: event.target.value ?? 0}))
                } }
              />
              <p>Negative</p>
              <input
                value={reqRep.negRep ?? ''}
                onChange={(event) => {
                    if (!/^\d*$/.test(event.target.value)) return
                    setReqRep((v) => ({...v, negRep: event.target.value ?? 0}))
                } }
              />
              <div className='icon'>
                <p>Graffiti preimage</p>
                <Tooltip text='This is info about graffiti.'/>
              </div>
              <input
                value={reqRep.graffitiPreImage ?? ''}
                onChange={(event) => {
                  setReqRep((v) => ({ ...v, graffitiPreImage: event.target.value ?? 0 }))
                } }
              />
              <div className='icon'>
                <p>Epoch key nonce</p>
                <Tooltip text='This is info about epoch keys.'/>
              </div>
              <select value={reqRep.nonce ?? 0} onChange={(event) => {
                setReqRep((v) => ({ ...v, nonce: event.target.value }))
              }}>
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
              <p style={{ fontSize: '12px' }}>Requesting reputation with epoch key:</p>
              <p>{reqRep.epochKey ?? ''}</p>

              <Button onClick={async () => {
                await userContext.requestReputation(
                  reqRep.posRep ?? 0,
                  reqRep.negRep ?? 0,
                  reqRep.graffitiPreimage ?? 0,
                  reqRep.nonce ?? 0
                )
                setReqRep({})
              }}>
                Request
              </Button>
            </div>

            <div className="action-container">
              <div className='icon'>
                <h2>Prove Reputation</h2>
                <Tooltip text='This is info about proving reputation.'/>
              </div>
              <p>Minimum reputation:</p>
              <input
                value={repProofInputs.minRep ?? ''}
                onChange={(event) => {
                  if (!/^\d*$/.test(event.target.value)) return
                  setRepProofInputs((v) => ({ ...v, minRep: event.target.value ?? 0}))
                }}
              />
              <p>Graffiti preimage:</p>
              <input
                value={repProofInputs.graffitiPreImage ?? ''}
                onChange={(event) => {
                  setRepProofInputs((v) => ({ ...v, graffitiPreImage: event.target.value ?? 0 }))
                }}
              />
              <div style={{margin: '20px 0 20px'}}>
                <Button onClick={async ()=> {
                  const proof = await userContext.proveReputation(repProofInputs.minRep, repProofInputs.graffitiPreimage)
                  setRepProofInputs({})
                  setRepProof(proof)
                }}>
                  Generate Proof
                </Button>
              </div>
              {repProof ?
                (
                  <>
                    <div style={{marginBottom: '10px'}}>Is proof valid? <span style={{fontWeight: '600'}}> {repProof?.valid?.toString() ?? ''}</span></div>
                    <textarea readOnly value={JSON.stringify(repProof, null, 2)} />
                  </>
                ) :
                null
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})
