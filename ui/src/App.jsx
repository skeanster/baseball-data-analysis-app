import React, { useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import NoHitter from "./components/NoHitter";
import { PAGES } from "./constants";
function App() {
    const [page, setPage] = useState("home");

    const updateAppPage = (newState) => {
        setPage(newState);
    };

    const renderCurrentPage = () => {
        switch (page) {
            case PAGES.home:
                return <HomePage updateAppPage={updateAppPage} />;
            case PAGES.no_hitter:
                return <NoHitter />;
            default:
                return <div></div>;
        }
    };

    return (
        <>
            <Navbar updateAppPage={updateAppPage} />
            {renderCurrentPage()}
        </>
    );
}

export default App;
