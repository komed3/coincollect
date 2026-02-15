class CCChart {

    colors = [
        '#c5851f', '#5a78a6', '#4f8f8b', '#6f8b6a',
        '#b36a3e', '#7a5c6e', '#6b6f6a', '#a69d7a',
        '#d9534f', '#5bc0de', '#f0ad4e', '#777777'
    ];

    constructor () {
        this.charts = new Map();

        Chart.defaults.locale = LANG;
        Chart.defaults.responsive = true;
        Chart.defaults.maintainAspectRatio = false;
        Chart.defaults.interaction.intersect = false;
        Chart.defaults.interaction.mode = 'index';
        Chart.defaults.offset = true;
        Chart.defaults.clip = false;
        Chart.defaults.layout.padding = 0;

        Chart.defaults.font.family = '"Inter", sans-serif';
        Chart.defaults.font.size = 11;
        Chart.defaults.font.weight = 300;

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
        Chart.defaults.plugins.legend.labels.padding = 14;
        Chart.defaults.plugins.legend.labels.textAlign = 'left';
        Chart.defaults.plugins.legend.labels.boxWidth = 14;
        Chart.defaults.plugins.legend.labels.boxHeight = 14;

        Chart.defaults.plugins.tooltip.titleColor = '#666';
        Chart.defaults.plugins.tooltip.bodyColor = '#000';
        Chart.defaults.plugins.tooltip.footerColor = '#666';
        Chart.defaults.plugins.tooltip.backgroundColor = '#fff';
        Chart.defaults.plugins.tooltip.borderColor = '#e5e5e5';
        Chart.defaults.plugins.tooltip.borderWidth = 1;
        Chart.defaults.plugins.tooltip.cornerRadius = 0;
        Chart.defaults.plugins.tooltip.caretSize = 8;
        Chart.defaults.plugins.tooltip.caretPadding = 8;
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

    pattern ( color ) {
        let shape = document.createElement( 'canvas' );
        shape.width = 10;
        shape.height = 10;

        let ctx = shape.getContext( '2d' );
        ctx.strokeStyle = color;

        ctx.beginPath();
        ctx.moveTo( 2, 0 );
        ctx.lineTo( 10, 8 );
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo( 0, 8 );
        ctx.lineTo( 2, 10 );
        ctx.stroke();

        return ctx.createPattern( shape, 'repeat' );
    }

    renderChart ( type, uuid, data, ctx ) {
        switch ( type ) {
            case 'value': this.renderValueChart( uuid, data, ctx ); break;
        }
    }

    renderValueChart ( uuid, data, ctx ) {
        const value = ( data.value ?? [] ).map( o => ( { x: o.date, y: o.price } ) );
        value.unshift( { x: new Date().toISOString(), y: value[ 0 ].y } );

        const th = data.acquisition?.price ? value.map( o => ( {
            x: o.x, y: data.acquisition.price
        } ) ) : [];

        const chart = new Chart( ctx, {
            type: 'line',
            data: {
                datasets: [ {
                    data: value,
                    borderWidth: 2,
                    borderColor: '#0066cc',
                    hoverBorderWidth: 2,
                    hoverBorderColor: '#0066cc',
                    pointRadius: 5,
                    pointBackgroundColor: '#fff',
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: '#fff',
                    tension: 0.1
                }, {
                    data: th,
                    borderWidth: 2,
                    borderColor: '#6669',
                    hoverBorderWidth: 2,
                    hoverBorderColor: '#6669',
                    pointRadius: 0,
                    pointHoverRadius: 0,
                    fill: true,
                    backgroundColor: this.pattern( '#6669' )
                } ]
            },
            options: {
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: ( item ) => Intl.NumberFormat( LANG, {
                                style: 'currency', currency: CURRENCY
                            } ).format( item.raw.y )
                        },
                        filter: ( item ) => item.datasetIndex !== 1
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
                        },
                        ticks: {
                            autoSkip: true,
                            maxTicksLimit: 5
                        }
                    },
                    y: {
                        beginAtZero: true,
                        display: false
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
