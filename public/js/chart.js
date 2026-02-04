class CCChart {

    charts = new Map();

    constructor () {
        Chart.defaults.responsive = true;
        Chart.defaults.maintainAspectRatio = false;
        Chart.defaults.interaction.intersect = false;
        Chart.defaults.interaction.mode = 'index';
        Chart.defaults.offset = true;
        Chart.defaults.clip = false;
        Chart.defaults.layout.padding = 0;

        Chart.defaults.font.family = '"Inter", sans-serif';
        Chart.defaults.font.size = 12;
        Chart.defaults.font.weight = 400;

        Chart.defaults.backgroundColor = '#fff';
        Chart.defaults.borderColor = '#e5e5e5';
        Chart.defaults.color = '#000';

        Chart.defaults.animations = {
            x: { duration: 0 },
            y: { duration: 150, easing: 'easeOutBack' }
        };

        Chart.defaults.transitions = {
            active: { animation: { duration: 0 } }
        };

        Chart.defaults.plugins.legend.display = false;
        Chart.defaults.plugins.legend.position = 'bottom';
        Chart.defaults.plugins.legend.align = 'end';
        Chart.defaults.plugins.legend.labels.padding = 20;
        Chart.defaults.plugins.legend.labels.textAlign = 'left';
        Chart.defaults.plugins.legend.labels.boxWidth = 16;
        Chart.defaults.plugins.legend.labels.boxHeight = 16;

        Chart.defaults.plugins.tooltip.titleColor = '#777';
        Chart.defaults.plugins.tooltip.bodyColor = '#000';
        Chart.defaults.plugins.tooltip.footerColor = '#777';
        Chart.defaults.plugins.tooltip.backgroundColor = '#fff';
        Chart.defaults.plugins.tooltip.borderColor = '#e5e5e5';
        Chart.defaults.plugins.tooltip.borderWidth = 1;
        Chart.defaults.plugins.tooltip.cornerRadius = 0;
        Chart.defaults.plugins.tooltip.caretSize = 10;
        Chart.defaults.plugins.tooltip.caretPadding = 10;
        Chart.defaults.plugins.tooltip.displayColors = false;
        Chart.defaults.plugins.tooltip.titleMarginBottom = 4;
        Chart.defaults.plugins.tooltip.footerMarginTop = 0;
        Chart.defaults.plugins.tooltip.footerSpacing = 0;

        Chart.defaults.plugins.tooltip.titleFont = {
            family: Chart.defaults.font.family,
            size: 11,
            weight: 500
        };

        Chart.defaults.plugins.tooltip.bodyFont = {
            family: Chart.defaults.font.family,
            size: 16,
            weight: 500
        };

        Chart.defaults.plugins.tooltip.footerFont = {
            family: Chart.defaults.font.family,
            size: Chart.defaults.font.size,
            weight: Chart.defaults.font.weight
        };

        Chart.defaults.plugins.tooltip.padding = {
            top: 10, left: 14, right: 20, bottom: 8
        };

        Chart.defaults.plugins.tooltip.animation = {
            duration: 150,
            easing: 'easeOutBack'
        };
    }

    renderChart ( type, uuid, data, ctx ) {
        switch ( type ) {
            case 'value': return this.renderValueChart( uuid, data, ctx );
        }
    }

    renderValueChart ( uuid, data, ctx ) {
        const omv = ( data.omv ?? [] ).map( o => ( { x: o.date, y: o.value } ) );
        if ( data.purchase?.date ) omv.push( { x: data.purchase.date, y: data.purchase.value } );
        const th = data.purchase ? omv.map( o => ( { x: o.x, y: data.purchase.value } ) ) : [];

        const chart = new Chart( ctx, {
            type: 'line',
            data: {
                datasets: [ {
                    data: omv,
                    borderWidth: 2,
                    borderColor: '#c5851f',
                    hoverBorderWidth: 2,
                    hoverBorderColor: '#c5851f',
                    pointRadius: 5,
                    pointBackgroundColor: '#fff',
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: '#fff'
                }, {
                    data: th,
                    borderWidth: 0,
                    hoverBorderWidth: 0,
                    fill: true,
                    backgroundColor: '#c5321f33',
                    pointRadius: 0,
                    pointHoverRadius: 0
                } ]
            },
            options: {
                plugins: {
                    tooltip: {
                        filter ( item ) {
                            return item.datasetIndex !== 1;
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'year',
                            tooltipFormat: 'PP'
                        },
                        grid: {
                            drawOnChartArea: false,
                            tickLength: 6
                        }
                    },
                    y: {
                        beginAtZero: true,
                        border: { dash: [ 5, 5 ] },
                        ticks: { maxTicksLimit: 4 }
                    }
                }
            }
        } );

        this.charts.set( uuid, chart );
        return chart;
    }

}

document.addEventListener( 'DOMContentLoaded', function () {
    const ccChart = new CCChart();

    document.querySelectorAll( '.cc-mixin--chart[uuid]' ).forEach( ( container ) => {
        const type = container.getAttribute( 'type' );
        const uuid = container.getAttribute( 'uuid' );
        const data = JSON.parse( container.querySelector( 'script' ).textContent );
        const ctx = container.querySelector( 'canvas' );

        ccChart.renderChart( type, uuid, data, ctx );
    } );
} );
