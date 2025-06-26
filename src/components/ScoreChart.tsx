import React, { useMemo } from "react";
import { ResponsiveLine } from "@nivo/line";
import { useScoreStore } from "../stores/scoreStore";
import type { LineChartData } from "../types";

interface ScoreChartProps {
  courseFilter?: string;
  dateRange?: { start: string; end: string };
}

export const ScoreChart: React.FC<ScoreChartProps> = ({
  courseFilter,
  dateRange,
}) => {
  const { scores, getScoresByDateRange, getScoresByCourse } = useScoreStore();

  const chartData: LineChartData[] = useMemo(() => {
    let filteredScores = scores;

    if (dateRange) {
      filteredScores = getScoresByDateRange(dateRange.start, dateRange.end);
    }

    if (courseFilter) {
      filteredScores = getScoresByCourse(courseFilter);
    }

    // コース別にデータを分類
    const courseData: Record<string, LineChartData> = {};

    filteredScores.forEach((score) => {
      if (!courseData[score.course]) {
        courseData[score.course] = {
          id: score.course,
          data: [],
        };
      }

      courseData[score.course].data.push({
        x: score.date,
        y: score.result,
      });
    });

    // 日付順にソート
    Object.values(courseData).forEach((course) => {
      course.data.sort(
        (a, b) => new Date(a.x).getTime() - new Date(b.x).getTime()
      );
    });

    return Object.values(courseData);
  }, [
    scores,
    courseFilter,
    dateRange,
    getScoresByDateRange,
    getScoresByCourse,
  ]);

  if (chartData.length === 0) {
    return (
      <div className="chart-container">
        <div className="no-data">
          <p>表示するデータがありません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3>スコア推移</h3>
      <div style={{ height: "400px" }}>
        <ResponsiveLine
          data={chartData}
          margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
          xScale={{ type: "point" }}
          yScale={{
            type: "linear",
            min: "auto",
            max: "auto",
            stacked: false,
            reverse: false,
          }}
          yFormat=" >-.2f"
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legend: "日付",
            legendOffset: 36,
            legendPosition: "middle",
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "スコア",
            legendOffset: -40,
            legendPosition: "middle",
          }}
          colors={{ scheme: "nivo" }}
          pointSize={6}
          pointColor={{ theme: "background" }}
          pointBorderWidth={2}
          pointBorderColor={{ from: "serieColor" }}
          pointLabelYOffset={-12}
          useMesh={true}
          legends={[
            {
              anchor: "bottom-right",
              direction: "column",
              justify: false,
              translateX: 100,
              translateY: 0,
              itemsSpacing: 0,
              itemDirection: "left-to-right",
              itemWidth: 80,
              itemHeight: 20,
              itemOpacity: 0.75,
              symbolSize: 12,
              symbolShape: "circle",
              symbolBorderColor: "rgba(0, 0, 0, .5)",
              effects: [
                {
                  on: "hover",
                  style: {
                    itemBackground: "rgba(0, 0, 0, .03)",
                    itemOpacity: 1,
                  },
                },
              ],
            },
          ]}
          tooltip={({ point }) => (
            <div className="chart-tooltip">
              <strong>{point.seriesId}</strong>
              <br />
              日付: {point.data.x}
              <br />
              スコア: {point.data.y}
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default ScoreChart;
