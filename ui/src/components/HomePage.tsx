import React from "react";
import { PAGES } from "../constants";

const HomePage = ({ updateAppPage }) => {
    return (
        <div className="homepageContainer">
            <div className="homeTextContainer">
                <div className="mainTitle">Padres Pitching Data, July 2024</div>
                <div className="subMainTitle">
                    Start by exploring Dylan Cease's no hitter
                </div>
                <div>
                    <button
                        className="mainShopButton"
                        onClick={() => updateAppPage(PAGES.no_hitter)}
                    >
                        Explore No Hitter
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
