import React from 'react'
import { observer } from 'mobx-react-lite'
import './dashboard.css'
import Button from '../components/Button'
import InfoModal from '../components/InfoModal'

import User from '../contexts/User'

export default observer(() => {
  const userContext = React.useContext(User)
  const [remainingTime, setRemainingTime] = React.useState(0)
  const [reqRep, setReqRep] = React.useState({})
  const [repProofInputs, setRepProofInputs] = React.useState({})
  const [repProof, setRepProof] = React.useState(null)
  const [hovered, setHovered] = React.useState(false)

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

  const handleMouseOver = () => {
    setHovered(true);
  };

  const handleMouseOut = () => {
    setHovered(false);
  };

  if (!userContext.userState) {
    return (
      <div className="container">
        Loading...
      </div>
    )
  }

  if (!userContext.hasSignedUp) {
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

  return (
    <div className="container">
      <div className="info-container">
        <div className='icon' onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
          {/* <MdOutlineTimelapse color='YellowGreen' font-size='3.5em' /> */}
          {hovered && <InfoModal index='0'/>}
        </div>
        <div>
          <div className="title1">
            Epoch
          </div>
          <div>Current epoch: {userContext.userState?.calcCurrentEpoch()}</div>
          <div>Remaining time in epoch: {remainingTime}</div>
          <div>Latest transition epoch: {userContext.latestTransitionedEpoch}</div>
        </div>
        
      </div>
      <div className="info-container">
        <div className='icon' onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
          {/* <BsPersonCircle color='YellowGreen' font-size='3em' /> */}
          {hovered && <InfoModal index='1'/>}
        </div>
        <div>
          <div className="title1">
            Total Reputation
          </div>
          <div>Pos Rep: {userContext.reputation.posRep?.toString()}</div>
          <div>Neg Rep: {userContext.reputation.negRep?.toString()}</div>
          <div>Graffiti: 0x{userContext.reputation.graffiti?.toString(16)}</div>
        </div>
      </div>
      <div className="info-container">
        <div className='icon' onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
          {/* <HiShieldCheck color='YellowGreen' font-size='3.5em' /> */}
          {hovered && <InfoModal index='2'/>}
        </div>
        <div>
          <div className="title1">
            Provable Reputation
          </div>
          <div>Pos Rep: {userContext.provableReputation.posRep?.toString()}</div>
          <div>Neg Rep: {userContext.provableReputation.negRep?.toString()}</div>
          <div>Graffiti: 0x{userContext.provableReputation.graffiti?.toString(16)}</div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
      
        <div className="action-container">
          <div>
            <div className="title2">
              <div className='icon-sm' onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
                {/* <HiQuestionMarkCircle color='yellowgreen' font-size='.8em'/> */}
                {hovered && <InfoModal index='3'/>}
              </div>
              <div>Request Reputation</div>
            </div>
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
              <div className='icon-sm' onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
                {/* <HiQuestionMarkCircle color='yellowgreen' font-size='1em'/> */}
                {hovered && <InfoModal index='4'/>}
              </div>
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
              <div className='icon-sm' onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
                {/* <HiQuestionMarkCircle color='yellowgreen' font-size='1em'/> */}
                {hovered && <InfoModal index='5'/>}
              </div>
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
        </div>
        <div className="action-container">
          <div>
            <div className="title2">
              <div className='icon-sm' onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
                {/* <HiQuestionMarkCircle color='yellowgreen' font-size='.8em'/> */}
                {hovered && <InfoModal index='6'/>}
              </div>
              <div>Prove Reputation</div>
            </div>
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
              Generate Proof
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
      </div>

      <div className="action-container transition">
        <div className='icon' onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
          {/* <MdPublishedWithChanges color='YellowGreen' font-size='4em' /> */}
          {hovered && <InfoModal index='7'/>}
        </div>
        <div>
          <div className="title2">User state transition</div>
          <Button onClick={()=> userContext.stateTransition()}>Transition</Button>
        </div>
      </div>
    </div>
  )
})
