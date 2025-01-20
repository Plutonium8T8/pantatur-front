export const getPriorityColor = (priority) => {
    switch (priority) {
        case 'low':
            return '#88c999'; // Matte green
        case 'medium':
            return '#5b92e5'; // Matte blue
        case 'high':
            return '#f5a25d'; // Matte orange
        case 'critical':
            return '#e57373'; // Matte red
        default:
            return '#d3d3d3'; // Default gray
    }
};
