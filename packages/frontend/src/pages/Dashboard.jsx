import React from 'react'
import { observer } from 'mobx-react-lite'
import './dashboard.css'
import InfoIcon from '../components/InfoIcon'
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

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="container">
        <div className="info-container">
          {/* <div className='icon' onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
            <MdOutlineTimelapse color='YellowGreen' font-size='3.5em' />
            {hovered && <InfoModal index='0'/>}
          </div> */}
          <div className='info-item'>
            <h3>Epoch</h3>
            <InfoIcon />
          </div>
          <div className='info-item'>
            <div>Current epoch #</div>
            <div>{userContext.userState?.calcCurrentEpoch()}</div>
          </div>
          <div className='info-item'>
            <div>Remaining time</div>
            <div>{remainingTime}</div>
          </div>
          <div className='info-item'>
            <div>Latest transition epoch</div>
            <div>{userContext.latestTransitionedEpoch}</div>
          </div>

          <hr/>

          {/* <div className='icon' onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
            <BsPersonCircle color='YellowGreen' font-size='3em' />
            {hovered && <InfoModal index='1'/>}
          </div> */}
          <div className='info-item'>
            <h3>Latest Reputation</h3>
            <InfoIcon />
          </div>
          <div className='info-item'>
            <div>Positive</div>
            <div>{userContext.reputation.posRep?.toString()}</div>
          </div>
          <div className='info-item'>
            <div>Negative</div>
            <div>{userContext.reputation.negRep?.toString()}</div>
          </div>
          <div className='info-item'>
            <div>Graffiti</div>
            <div>0x{userContext.reputation.graffiti?.toString(16)}</div>
          </div>

          <hr/>

          {/* <div className='icon' onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
            <HiShieldCheck color='YellowGreen' font-size='3.5em' />
            {hovered && <InfoModal index='2'/>}
          </div> */}
          <div className='info-item'>
            <h3>Provable Reputation</h3>
            <InfoIcon />
          </div>
          <div className='info-item'>
            <div>Positive</div>
            <div>{userContext.provableReputation.posRep?.toString()}</div>
          </div>
          <div className='info-item'>
            <div>Negative</div>
            <div>{userContext.provableReputation.negRep?.toString()}</div>
          </div>
          <div className='info-item'>
            <div>Graffiti</div>
            <div>0x{userContext.provableReputation.graffiti?.toString(16)}</div>
          </div>
        </div>

        <div style={{ width: '70%' }}>

          <div className="action-container transition">
            {/* <div className='icon' onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
              <MdPublishedWithChanges color='YellowGreen' font-size='4em' />
              {hovered && <InfoModal index='7'/>}
            </div> */}
            <div className='icon'>
              <h2>User State Transition</h2>
              <InfoIcon />
            </div>
            <Button onClick={()=> userContext.stateTransition()}>Transition</Button>
          </div>
        
          <div style={{ display: 'flex' }}>
            <div className="action-container">
              <div className='icon'>
                  {/* <div className='icon-sm' onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
                    <HiQuestionMarkCircle color='yellowgreen' font-size='.8em'/>
                    {hovered && <InfoModal index='3'/>}
                  </div> */}
                <h2>Request Reputation</h2>
                <InfoIcon />
              </div>
              <p>Positive</p>
              <input
                style={{ width: '180px', height: '40px' }}
                value={reqRep.posRep ?? ''}
                onChange={(event) => {
                  if (!/^\d*$/.test(event.target.value)) return
                  setReqRep((v) => ({...v, posRep: event.target.value ?? 0}))
                } }
              />
              <p>Negative</p>
              <input
                style={{ width: '180px', height: '40px' }}
                value={reqRep.negRep ?? ''}
                onChange={(event) => {
                    if (!/^\d*$/.test(event.target.value)) return
                    setReqRep((v) => ({...v, negRep: event.target.value ?? 0}))
                } }
              />
                  {/* <div className='icon-sm' onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
                    <HiQuestionMarkCircle color='yellowgreen' font-size='1em'/>
                    {hovered && <InfoModal index='4'/>}
                  </div> */}
              <div className='icon'>
                <p>Graffiti preimage</p>
                <InfoIcon />
              </div>
              <input
                style={{ width: '180px', height: '40px' }}
                value={reqRep.graffitiPreImage ?? ''}
                onChange={(event) => {
                  setReqRep((v) => ({ ...v, graffitiPreImage: event.target.value ?? 0 }))
                } }
              />
                  {/* <div className='icon-sm' onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
                    <HiQuestionMarkCircle color='yellowgreen' font-size='1em'/>
                    {hovered && <InfoModal index='5'/>}
                  </div> */}
              <div className='icon'>
                <p>Epoch key nonce</p>
                <InfoIcon />
              </div>
              <select style={{ width: '120px', height: '40px' }} value={reqRep.nonce ?? 0} onChange={(event) => {
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
                  {/* <div className='icon-sm' onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
                    <HiQuestionMarkCircle color='yellowgreen' font-size='.8em'/>
                    {hovered && <InfoModal index='6'/>}
                  </div> */}
                <h2>Prove Reputation</h2>
                <InfoIcon />
              </div>
              <p>Minimum reputation:</p>
              <input
                style={{ width: '180px', height: '40px' }}
                value={repProofInputs.minRep ?? ''}
                onChange={(event) => {
                  if (!/^\d*$/.test(event.target.value)) return
                  setRepProofInputs((v) => ({ ...v, minRep: event.target.value ?? 0}))
                }}
              />
              <p>Graffiti preimage:</p>
              <input
                style={{ width: '180px', height: '40px' }}
                value={repProofInputs.graffitiPreImage ?? ''}
                onChange={(event) => {
                  setRepProofInputs((v) => ({ ...v, graffitiPreImage: event.target.value ?? 0 }))
                }}
              />
              <div style={{marginTop: '20px'}}>
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
                    <div>Is proof valid?: {repProof?.valid?.toString() ?? ''}</div>
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
