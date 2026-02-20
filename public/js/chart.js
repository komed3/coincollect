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
            case 'coin': this.renderCoinChart( uuid, data, ctx ); break;
            case 'doughnut': this.renderDoughnutChart( uuid, data, ctx ); break;
            case 'growth': this.renderGrowthChart( uuid, data, ctx ); break;
            case 'value': this.renderValueChart( uuid, data, ctx ); break;
            case 'variance': this.renderVarianceChart( uuid, data, ctx ); break;
        }
    }

    renderCoinChart ( uuid, data, ctx ) {
        const avg = ( data.value ?? [] ).map( o => ( { x: o.date, y: o.avg } ) );
        const min = ( data.value ?? [] ).map( o => ( { x: o.date, y: o.min } ) );
        const max = ( data.value ?? [] ).map( o => ( { x: o.date, y: o.max } ) );

        if ( avg.length < 2 ) {
            avg.unshift( { x: new Date().toISOString(), y: avg[ 0 ].y } );
            min.unshift( { x: new Date().toISOString(), y: min[ 0 ].y } );
            max.unshift( { x: new Date().toISOString(), y: max[ 0 ].y } );
        }

        const th = data.acquisition?.price ? avg.map( o => ( {
            x: o.x, y: data.acquisition.price
        } ) ) : [];

        const chart = new Chart( ctx, {
            type: 'line',
            data: {
                datasets: [ {
                    data: avg,
                    borderWidth: 2,
                    borderColor: '#06c',
                    hoverBorderWidth: 2,
                    hoverBorderColor: '#06c',
                    pointRadius: 5,
                    pointBackgroundColor: '#fff',
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: '#fff',
                    tension: 0.05
                }, {
                    data: min,
                    borderWidth: 0,
                    hoverBorderWidth: 0,
                    pointRadius: 0,
                    pointHoverRadius: 0,
                    tension: 0.2,
                    fill: false
                }, {
                    data: max,
                    borderWidth: 0,
                    backgroundColor: '#06c2',
                    hoverBorderWidth: 0,
                    pointRadius: 0,
                    pointHoverRadius: 0,
                    tension: 0.2,
                    fill: 1
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
                        filter: ( item ) => item.datasetIndex === 0
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

    renderDoughnutChart ( uuid, data, ctx ) {
        const chart = new Chart( ctx, {} );

        this.charts.set( uuid, chart );
        return chart;
    }

    renderGrowthChart ( uuid, data, ctx ) {
        const labels = [], change = [], growth = [], colors = [];
        let acq = 0;

        for ( const [ y, o ] of Object.entries( data ) ) {
            labels.push( y );
            change.push( Math.abs( o.acquisition - acq ) );
            growth.push( Math.abs( o.growth ) );
            colors.push( this.colors[ o.growth < 0 ? 8 : 2 ] );
            acq = o.acquisition;
        }

        const chart = new Chart( ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [ {
                    label: I18N.label.growth.change,
                    data: change,
                    backgroundColor: '#6665'
                }, {
                    label: I18N.label.growth.growth,
                    data: growth,
                    backgroundColor: colors,
                    hoverBackgroundColor: colors
                } ]
            },
            options: {
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: ( item ) => item.dataset.label + ': ' + Intl.NumberFormat( LANG, {
                                style: 'currency', currency: CURRENCY
                            } ).format( item.raw )
                        }
                    }
                },
                scales: {
                    x: {
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
                        type: 'logarithmic',
                        beginAtZero: true,
                        display: false
                    }
                }
            }
        } );

        this.charts.set( uuid, chart );
        return chart;
    }

    renderValueChart ( uuid, data, ctx ) {
        const labels = [], avg = [], min = [], max = [], acq = [];

        for ( const [ y, o ] of Object.entries( data ) ) {
            labels.push( y );
            avg.push( o.value.avg );
            min.push( o.value.min );
            max.push( o.value.max );
            acq.push( o.acquisition );
        }

        const chart = new Chart( ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [ {
                    label: I18N.label.value.avg,
                    data: avg,
                    borderWidth: 2,
                    borderColor: '#06c',
                    hoverBorderWidth: 2,
                    hoverBorderColor: '#06c',
                    pointRadius: 5,
                    pointBackgroundColor: '#fff',
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: '#fff',
                    tension: 0.05
                }, {
                    label: I18N.label.value.acq,
                    data: acq,
                    borderWidth: 2,
                    borderColor: '#6669',
                    hoverBorderWidth: 2,
                    hoverBorderColor: '#6669',
                    pointRadius: 0,
                    pointHoverRadius: 0,
                    tension: 0.05,
                    fill: true,
                    backgroundColor: this.pattern( '#6669' )
                }, {
                    label: I18N.label.value.min,
                    data: min,
                    borderWidth: 0,
                    hoverBorderWidth: 0,
                    pointRadius: 0,
                    pointHoverRadius: 0,
                    tension: 0.2,
                    fill: false
                }, {
                    label: I18N.label.value.max,
                    data: max,
                    borderWidth: 0,
                    backgroundColor: '#06c2',
                    hoverBorderWidth: 0,
                    pointRadius: 0,
                    pointHoverRadius: 0,
                    tension: 0.2,
                    fill: 2
                } ]
            },
            options: {
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: ( item ) => item.dataset.label + ': ' + (
                                Intl.NumberFormat( LANG, {
                                    style: 'currency', currency: CURRENCY
                                } ).format( item.raw )
                            )
                        },
                        filter: ( item ) => item.datasetIndex < 2
                    }
                },
                scales: {
                    x: {
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

    renderVarianceChart ( uuid, data, ctx ) {
        const labels = [], variance = [];

        for ( const [ y, o ] of Object.entries( data ) ) {
            labels.push( y );
            variance.push( o.variance );
        }

        const chart = new Chart( ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [ {
                    label: I18N.label.variance.label,
                    data: variance,
                    borderWidth: 2,
                    borderColor: '#c5851f',
                    hoverBorderWidth: 2,
                    hoverBorderColor: '#c5851f',
                    pointRadius: 0,
                    pointHoverRadius: 0,
                    tension: 0.05,
                    fill: true,
                    backgroundColor: this.pattern( '#c5851f99' )
                } ]
            },
            options: {
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: ( item ) => item.dataset.label + ': ' + Intl.NumberFormat( LANG, {
                                style: 'percent', minimumFractionDigits: 1
                            } ).format( item.raw / 100 )
                        }
                    }
                },
                scales: {
                    x: {
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
