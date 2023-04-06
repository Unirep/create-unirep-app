import React, { useState, useEffect } from 'react'
import measureText from '../utils/measure-text'
import './tooltip.css'
import UIContext from '../contexts/interface'
import { observer } from 'mobx-react-lite'

type Props = {
    text: string
    maxWidth?: number
}

export default observer(({ text, maxWidth, ...props }: Props) => {
    const ui = React.useContext(UIContext)
    const containerEl: React.RefObject<any> = React.createRef()
    const [timer, setTimer] = useState<any>(null)
    const [showingPopup, setShowingPopup] = useState<boolean>(false)
    const [leftOffset, setLeftOffset] = useState<number>(0)
    const [textWidth, setTextWidth] = useState<number>(0)
    useEffect(() => {
        const _textWidth = measureText(text, {
            fontSize: '12px',
            fontWeight: 'normal',
        })
        const _maxWidth = maxWidth ?? 200
        const calcWidth = Math.min(_maxWidth, _textWidth)
        setTextWidth(calcWidth)
        const { x } = containerEl.current.getBoundingClientRect()
        const screenMaxWidth = window.innerWidth - x
        const minWidth = _maxWidth + 20
        setLeftOffset(screenMaxWidth > minWidth ? 0 : minWidth - screenMaxWidth)
    })

    const onMouseEnter = () => {
        if (!ui.isMobile) {
            setShowingPopup(true)
        }
    }

    const onMouseLeave = () => {
        if (!ui.isMobile) {
            setShowingPopup(false)
        }
    }

    return (
        <div
            onMouseDown={() => {
                if (!ui.isMobile) return
                if (timer) clearTimeout(timer)
                if (showingPopup) {
                    setShowingPopup(false)
                    return
                }
                setShowingPopup(true)
                const _timer: ReturnType<typeof setTimeout> = setTimeout(() => {
                    setShowingPopup(false)
                    setTimer(null)
                }, 3000)
                setTimer(_timer)
            }}
            className="tooltip-outer"
            ref={containerEl}
            {...props}
        >
            <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
                <img
                    src={require('../../public/info_icon.svg')}
                    alt="info icon"
                />
            </div>
            {showingPopup && (
                <div
                    className={`tooltip-popup ${ui.modeCssClass}`}
                    style={{
                        width: `${textWidth}px`,
                        left: `-${leftOffset}px`,
                    }}
                >
                    <div className={`tooltip-inner ${ui.modeCssClass}`}>
                        {text}
                    </div>
                </div>
            )}
        </div>
    )
})
