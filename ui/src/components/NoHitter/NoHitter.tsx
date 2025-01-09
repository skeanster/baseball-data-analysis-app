import React, { useEffect, useState } from "react";
import "./NoHitter.css";
import { PITCH_RESULT } from "../../constants";

interface PitchTypeStats {
    [inning: string]: {
        [pitchType: string]: {
            thrown: number;
            balls: number;
            calledStrikes: number;
            totalSpeed: number;
            countSpeed: number;
            averageSpeed?: number;
            totalSpinRate: number;
            averageSpinRate?: number;
        };
    };
}

const NoHitter = () => {
    const [restMonthGridData, setRestMonthGridData] = useState({});
    const [noHitterPitchGridData, setNoHitterPitchGridData] = useState({});
    const [selectedPitchType, setSelectedPitchType] = useState("SL");
    const [pitchTypes, setPitchTypes] = useState([]);

    const fetchAndSetData = async (url, setData, requestWholeMonth) => {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ requestWholeMonth: requestWholeMonth }),
        });
        const pitchData = await response.json();
        const pitchTypeStats: PitchTypeStats = compilePitchTypeData(pitchData);

        Object.values(pitchTypeStats).forEach((inningData) => {
            Object.values(inningData).forEach((data) => {
                if (data.countSpeed > 0) {
                    data.averageSpeed = data.totalSpeed / data.countSpeed;
                    data.averageSpinRate = Math.round(
                        data.totalSpinRate / data.countSpeed
                    );
                }
            });
        });
        setData(pitchTypeStats);
    };

    useEffect(() => {
        fetchAndSetData(
            "/pitchdata/no_hitter",
            setNoHitterPitchGridData,
            false
        );
        fetchAndSetData("/pitchdata/no_hitter", setRestMonthGridData, true);
    }, []);

    const compilePitchTypeData = (pitchData) => {
        const stats = {};
        const pitchesUsed = new Set(pitchTypes);

        for (const pitch of pitchData) {
            const {
                inning,
                pitch_type,
                pitch_result,
                rel_speed,
                called_strike,
                swinging_strike,
                spin_rate,
            } = pitch;

            // create an object for each inning
            if (!stats[inning]) stats[inning] = {};

            // create an object for each pitch type used in that inning
            if (!stats[inning][pitch_type]) {
                stats[inning][pitch_type] = {
                    thrown: 0,
                    balls: 0,
                    calledStrikes: 0,
                    swingAndMiss: 0,
                    totalSpeed: 0,
                    totalSpinRate: 0,
                    countSpeed: 0,
                };
            }

            const pitchStats = stats[inning][pitch_type];
            pitchStats.thrown++;
            if (pitch_result === PITCH_RESULT.ball) pitchStats.balls++;
            if (called_strike === "TRUE") pitchStats.calledStrikes++;
            if (
                swinging_strike === "TRUE" &&
                pitch_result !== PITCH_RESULT.foul_tip
            ) {
                pitchStats.swingAndMiss++;
            }
            pitchStats.totalSpeed += rel_speed;
            pitchStats.totalSpinRate += spin_rate;
            pitchStats.countSpeed++;

            if (pitch.pitch_type !== null) pitchesUsed.add(pitch.pitch_type);
        }

        setPitchTypes((prevPitchTypes) => [
            ...new Set([...prevPitchTypes, ...pitchesUsed]),
        ]);

        return stats;
    };

    const renderPitchingDataTable = (rawData, header) => {
        const rows = [
            { key: "thrown", label: "Thrown" },
            { key: "averageSpeed", label: "Average Speed" },
            { key: "averageSpinRate", label: "Average Spin Rate" },
            { key: "calledStrikes", label: "Called Strikes" },
            { key: "swingAndMiss", label: "Swing and Miss" },
            { key: "balls", label: "Balls" },
        ];

        const renderInningHeaders = () => {
            const cells = [];
            for (let i = 1; i <= 9; i++) {
                cells.push(<th key={i}>Inning {i}</th>);
            }
            return cells;
        };

        const renderInningCells = (rowKey) => {
            const cells = [];
            for (let i = 1; i <= 9; i++) {
                const inningData = rawData[i] || {};
                const inningPitchData = inningData[selectedPitchType] || {};
                const value =
                    rowKey === "averageSpeed"
                        ? inningPitchData.averageSpeed?.toFixed(2) || 0
                        : inningPitchData[rowKey] || 0;
                cells.push(<td key={i}>{value}</td>);
            }
            return cells;
        };

        return (
            <div className="grid-section">
                <h2>{header}</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Metrics</th>
                            {renderInningHeaders()}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.key}>
                                <td>{row.label}</td>
                                {renderInningCells(row.key)}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="grid">
            <div className="pitchTypeSelector">
                <label htmlFor="pitchType">Select Pitch Type: </label>
                <select
                    id="pitchType"
                    value={selectedPitchType}
                    onChange={(e) => setSelectedPitchType(e.target.value)}
                >
                    {pitchTypes.map((pitchType) => (
                        <option key={pitchType} value={pitchType}>
                            {pitchType}
                        </option>
                    ))}
                </select>
            </div>

            {renderPitchingDataTable(noHitterPitchGridData, "No Hitter")}
            {renderPitchingDataTable(
                restMonthGridData,
                "Rest of Cease's Month"
            )}
        </div>
    );
};

export default NoHitter;
