import React from 'react'
import { observer } from 'mobx-react-lite'
import './home.css'
import Button from './components/Button'

import User from './contexts/User'

import { MdOutlineTimelapse} from 'react-icons/md'
import { BsPersonCircle } from 'react-icons/bs'
import { HiShieldCheck } from 'react-icons/hi'
import { HiQuestionMarkCircle } from 'react-icons/hi'
import { MdPublishedWithChanges } from 'react-icons/md'

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
      <div class='landing'>
            <div>
              <div>
                <svg width="200" height="300" viewBox="0 0 467 555" fill="black" xmlns="http://www.w3.org/2000/svg">
                  <path d="M252 539C252 547.837 259.163 555 268 555H451C459.837 555 467 547.837 467 539V14.5167C467 7.0517 460.948 1 453.483 1C342.207 1 252 91.2072 252 202.483V539Z" fill="black"/>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M16 0C7.16406 0 0 7.16357 0 16V352.517C0 463.793 90.207 554 201.482 554C208.949 554 215 547.948 215 540.483V16C215 7.16333 207.836 0 199 0H16ZM164.596 98.644C132.674 77.3184 111.48 49.1855 107.34 26C103.174 49.1753 81.9902 77.2812 50.0938 98.5898C37.8066 106.798 25.1895 113.156 13 117.587L13.1562 117.744C26.7227 122.186 40.9492 129.074 54.7578 138.299C82.959 157.138 102.785 181.29 109.881 202.649C116.6 180.982 136.65 156.244 165.41 137.032C177.279 129.103 189.457 122.899 201.26 118.493L202 117.754C189.715 113.318 176.988 106.922 164.596 98.644Z" fill="black"/>
                </svg>
              </div>
              <div>
                <svg width="200" height="100" viewBox="0 0 983 354" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M83.4059 190.681C66.4279 190.681 51.6839 187.285 39.1739 180.494C26.8425 173.703 17.2813 164.052 10.4901 151.542C3.6989 138.853 0.30331 124.02 0.30331 107.042V0.349038H39.1739V107.042C39.1739 116.693 40.961 125.182 44.5353 132.509C48.2883 139.658 53.4711 145.198 60.0835 149.129C66.8747 152.882 74.7382 154.759 83.6739 154.759C92.6097 154.759 100.384 152.882 106.996 149.129C113.609 145.198 118.702 139.658 122.276 132.509C126.029 125.182 127.906 116.693 127.906 107.042V0.349038H166.508V107.042C166.508 123.841 163.113 138.585 156.322 151.274C149.53 163.784 139.88 173.524 127.37 180.494C115.038 187.285 100.384 190.681 83.4059 190.681ZM197.5 188V0.349038H234.494L327.784 121.518V0.349038H364.241V188H329.928L234.226 62.5419V188H197.5ZM398.293 188V0.349038H437.163V188H398.293ZM471.332 188V0.349038H563.013C575.702 0.349038 586.872 2.85105 596.522 7.85508C606.352 12.6804 613.947 19.4716 619.308 28.2286C624.849 36.9857 627.619 47.0831 627.619 58.5208C627.619 70.4948 624.313 81.039 617.7 90.1534C611.088 99.2679 602.241 106.059 591.161 110.527L632.712 188H589.284L552.558 116.156H510.203V188H471.332ZM510.203 84.2558H559.528C568.285 84.2558 575.255 81.9325 580.438 77.2859C585.799 72.6393 588.48 66.563 588.48 59.057C588.48 51.5509 585.799 45.4746 580.438 40.828C575.255 36.1814 568.285 33.8581 559.528 33.8581H510.203V84.2558ZM653.276 188V0.349038H797.499V34.1262H692.147V77.0179H761.578V109.723H692.147V154.223H798.572V188H653.276ZM826.058 188V0.349038H920.151C932.482 0.349038 943.295 2.85105 952.588 7.85508C962.06 12.8591 969.476 19.829 974.838 28.7648C980.199 37.5218 982.88 47.7086 982.88 59.3251C982.88 70.4054 980.199 80.3241 974.838 89.0811C969.476 97.8382 962.06 104.719 952.588 109.723C943.116 114.727 932.304 117.229 920.151 117.229H864.928V188H826.058ZM864.928 85.06H915.862C924.262 85.06 930.963 82.7368 935.967 78.0902C941.15 73.4436 943.741 67.2779 943.741 59.5931C943.741 51.7297 941.15 45.4746 935.967 40.828C930.963 36.1814 924.262 33.8581 915.862 33.8581H864.928V85.06Z" fill="black"/>
                  <path d="M12.7341 352V258.175H56.1619C62.3276 258.175 67.6891 259.381 72.2463 261.794C76.8035 264.117 80.3778 267.378 82.9692 271.578C85.5606 275.778 86.8563 280.648 86.8563 286.188C86.8563 291.728 85.5606 296.598 82.9692 300.798C80.3778 304.998 76.7589 308.304 72.1123 310.717C67.555 313.04 62.2383 314.202 56.1619 314.202H26.808V352H12.7341ZM26.808 302.272H54.6875C60.2277 302.272 64.6062 300.843 67.8231 297.983C71.1293 295.035 72.7825 291.147 72.7825 286.322C72.7825 281.497 71.1293 277.654 67.8231 274.795C64.6062 271.936 60.2277 270.506 54.6875 270.506H26.808V302.272ZM132.849 352V258.175H175.338C181.593 258.175 187.044 259.336 191.691 261.659C196.426 263.983 200.09 267.244 202.682 271.444C205.362 275.555 206.703 280.38 206.703 285.92C206.703 292.086 204.96 297.403 201.475 301.87C197.99 306.338 193.299 309.555 187.401 311.521L208.311 352H192.763L173.328 313.532H146.922V352H132.849ZM146.922 301.736H174.266C179.806 301.736 184.229 300.351 187.535 297.581C190.931 294.722 192.629 290.879 192.629 286.054C192.629 281.407 190.931 277.654 187.535 274.795C184.229 271.936 179.806 270.506 174.266 270.506H146.922V301.736ZM297.469 353.474C290.678 353.474 284.334 352.268 278.436 349.855C272.539 347.353 267.311 343.913 262.754 339.535C258.286 335.067 254.801 329.929 252.299 324.12C249.886 318.223 248.68 311.878 248.68 305.087C248.68 298.296 249.886 291.996 252.299 286.188C254.801 280.291 258.286 275.152 262.754 270.774C267.311 266.306 272.539 262.866 278.436 260.453C284.334 257.951 290.678 256.7 297.469 256.7C304.26 256.7 310.605 257.951 316.502 260.453C322.489 262.866 327.717 266.306 332.185 270.774C336.653 275.152 340.138 280.291 342.64 286.188C345.142 291.996 346.393 298.296 346.393 305.087C346.393 311.878 345.142 318.223 342.64 324.12C340.138 329.929 336.653 335.067 332.185 339.535C327.717 343.913 322.489 347.353 316.502 349.855C310.605 352.268 304.26 353.474 297.469 353.474ZM297.603 340.473C302.429 340.473 306.897 339.579 311.007 337.792C315.207 336.005 318.87 333.548 321.998 330.42C325.125 327.203 327.583 323.45 329.37 319.161C331.157 314.783 332.051 310.091 332.051 305.087C332.051 299.994 331.157 295.303 329.37 291.013C327.583 286.724 325.125 283.016 321.998 279.888C318.87 276.672 315.207 274.17 311.007 272.382C306.897 270.595 302.429 269.702 297.603 269.702C292.689 269.702 288.131 270.595 283.932 272.382C279.732 274.17 276.068 276.672 272.941 279.888C269.813 283.016 267.356 286.724 265.569 291.013C263.871 295.303 263.022 299.949 263.022 304.953C263.022 310.047 263.871 314.783 265.569 319.161C267.356 323.45 269.813 327.203 272.941 330.42C276.068 333.548 279.732 336.005 283.932 337.792C288.131 339.579 292.689 340.473 297.603 340.473ZM412.033 352V270.64H379.06V258.175H459.08V270.64H426.107V352H412.033ZM540.709 353.474C533.918 353.474 527.573 352.268 521.676 349.855C515.778 347.353 510.551 343.913 505.993 339.535C501.525 335.067 498.04 329.929 495.538 324.12C493.126 318.223 491.919 311.878 491.919 305.087C491.919 298.296 493.126 291.996 495.538 286.188C498.04 280.291 501.525 275.152 505.993 270.774C510.551 266.306 515.778 262.866 521.676 260.453C527.573 257.951 533.918 256.7 540.709 256.7C547.5 256.7 553.844 257.951 559.742 260.453C565.729 262.866 570.956 266.306 575.424 270.774C579.892 275.152 583.377 280.291 585.879 286.188C588.381 291.996 589.632 298.296 589.632 305.087C589.632 311.878 588.381 318.223 585.879 324.12C583.377 329.929 579.892 335.067 575.424 339.535C570.956 343.913 565.729 347.353 559.742 349.855C553.844 352.268 547.5 353.474 540.709 353.474ZM540.843 340.473C545.668 340.473 550.136 339.579 554.246 337.792C558.446 336.005 562.11 333.548 565.237 330.42C568.365 327.203 570.822 323.45 572.609 319.161C574.397 314.783 575.29 310.091 575.29 305.087C575.29 299.994 574.397 295.303 572.609 291.013C570.822 286.724 568.365 283.016 565.237 279.888C562.11 276.672 558.446 274.17 554.246 272.382C550.136 270.595 545.668 269.702 540.843 269.702C535.928 269.702 531.371 270.595 527.171 272.382C522.971 274.17 519.308 276.672 516.18 279.888C513.053 283.016 510.595 286.724 508.808 291.013C507.11 295.303 506.261 299.949 506.261 304.953C506.261 310.047 507.11 314.783 508.808 319.161C510.595 323.45 513.053 327.203 516.18 330.42C519.308 333.548 522.971 336.005 527.171 337.792C531.371 339.579 535.928 340.473 540.843 340.473ZM681.121 353.474C674.151 353.474 667.673 352.268 661.686 349.855C655.788 347.353 650.561 343.913 646.004 339.535C641.536 335.067 638.051 329.929 635.549 324.12C633.136 318.223 631.93 311.878 631.93 305.087C631.93 298.296 633.136 291.996 635.549 286.188C638.051 280.291 641.536 275.152 646.004 270.774C650.561 266.306 655.833 262.866 661.82 260.453C667.807 257.951 674.241 256.7 681.121 256.7C686.036 256.7 690.817 257.37 695.463 258.711C700.199 259.962 704.533 261.794 708.465 264.206C712.486 266.619 715.971 269.523 718.92 272.919L709.537 282.569C706.052 278.369 701.808 275.197 696.804 273.053C691.8 270.819 686.572 269.702 681.121 269.702C676.117 269.702 671.471 270.595 667.182 272.382C662.982 274.17 659.318 276.672 656.191 279.888C653.063 283.016 650.606 286.724 648.819 291.013C647.121 295.303 646.272 299.994 646.272 305.087C646.272 310.091 647.121 314.738 648.819 319.027C650.606 323.316 653.108 327.069 656.325 330.286C659.541 333.503 663.294 336.005 667.584 337.792C671.873 339.579 676.519 340.473 681.523 340.473C686.974 340.473 692.112 339.401 696.938 337.256C701.852 335.022 706.007 331.895 709.403 327.873L718.651 337.256C715.524 340.562 711.95 343.466 707.929 345.968C703.997 348.381 699.708 350.258 695.061 351.598C690.504 352.849 685.857 353.474 681.121 353.474ZM806.724 353.474C799.933 353.474 793.588 352.268 787.691 349.855C781.793 347.353 776.566 343.913 772.008 339.535C767.541 335.067 764.056 329.929 761.554 324.12C759.141 318.223 757.935 311.878 757.935 305.087C757.935 298.296 759.141 291.996 761.554 286.188C764.056 280.291 767.541 275.152 772.008 270.774C776.566 266.306 781.793 262.866 787.691 260.453C793.588 257.951 799.933 256.7 806.724 256.7C813.515 256.7 819.859 257.951 825.757 260.453C831.744 262.866 836.971 266.306 841.439 270.774C845.907 275.152 849.392 280.291 851.894 286.188C854.396 291.996 855.647 298.296 855.647 305.087C855.647 311.878 854.396 318.223 851.894 324.12C849.392 329.929 845.907 335.067 841.439 339.535C836.971 343.913 831.744 347.353 825.757 349.855C819.859 352.268 813.515 353.474 806.724 353.474ZM806.858 340.473C811.683 340.473 816.151 339.579 820.262 337.792C824.461 336.005 828.125 333.548 831.252 330.42C834.38 327.203 836.837 323.45 838.624 319.161C840.412 314.783 841.305 310.091 841.305 305.087C841.305 299.994 840.412 295.303 838.624 291.013C836.837 286.724 834.38 283.016 831.252 279.888C828.125 276.672 824.461 274.17 820.262 272.382C816.151 270.595 811.683 269.702 806.858 269.702C801.943 269.702 797.386 270.595 793.186 272.382C788.986 274.17 785.323 276.672 782.195 279.888C779.068 283.016 776.61 286.724 774.823 291.013C773.125 295.303 772.276 299.949 772.276 304.953C772.276 310.047 773.125 314.783 774.823 319.161C776.61 323.45 779.068 327.203 782.195 330.42C785.323 333.548 788.986 336.005 793.186 337.792C797.386 339.579 801.943 340.473 806.858 340.473ZM901.966 352V258.175H916.04V339.535H970.057V352H901.966Z" fill="#FF7043"/>
                </svg>
              </div>
            </div>
            <div class='join'>
              <h2>Congratulations 🎉</h2>
              <p>You have created a new UniRep attester.</p>
              <p>Clicking 'Join' adds a user to this attester's membership group.</p>
              <Button onClick={() => userContext.signup()}>Join</Button>
              <p>After joining, the member can interact with reputation in the attester's application. </p>
            </div>
          </div>
    )
  }

  return (
    <div className="container">
      <div className="info-container">
        <div class='icon'>
          <MdOutlineTimelapse color='YellowGreen' font-size='3.5em' />
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
        <div class='icon'>
          <BsPersonCircle color='YellowGreen' font-size='3em' />
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
        <div class='icon'>
          <HiShieldCheck color='YellowGreen' font-size='3.5em' />
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
              <div class='icon-sm'>
                <HiQuestionMarkCircle color='yellowgreen' font-size='.8em'/>
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
              <div class='icon-sm'>
                <HiQuestionMarkCircle color='yellowgreen' font-size='1em'/>
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
              <div class='icon-sm'>
                <HiQuestionMarkCircle color='yellowgreen' font-size='1em'/>
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
              <div class='icon-sm'>
                <HiQuestionMarkCircle color='yellowgreen' font-size='.8em'/>
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
        <div class='icon'>
          <MdPublishedWithChanges color='YellowGreen' font-size='4em' />
        </div>
        <div>
          <div className="title2">User state transition</div>
          <Button onClick={()=> userContext.stateTransition()}>Transition</Button>
        </div>
      </div>
    </div>
  )
})
