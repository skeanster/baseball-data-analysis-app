import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import "./BatterPerformance.css";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const generateRandomColor = () => {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
};

const BatterPerformance = () => {
    const [selectedBatter, setSelectedBatter] = useState("");
    const [battersList, setBattersList] = useState([]);
    const [pitchTypeChartData, setPitchTypeChartData] = useState({
        labels: [],
        datasets: [{ data: [], backgroundColor: [] }],
    });
    const [hitTypePieData, setHitTypePieData] = useState({
        labels: [],
        datasets: [{ data: [], backgroundColor: [] }],
    });
    const [gridMetrics, setGridMetrics] = useState({
        totalPitchesSeen: 0,
        totalSwings: 0,
        totalInZoneSwung: 0,
        totalHitExitSpeed90SwingTrueFoulFalse: 0,
    });

    // get list of batters on mount
    useEffect(() => {
        const fetchBatters = async () => {
            const response = await fetch("/pitchdata/padres_batters");
            const data = await response.json();
            setBattersList(data);
            setSelectedBatter(data[0]?.batter_id || "");
        };
        fetchBatters();
    }, []);

    // fetch data for that batter when selection changes
    useEffect(() => {
        if (!selectedBatter) return;

        const getBatterData = async () => {
            const response = await fetch("/pitchdata/padres_batters", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestHitterData: selectedBatter }),
            });
            const batterData = await response.json();
            generateGridData(batterData);
            generatePieCharts(batterData);
        };

        getBatterData();
    }, [selectedBatter]);

    const generateGridData = (batterData) => {
        let pitchesSeen = 0;
        let inZoneSwung = 0;
        let hitExitSpeed90SwingTrueFoulFalse = 0;
        let swings = 0;

        for (const pitch of batterData) {
            if (pitch.is_pitch === "TRUE") {
                pitchesSeen++;

                if (pitch.swing === "TRUE") swings++;

                if (pitch.in_zone === "TRUE" && pitch.swing === "TRUE")
                    inZoneSwung++;

                if (
                    pitch.hit_exit_speed > 90 &&
                    pitch.swing === "TRUE" &&
                    pitch.foul === "FALSE"
                )
                    hitExitSpeed90SwingTrueFoulFalse++;
            }
        }

        setGridMetrics({
            totalPitchesSeen: pitchesSeen,
            totalSwings: swings,
            totalInZoneSwung: inZoneSwung,
            totalHitExitSpeed90SwingTrueFoulFalse:
                hitExitSpeed90SwingTrueFoulFalse,
        });
    };

    const generatePieCharts = (batterData) => {
        const pitchTypeCounts = {};
        const hitTrajectoryCounts = {};

        for (const pitch of batterData) {
            if (pitch.swing === "TRUE") {
                pitchTypeCounts[pitch.pitch_type] =
                    (pitchTypeCounts[pitch.pitch_type] || 0) + 1;
            }

            if (pitch.hit_trajectory) {
                hitTrajectoryCounts[pitch.hit_trajectory] =
                    (hitTrajectoryCounts[pitch.hit_trajectory] || 0) + 1;
            }
        }

        const pitchLabels = Object.keys(pitchTypeCounts);
        const pitchData = Object.values(pitchTypeCounts);
        const hitLabels = Object.keys(hitTrajectoryCounts);
        const hitData = Object.values(hitTrajectoryCounts);

        setPitchTypeChartData({
            labels: pitchLabels,
            datasets: [
                {
                    data: pitchData,
                    backgroundColor: pitchData.map(generateRandomColor),
                },
            ],
        });

        setHitTypePieData({
            labels: hitLabels,
            datasets: [
                {
                    data: hitData,
                    backgroundColor: hitData.map(generateRandomColor),
                },
            ],
        });
    };

    const renderPieChart = (data, label) => {
        if (data.datasets[0].data.length === 0) return <></>;

        return (
            <div className="pieChartContainer">
                <Pie
                    data={data}
                    options={{
                        plugins: {
                            title: {
                                display: true,
                                text: label,
                            },
                        },
                        cutout: "60%",
                    }}
                />
            </div>
        );
    };

    const renderHitterDataTable = () => {
        return (
            <table>
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Count</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Pitches Seen</td>
                        <td>{gridMetrics.totalPitchesSeen}</td>
                    </tr>
                    <tr>
                        <td>Swings</td>
                        <td>{gridMetrics.totalSwings}</td>
                    </tr>
                    <tr>
                        <td>Swung at a pitch in the zone</td>
                        <td>{gridMetrics.totalInZoneSwung}</td>
                    </tr>
                    <tr>
                        <td>Balls in play with {">"} 90 exit speed</td>
                        <td>
                            {gridMetrics.totalHitExitSpeed90SwingTrueFoulFalse}
                        </td>
                    </tr>
                </tbody>
            </table>
        );
    };

    return (
        <div className="batterPerformanceContainer">
            <div className="pitchTypeSelector">
                <label htmlFor="pitchType">Select Batter: </label>
                <select
                    id="pitchType"
                    value={selectedBatter}
                    onChange={(e) => setSelectedBatter(e.target.value)}
                >
                    {battersList.map(({ batter_id, batter_name }) => (
                        <option key={batter_id} value={batter_id}>
                            {batter_name}
                        </option>
                    ))}
                </select>
            </div>
            {renderHitterDataTable()}
            <div className="pieChartsOuterContainer">
                {renderPieChart(
                    pitchTypeChartData,
                    "# of Times Swung at Each Pitch Type"
                )}
                {renderPieChart(hitTypePieData, "# of Each Hit Type")}
            </div>
        </div>
    );
};

export default BatterPerformance;
