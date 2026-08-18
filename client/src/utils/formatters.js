// Formatter Utilities
// Helper functions for formatting and display

export const formatters = {
  formatTemperature: (celsius) => `${celsius.toFixed(1)}°C`,
  formatVibration: (mmps) => `${mmps.toFixed(2)} mm/s`,
  formatPressure: (bar) => `${bar.toFixed(2)} bar`,
  formatRPM: (rpm) => `${rpm.toLocaleString()} RPM`,
  formatPower: (watts) => `${watts.toFixed(0)}W`,
  formatUtilization: (percent) => `${percent.toFixed(0)}%`,
  formatTimestamp: (date) => new Date(date).toLocaleString(),
};

export default formatters;
