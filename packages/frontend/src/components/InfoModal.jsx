import React from 'react'
import './infoModal.css'

const info = [
    'This is info about Epochs.',
    'This is info about Reputation.',
    'This is info about Provable Reputation.',
    'This is info about RequestingReputation.',
    'This is info about Graffiti.',
    'This is info about Epoch Keys.',
    'This is info about Generating Proofs.',
    'This is info about User State Transistion.',
]

export default ({ index }) => {
    return (
        <div className='modal'>
            {info[index]}
        </div>
    )
}