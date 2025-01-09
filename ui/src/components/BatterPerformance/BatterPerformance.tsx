import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import "./BatterPerformance.css";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const generateRandomColor = () => {
    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    return randomColor;
};

const BatterPerformance = () => {
    const [selectedBatter, setSelectedBatter] = useState("");
    const [battersList, setBattersList] = useState([]);
    const [totalPitchesSeen, setTotalPitchesSeen] = useState(0);
    const [metrics, setMetrics] = useState({
        totalSwings: 0,
        totalInZoneSwung: 0,
        totalHitExitSpeed85SwingTrueFoulFalse: 0,
    });
    const [pieChartData, setPieChartData] = useState({
        labels: [],
        datasets: [{ data: [], backgroundColor: [] }],
    });

    useEffect(() => {
        // Fetch batters list on mount
        const fetchBatters = async () => {
            const response = await fetch("/pitchdata/padres_batters");
            const data = await response.json();
            setBattersList(data);
            setSelectedBatter(data[0].batter_id);
        };
        fetchBatters();
    }, []);

    useEffect(() => {
        if (!selectedBatter) return;

        const getBatterData = async () => {
            const response = await fetch("/pitchdata/padres_batters", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestHitterData: selectedBatter }),
            });
            const batterData = await response.json();
            processBatterData(batterData);
            generatePieChartData(batterData);
        };

        getBatterData();
    }, [selectedBatter]);

    const processBatterData = (batterData) => {
        let pitchesSeen = 0;
        let inZoneSwung = 0;
        let hitExitSpeed85SwingTrueFoulFalse = 0;
        let swings = 0;

        for (const pitch of batterData) {
            if (pitch.is_pitch === "TRUE") {
                pitchesSeen++;

                if (pitch.swing === "TRUE") {
                    swings++;
                }

                if (pitch.in_zone === "TRUE" && pitch.swing === "TRUE") {
                    inZoneSwung++;
                }

                if (
                    pitch.hit_exit_speed > 90 &&
                    pitch.swing === "TRUE" &&
                    pitch.foul === "FALSE"
                ) {
                    hitExitSpeed85SwingTrueFoulFalse++;
                }
            }
        }

        setTotalPitchesSeen(pitchesSeen);
        setMetrics({
            totalSwings: swings,
            totalInZoneSwung: inZoneSwung,
            totalHitExitSpeed85SwingTrueFoulFalse:
                hitExitSpeed85SwingTrueFoulFalse,
        });
    };

    const generatePieChartData = (batterData) => {
        const swingData = batterData.filter((pitch) => pitch.swing === "TRUE");

        const pitchTypeCounts = swingData.reduce((acc, pitch) => {
            acc[pitch.pitch_type] = (acc[pitch.pitch_type] || 0) + 1;
            return acc;
        }, {});

        const labels = Object.keys(pitchTypeCounts);
        const data = Object.values(pitchTypeCounts);
        const backgroundColor = labels.map(generateRandomColor); // generate a random color for each pie slice

        setPieChartData({
            labels: labels,
            datasets: [
                {
                    data: data,
                    backgroundColor: backgroundColor,
                },
            ],
        });
    };

    const renderPieChart = () => {
        return (
            <div className="pieChartContainer">
                {" "}
                <div className="pieChartLabel"></div>
                {pieChartData.datasets &&
                    pieChartData.datasets[0].data.length > 0 && (
                        <Pie
                            data={pieChartData}
                            options={{
                                plugins: {
                                    title: {
                                        display: true,
                                        text: "# of Times Swung at Each Pitch Type",
                                    },
                                },
                                cutout: "60%",
                            }}
                        />
                    )}
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
                        <td>{totalPitchesSeen}</td>
                    </tr>
                    <tr>
                        <td>Swings</td>
                        <td>{metrics.totalSwings}</td>
                    </tr>
                    <tr>
                        <td>Swung at a pitch in the zone</td>
                        <td>{metrics.totalInZoneSwung}</td>
                    </tr>
                    <tr>
                        <td>Balls in play with {">"} 90 exit speed</td>
                        <td>{metrics.totalHitExitSpeed85SwingTrueFoulFalse}</td>
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
            {renderPieChart()}
        </div>
    );
};

export default BatterPerformance;
