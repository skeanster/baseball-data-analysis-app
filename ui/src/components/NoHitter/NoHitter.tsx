import React, { useEffect, useState } from "react";
import "./NoHitter.css";

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

const compilePitchTypeData = (pitchData) => {
    return pitchData.reduce(
        (
            stats,
            {
                inning,
                pitch_type,
                pitch_result,
                rel_speed,
                called_strike,
                swinging_strike,
                spin_rate,
            }
        ) => {
            if (!stats[inning]) stats[inning] = {};
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
            pitchStats.thrown += 1;
            if (pitch_result === "Ball") pitchStats.balls += 1;
            if (called_strike === "TRUE") pitchStats.calledStrikes += 1;
            if (swinging_strike === "TRUE" && pitch_result !== "Foul Tip")
                pitchStats.swingAndMiss += 1;
            pitchStats.totalSpeed += rel_speed;
            pitchStats.totalSpinRate += spin_rate;
            pitchStats.countSpeed += 1;

            return stats;
        },
        {}
    );
};

const NoHitter = ({ updateAppPage }) => {
    const [pitchTypeGridData, setPitchTypeGridData] = useState({});
    const [selectedPitchType, setSelectedPitchType] = useState("SL");
    const [pitchTypes, setPitchTypes] = useState([]);

    useEffect(() => {
        fetch("/pitchdata/no_hitter")
            .then((res) => res.json())
            .then((pitchData) => {
                const pitchTypeStats: PitchTypeStats =
                    compilePitchTypeData(pitchData);
                Object.values(pitchTypeStats).forEach((inningData) =>
                    Object.values(inningData).forEach((data) => {
                        if (data.countSpeed > 0)
                            data.averageSpeed =
                                data.totalSpeed / data.countSpeed;
                        if (data.countSpeed > 0)
                            data.averageSpinRate = Math.round(
                                data.totalSpinRate / data.countSpeed
                            );
                    })
                );
                setPitchTypeGridData(pitchTypeStats);
                // @ts-ignore todo: make interface
                setPitchTypes([
                    ...new Set(
                        pitchData
                            .map((pitch) => pitch.pitch_type)
                            .filter(Boolean)
                    ),
                ]);
            });
    }, []);

    const innings = Array.from(
        { length: 9 },
        (_, index) => `Inning ${index + 1}`
    );
    const rows = [
        { key: "thrown", label: "Thrown" },
        { key: "averageSpeed", label: "Average Speed" },
        { key: "averageSpinRate", label: "Average Spin Rate" },
        { key: "calledStrikes", label: "Called Strikes" },
        { key: "swingAndMiss", label: "Swing and Miss" },
        { key: "balls", label: "Balls" },
    ];

    return (
        <div className="grid">
            <div className="pitchTypeSelector">
                <label htmlFor="pitchType">Select Pitch Type: </label>
                <select
                    id="pitchType"
                    value={selectedPitchType}
                    onChange={(e) => setSelectedPitchType(e.target.value)}
                >
                    {pitchTypes.map((pitchType, index) => (
                        <option key={index} value={pitchType}>
                            {pitchType}
                        </option>
                    ))}
                </select>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Metrics</th>
                        {innings.map((inning, index) => (
                            <th key={index}>{inning}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            <td>{row.label}</td>
                            {innings.map((inning, inningIndex) => {
                                const inningData =
                                    pitchTypeGridData[
                                        inning.replace("Inning ", "")
                                    ] || {};
                                const pitchData =
                                    inningData[selectedPitchType] || {};
                                const value =
                                    row.key === "averageSpeed"
                                        ? pitchData.averageSpeed?.toFixed(2) ||
                                          0
                                        : pitchData[row.key] || 0;

                                return <td key={inningIndex}>{value}</td>;
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default NoHitter;
