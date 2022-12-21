import React from "react";
import { Outlet, Link } from "react-router-dom";
import './header.css'

export default () => {
    return (
        <>
            <div className="header">
                <img src={require('../../public/logo.svg')} alt="UniRep logo"/>
                <div className="links">
                    <a href="https://developer.unirep.io/" target='blank'>Docs</a>
                    <a href="https://github.com/Unirep" target='blank'>GitHub</a>
                    <a href="https://discord.com/invite/VzMMDJmYc5" target='blank'>Discord</a>
                </div>
            </div>

            <Outlet />
        </>
        
    )
}
