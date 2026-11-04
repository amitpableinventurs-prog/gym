import { useState } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { formatMoney } from "../../utils/format";
import { AdminCard } from "./common";

const PLOT_HEIGHT = 180;
const TICKS = 4;

/** Rounds up to 1, 2, 2.5 or 5 x 10^n so the axis lands on clean numbers. */
const niceCeiling = (value: number) => {
  if (value <= 0) return 1000;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((candidate) => candidate * magnitude >= value) ?? 10;
  return step * magnitude;
};

const monthLabel = (month: string, style: "short" | "long") => {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(year, monthNumber - 1, 1).toLocaleDateString(undefined, {
    month: style,
    ...(style === "long" ? { year: "numeric" } : {}),
  });
};

const RevenueChart: React.FC<{ data: Array<{ month: string; total: number }> }> = ({ data }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [showTable, setShowTable] = useState(false);

  const barColor = theme.palette.mode === "dark" ? "#4CA374" : theme.palette.primary.main;
  const ceiling = niceCeiling(Math.max(...data.map((item) => item.total)));
  const ticks = Array.from({ length: TICKS + 1 }, (_, index) => (ceiling / TICKS) * index);

  return (
    <AdminCard
      title={t("Revenue, last 6 months")}
      action={
        <Button size="small" onClick={() => setShowTable((value) => !value)} sx={{ alignSelf: "flex-start" }}>
          {showTable ? t("Show chart") : t("Show table")}
        </Button>
      }
    >
      {showTable ? (
        <Table size="small" aria-label={t("Revenue, last 6 months")}>
          <TableHead>
            <TableRow>
              <TableCell>{t("Month")}</TableCell>
              <TableCell align="right">{t("Revenue")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.month}>
                <TableCell>{monthLabel(item.month, "long")}</TableCell>
                <TableCell align="right">{formatMoney(item.total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Box role="img" aria-label={t("Bar chart of revenue per month. Use Show table for the values.")} sx={{ px: 1 }}>
          <Box sx={{ display: "flex", height: PLOT_HEIGHT, mt: 1 }}>
            <Box sx={{ position: "relative", width: 64, flexShrink: 0 }}>
              {ticks.map((tick) => (
                <Typography
                  key={tick}
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    position: "absolute",
                    right: 8,
                    bottom: `${(tick / ceiling) * 100}%`,
                    transform: "translateY(50%)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {new Intl.NumberFormat("en-IN", { notation: "compact" }).format(tick)}
                </Typography>
              ))}
            </Box>
            <Box sx={{ position: "relative", flex: 1, display: "flex", minWidth: 0 }}>
              {ticks.map((tick) => (
                <Box
                  key={tick}
                  sx={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: `${(tick / ceiling) * 100}%`,
                    borderTop: "1px solid",
                    borderColor: "divider",
                  }}
                />
              ))}
              {data.map((item) => (
                <Tooltip
                  key={item.month}
                  arrow
                  title={`${monthLabel(item.month, "long")}: ${formatMoney(item.total)}`}
                >
                  <Box
                    tabIndex={0}
                    sx={{
                      position: "relative",
                      flex: 1,
                      height: "100%",
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "center",
                    }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        maxWidth: 24,
                        height: `${(item.total / ceiling) * 100}%`,
                        bgcolor: barColor,
                        borderRadius: "4px 4px 0 0",
                      }}
                    />
                  </Box>
                </Tooltip>
              ))}
            </Box>
          </Box>
          <Box sx={{ display: "flex", pl: "64px", mt: 0.75 }}>
            {data.map((item) => (
              <Typography key={item.month} variant="caption" color="text.secondary" sx={{ flex: 1, textAlign: "center" }}>
                {monthLabel(item.month, "short")}
              </Typography>
            ))}
          </Box>
        </Box>
      )}
    </AdminCard>
  );
};

export default RevenueChart;
