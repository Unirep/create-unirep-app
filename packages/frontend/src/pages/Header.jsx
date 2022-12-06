import React from "react";
import { Outlet, Link } from "react-router-dom";
import './header.css'
import Logo from "../components/Logo";

export default () => {
    return (
        <>
            <div className="header">
                <Logo />
                <div className="links">
                    <a href="https://docs.unirep.io/introduction">Docs</a>
                    <a href="https://github.com/Unirep">GitHub</a>
                    <a href="https://discord.com/invite/VzMMDJmYc5">Discord</a>
                </div>
            </div>

            <Outlet />
        </>
        
    )
}
