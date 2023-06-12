import React from 'react'
import { observer } from 'mobx-react-lite'
import './dashboard.css'
import Button from '../components/Button'
import Tooltip from '../components/Tooltip'

import User from '../contexts/User'

type ReqInfo = {
    nonce: number
}

type ProofInfo = {
    publicSignals: string[]
    proof: string[]
    valid: boolean
}

export default observer(() => {
    const userContext = React.useContext(User)
    const [remainingTime, setRemainingTime] = React.useState<number | string>(0)
    const [reqData, setReqData] = React.useState<{
        [key: number]: number | string
    }>({})
    const [reqInfo, setReqInfo] = React.useState<ReqInfo>({ nonce: 0 })
    const [proveData, setProveData] = React.useState<{
        [key: number]: number | string
    }>({})
    const [repProof, setRepProof] = React.useState<ProofInfo>({
        publicSignals: [],
        proof: [],
        valid: false,
    })

    const updateTimer = () => {
        if (!userContext.userState) {
            setRemainingTime('Loading...')
            return
        }
        const time = userContext.userState.sync.calcEpochRemainingTime()
        setRemainingTime(time)
    }

    const fieldType = (i: number) => {
        if (i < userContext.sumFieldCount) {
            return 'sum'
        } else return 'replace'
    }

    React.useEffect(() => {
        setInterval(() => {
            updateTimer()
        }, 1000)
    }, [])

    if (!userContext.userState) {
        return <div className="container">Loading...</div>
    }

    return (
        <div>
            <h1>Dashboard</h1>
            <div className="container">
                <div className="info-container">
                    <div className="info-item">
                        <h3>Epoch</h3>
                        <Tooltip
                            text={`An epoch is a unit of time, defined by the attester, with a state tree and epoch tree. User epoch keys are valid for 1 epoch before they change.`}
                        />
                    </div>
                    <div className="info-item">
                        <div>Current epoch #</div>
                        <div className="stat">
                            {userContext.userState?.sync.calcCurrentEpoch()}
                        </div>
                    </div>
                    <div className="info-item">
                        <div>Remaining time</div>
                        <div className="stat">{remainingTime}</div>
                    </div>
                    <div className="info-item">
                        <div>Latest transition epoch</div>
                        <div className="stat">
                            {userContext.latestTransitionedEpoch}
                        </div>
                    </div>

                    <hr />

                    <div className="info-item">
                        <h3>Latest Data</h3>
                        <Tooltip text="This is all the data the user has received. The user cannot prove data from the current epoch." />
                    </div>
                    {userContext.data.map((data, i) => {
                        if (i < userContext.sumFieldCount) {
                            return (
                                <div key={i} className="info-item">
                                    <div>Data {i}</div>
                                    <div className="stat">
                                        {(data || 0).toString()}
                                    </div>
                                </div>
                            )
                        } else {
                            return (
                                <div key={i} className="info-item">
                                    <div>Data {i}</div>
                                    <div className="stat">
                                        {(
                                            data % BigInt(2 ** 206) || 0
                                        ).toString()}
                                    </div>
                                </div>
                            )
                        }
                    })}

                    <br />

                    <div className="info-item">
                        <h3>Provable Data</h3>
                        <Tooltip text="This is the data the user has received up until their last transitioned epoch. This data can be proven in ZK." />
                    </div>
                    {userContext.provableData.map((data, i) => {
                        if (i < userContext.sumFieldCount) {
                            return (
                                <div key={i} className="info-item">
                                    <div>Data {i}</div>
                                    <div className="stat">
                                        {(data || 0).toString()}
                                    </div>
                                </div>
                            )
                        } else {
                            return (
                                <div key={i} className="info-item">
                                    <div>Data {i}</div>
                                    <div className="stat">
                                        {(
                                            data % BigInt(2 ** 206) || 0
                                        ).toString()}
                                    </div>
                                </div>
                            )
                        }
                    })}
                </div>

                <div style={{ display: 'flex' }}>
                    <div className="action-container">
                        <div className="icon">
                            <h2>Change Data</h2>
                            <Tooltip text="You can request changes to data here. The demo attester will freely change your data." />
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                justifyContent: 'flex-start',
                            }}
                        >
                            {Array(
                                userContext.userState.sync.settings.fieldCount
                            )
                                .fill(0)
                                .map((_, i) => {
                                    return (
                                        <div key={i} style={{ margin: '4px' }}>
                                            <p>
                                                Data {i} ({fieldType(i)})
                                            </p>
                                            <input
                                                value={reqData[i] ?? ''}
                                                onChange={(event) => {
                                                    if (
                                                        !/^\d*$/.test(
                                                            event.target.value
                                                        )
                                                    )
                                                        return
                                                    setReqData(() => ({
                                                        ...reqData,
                                                        [i]: event.target.value,
                                                    }))
                                                }}
                                            />
                                        </div>
                                    )
                                })}
                        </div>
                        <div className="icon">
                            <p style={{ marginRight: '8px' }}>
                                Epoch key nonce
                            </p>
                            <Tooltip text="Epoch keys are short lived identifiers for a user. They can be used to receive data and are valid only for 1 epoch." />
                        </div>
                        <select
                            value={reqInfo.nonce ?? 0}
                            onChange={(event) => {
                                setReqInfo((v) => ({
                                    ...v,
                                    nonce: Number(event.target.value),
                                }))
                            }}
                        >
                            <option value="0">0</option>
                            <option value="1">1</option>
                            {/* TODO: <option value="2">2</option> */}
                        </select>
                        <p style={{ fontSize: '12px' }}>
                            Requesting data with epoch key:
                        </p>
                        <p
                            style={{
                                maxWidth: '650px',
                                wordBreak: 'break-all',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {userContext.epochKey(reqInfo.nonce ?? 0)}
                        </p>

                        <Button
                            onClick={async () => {
                                if (
                                    userContext.userState &&
                                    userContext.userState.sync.calcCurrentEpoch() !==
                                        (await userContext.userState.latestTransitionedEpoch())
                                ) {
                                    throw new Error('Needs transition')
                                }
                                await userContext.requestData(
                                    reqData,
                                    reqInfo.nonce ?? 0
                                )
                                setReqData({})
                            }}
                        >
                            Attest
                        </Button>
                    </div>

                    <div className="action-container transition">
                        <div className="icon">
                            <h2>User State Transition</h2>
                            <Tooltip
                                text={`The user state transition allows a user to insert a state tree leaf into the latest epoch. The user sums all the data they've received in the past and proves it in ZK.`}
                            />
                        </div>
                        <Button onClick={() => userContext.stateTransition()}>
                            Transition
                        </Button>
                    </div>

                    <div className="action-container">
                        <div className="icon">
                            <h2>Prove Data</h2>
                            <Tooltip text="Users can prove they control some amount of data without revealing exactly how much they control." />
                        </div>
                        {Array(
                            userContext.userState.sync.settings.sumFieldCount
                        )
                            .fill(0)
                            .map((_, i) => {
                                return (
                                    <div key={i} style={{ margin: '4px' }}>
                                        <p>
                                            Data {i} ({fieldType(i)})
                                        </p>
                                        <input
                                            value={proveData[i] ?? '0'}
                                            onChange={(event) => {
                                                if (
                                                    !/^\d*$/.test(
                                                        event.target.value
                                                    )
                                                )
                                                    return
                                                setProveData(() => ({
                                                    ...proveData,
                                                    [i]: event.target.value,
                                                }))
                                            }}
                                        />
                                    </div>
                                )
                            })}
                        <div style={{ margin: '20px 0 20px' }}>
                            <Button
                                onClick={async () => {
                                    try {
                                        const proof =
                                            await userContext.proveData(
                                                proveData
                                            )
                                        setRepProof(proof)
                                    } catch (error) {
                                        console.log(error)
                                        alert(
                                            'Invalid Proof. You are attempting to prove more data than you have received. Check your provable data, transition if necessary, and try again'
                                        )
                                    }
                                }}
                            >
                                Generate Proof
                            </Button>
                        </div>
                        {repProof.valid ? (
                            <>
                                <div>
                                    Is proof valid?{' '}
                                    <span style={{ fontWeight: '600' }}>
                                        {' '}
                                        {repProof.proof.length === 0
                                            ? ''
                                            : repProof.valid.toString()}
                                    </span>
                                </div>
                                <textarea
                                    readOnly
                                    value={JSON.stringify(repProof, null, 2)}
                                />
                            </>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    )
})
