export const getPriorityColor = (priority) => {
  switch (priority) {
    case "joasă":
      return "#88c999"; // Matte green
    case "medie":
      return "#5b92e5"; // Matte blue
    case "înaltă":
      return "#f5a25d"; // Matte orange
    case "critică":
      return "#e57373"; // Matte red
    default:
      return "#d3d3d3"; // Default gray
  }
};
