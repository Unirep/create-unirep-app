import React from 'react'
import { observer } from 'mobx-react-lite'
import User from '../contexts/User'

export default observer(({ input }) => {
  const userContext = React.useContext(User)
  return input.map((data, i) => (
    <div key={i} className='info-item'>
      <div>Data {i}</div>
      {
        i >= userContext.userState?.sync.settings.sumFieldCount ? (
          <div className='stat'>
            <span>{(BigInt(data ?? 0) >> BigInt(254-userContext.userState?.sync.settings.replNonceBits)).toString()}</span>
            <span>:</span>
            <span>{(BigInt(data ?? 0) & (2n**BigInt(254-userContext.userState?.sync.settings.replNonceBits) - 1n)).toString()}</span>
          </div>
          ) : (
          <div className='stat'>{(data || 0).toString()}</div>
          )
      }
    </div>
  ))
})
