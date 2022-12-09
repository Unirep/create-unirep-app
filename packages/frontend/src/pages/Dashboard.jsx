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
            <Tooltip text={`An epoch is a unit of time, defined by the attester, with a state tree and epoch tree. User epoch keys are valid for 1 epoch before they change.`} />
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
            <Tooltip text='This is all the reputation the user has received. The user cannot prove reputation from the current epoch.'/>
          </div>
          <div className='info-item'>
            <div>Positive</div>
            <div className='stat'>{userContext.reputation.posRep?.toString()}</div>
          </div>
          <div className='info-item'>
            <div>Negative</div>
            <div className='stat'>{userContext.reputation.negRep?.toString()}</div>
          </div>
          {/* <div className='graffiti'><span style={{marginRight: '200px'}}>Graffiti</span><span className='stat'>0x{userContext.reputation.graffiti?.toString(16)}</span></div> */}
          <div>Graffiti</div>
          <div className='graffiti'>0x{userContext.reputation.graffiti?.toString(16)}</div>

          <hr/>

          <div className='info-item'>
            <h3>Provable Reputation</h3>
            <Tooltip text='This is the reputation the user has received up until their last transitioned epoch. This reputation can be proven in ZK.'/>
          </div>
          <div className='info-item'>
            <div>Positive</div>
            <div className='stat'>{userContext.provableReputation.posRep?.toString()}</div>
          </div>
          <div className='info-item'>
            <div>Negative</div>
            <div className='stat'>{userContext.provableReputation.negRep?.toString()}</div>
          </div>
          <div>Graffiti</div>
          <div className='graffiti'>0x{userContext.provableReputation.graffiti?.toString(16)}</div>
        </div>

        <div style={{ width: '70%' }}>
          <div className="action-container transition">
            <div className='icon'>
              <h2>User State Transition</h2>
              <Tooltip text={`The user state transition allows a user to insert a state tree leaf into the latest epoch. The user sums all the reputation they've received in the past and proves it in ZK.`}/>
            </div>
            <Button onClick={()=> userContext.stateTransition()}>Transition</Button>
          </div>

          <div style={{ display: 'flex' }}>
            <div className="action-container">
              <div className='icon'>
                <h2>Request Reputation</h2>
                <Tooltip text='You can request reputation here. The demo attester will freely give you reputation.'/>
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
                <p style={{marginRight: '8px'}}>Graffiti preimage</p>
                <Tooltip text='Graffiti is a 32 byte value that can be set by the attester.'/>
              </div>
              <input
                value={reqRep.graffitiPreImage ?? ''}
                onChange={(event) => {
                  setReqRep((v) => ({ ...v, graffitiPreImage: event.target.value ?? 0 }))
                } }
              />
              <div className='icon'>
                <p style={{marginRight: '8px'}}>Epoch key nonce</p>
                <Tooltip text='Epoch keys are short lived identifiers for a user. They can be used to receive reputation and are valid only for 1 epoch.'/>
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
                  reqRep.graffitiPreImage ?? 0,
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
                <Tooltip text='Users can prove they control some amount of reputation without revealing exactly how much they control.'/>
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
                  const proof = await userContext.proveReputation(repProofInputs.minRep, repProofInputs.graffitiPreImage)
                  setRepProofInputs({})
                  setRepProof(proof)
                }}>
                  Generate Proof
                </Button>
              </div>
              {repProof ?
                (
                  <>
                    <div>Is proof valid? <span style={{fontWeight: '600'}}> {repProof?.valid?.toString() ?? ''}</span></div>
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
