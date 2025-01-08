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

const generateInningsList = () => {
    const innings: string[] = [];
    for (let i = 1; i <= 9; i++) {
        innings.push(`Inning ${i}`);
    }
    return innings;
};

const NoHitter = ({ updateAppPage }) => {
    const [restOfMonthGridData, setRestOfMonthGridData] = useState({});
    const [noHitterPitchGridData, setNoHitterPitchGridData] = useState({});
    const [selectedPitchType, setSelectedPitchType] = useState("SL");
    const [pitchTypes, setPitchTypes] = useState([]);

    const fetchAndSetData = (url, setData) => {
        const getPitchTypesUsed = (pitchData) => {
            const pitchesUsed = new Set(pitchTypes);
            for (const pitch of pitchData) {
                if (pitch.pitch_type !== null) {
                    pitchesUsed.add(pitch.pitch_type);
                }
            }

            setPitchTypes((prevPitchTypes) => [
                ...new Set([...prevPitchTypes, ...pitchesUsed]),
            ]);
        };

        fetch(url)
            .then((res) => res.json())
            .then((pitchData) => {
                const pitchTypeStats: PitchTypeStats =
                    compilePitchTypeData(pitchData);
                Object.values(pitchTypeStats).forEach((inningData) => {
                    Object.values(inningData).forEach((data) => {
                        if (data.countSpeed > 0) {
                            data.averageSpeed =
                                data.totalSpeed / data.countSpeed;
                            data.averageSpinRate = Math.round(
                                data.totalSpinRate / data.countSpeed
                            );
                        }
                    });
                });
                setData(pitchTypeStats);
                getPitchTypesUsed(pitchData);
            });
    };

    useEffect(() => {
        fetchAndSetData("/pitchdata/no_hitter", setNoHitterPitchGridData);
        fetchAndSetData(
            "/pitchdata/no_hitter/rest_of_month",
            setRestOfMonthGridData
        );
    }, []);

    const compilePitchTypeData = (pitchData) => {
        const stats = {};

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
            if (!stats[inning]) {
                stats[inning] = {};
            }

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
        }

        return stats;
    };

    const renderPitchingDataTable = (rawData, header) => {
        const innings = generateInningsList();
        const rows = [
            { key: "thrown", label: "Thrown" },
            { key: "averageSpeed", label: "Average Speed" },
            { key: "averageSpinRate", label: "Average Spin Rate" },
            { key: "calledStrikes", label: "Called Strikes" },
            { key: "swingAndMiss", label: "Swing and Miss" },
            { key: "balls", label: "Balls" },
        ];

        return (
            <div className="grid-section">
                <h2>{header}</h2>
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
                        {rows.map((row) => (
                            <tr key={row.key}>
                                <td>{row.label}</td>
                                {innings.map((inning, index) => {
                                    const inningData =
                                        rawData[
                                            inning.replace("Inning ", "")
                                        ] || {};
                                    const pitchData =
                                        inningData[selectedPitchType] || {};
                                    const value =
                                        row.key === "averageSpeed"
                                            ? pitchData.averageSpeed?.toFixed(
                                                  2
                                              ) || 0
                                            : pitchData[row.key] || 0;
                                    return <td key={index}>{value}</td>;
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>{" "}
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
                restOfMonthGridData,
                "Rest of Cease's Month"
            )}
        </div>
    );
};

export default NoHitter;
