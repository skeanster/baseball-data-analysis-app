import React from "react";
import githubLogo from "../assets/github.svg";
import { PAGES } from "../constants";

const Navbar = ({ updateAppPage }) => {
    return (
        <div className="navbarContainer">
            <div className="navbar">
                <a
                    href="https://github.com/skeanster"
                    target="_blank"
                    rel="noreferrer"
                    id="footerGithub"
                >
                    <img className="logo" src={githubLogo} alt="github icon" />
                </a>
                <div className="navItemsContainer">
                    <div>
                        <div
                            className="navItems"
                            id="home"
                            onClick={() => updateAppPage(PAGES.home)}
                        >
                            Home
                        </div>
                    </div>
                    <div>
                        <div
                            className="navItems"
                            id="products"
                            onClick={() => updateAppPage(PAGES.no_hitter)}
                        >
                            No Hitter
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
