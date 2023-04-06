import React from 'react'
import './button.css'

type Props = {
    style?: { [key: string]: string }
    loadingText?: string
    onClick?: () => void
    children: any
}

export default ({ style, loadingText, onClick, children }: Props) => {
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState('')
    const handleClick = async () => {
        if (loading) return
        if (typeof onClick !== 'function') return
        try {
            setLoading(true)
            await onClick()
        } catch (err: any) {
            console.log(err)
            setError(err.toString())
            setTimeout(() => setError(''), 2000)
        } finally {
            setLoading(false)
        }
    }
    return (
        <div className="button-outer">
            <div
                className="button-inner"
                style={{ ...(style || {}) }}
                onClick={handleClick}
            >
                {!loading && !error ? children : null}
                {loading ? loadingText ?? 'Loading...' : null}
                {error ? error : null}
            </div>
        </div>
    )
}
