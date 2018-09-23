function drawCharts(options) {

    let displayLegend = options && options.displayLegend === true ? true : false;

    function selectColour(colourNum, totalColours) { // Original function from https://stackoverflow.com/questions/10014271/generate-random-color-distinguishable-to-humans/#20129594
        if (totalColours < 1) totalColours = 1; // defaults to one color - avoid divide by zero
        return "hsl(" + Math.floor((colourNum * (360 / totalColours) % 360)) + ", 100%, 65%)";
    }

    let canvasses = document.getElementsByTagName('canvas');
    for (var i = 0; i < canvasses.length; i++) {
        let ctx = canvasses[i];

        let chartColours = [];
        for (var j = 0, numOptions = polls[i].options.length; j < numOptions; j++) {
            colour = selectColour(j, numOptions);
            chartColours.push(colour);
        }

        let chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: polls[i].options,
                datasets: [{
                    data: polls[i].votes,
                    backgroundColor: chartColours,
                    borderColor: 'white',
                    borderWidth: 4
                }]
            },
            options: {
                legend: {
                    display: displayLegend
                }
            }
        });
    }

}
