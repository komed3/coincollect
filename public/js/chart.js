class CCChart {

    colors = [ '#c5851f', '#5a78a6', '#4f8f8b', '#6f8b6a', '#b36a3e', '#7a5c6e', '#6b6f6a' ];

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
            case 'history': return this.renderHistoryChart( uuid, data, ctx );
            case 'portion': return this.renderPortionChart( uuid, data, ctx );
            case 'value': return this.renderValueChart( uuid, data, ctx );
        }
    }

    renderHistoryChart ( uuid, data, ctx ) {
        const labels = [], coins = [], omv = [], purchase = [];
        for ( const [ year, row ] of Object.entries( data ) ) {
            labels.push( year );
            coins.push( row.coins );
            omv.push( row.omv );
            purchase.push( row.purchase );
        };

        const chart = new Chart( ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [ {
                    label: I18N.label.omv,
                    data: omv,
                    borderWidth: 2,
                    borderColor: '#c5851f',
                    hoverBorderWidth: 2,
                    hoverBorderColor: '#c5851f',
                    pointRadius: 5,
                    pointBackgroundColor: '#fff',
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: '#fff',
                    tension: 0.1
                }, {
                    label: I18N.label.purchase,
                    data: purchase,
                    borderWidth: 2,
                    borderColor: '#777',
                    hoverBorderWidth: 2,
                    hoverBorderColor: '#777',
                    borderDash: [ 5, 5 ],
                    pointRadius: 0,
                    pointHoverRadius: 0,
                    tension: 0.1
                }, {
                    label: I18N.label.coins,
                    type: 'bar',
                    yAxisID: 'c',
                    data: coins,
                    backgroundColor: '#ccc3',
                    barThickness: 24
                } ]
            },
            options: {
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: ( item ) => item.dataset.label + ': ' + (
                                item.datasetIndex === 2 ? item.raw : Intl.NumberFormat( LANG, {
                                    style: 'currency', currency: CURRENCY
                                } ).format( item.raw )
                            )
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            drawOnChartArea: false,
                            tickLength: 6
                        },
                        ticks: { autoSkip: true }
                    },
                    y: {
                        beginAtZero: false,
                        border: { dash: [ 5, 5 ] },
                        position: 'left',
                        ticks: {
                            padding: 6,
                            maxTicksLimit: 4,
                            align: 'center',
                            callback: ( value ) => Intl.NumberFormat( LANG, {
                                style: 'currency', currency: CURRENCY
                            } ).format( value )
                        }
                    },
                    c: {
                        display: false,
                        min: 0,
                        max: ( coins.at( -1 ) ?? 0 ) * 3
                    }
                }
            }
        } );

        this.charts.set( uuid, chart );
        return chart;
    }

    renderPortionChart ( uuid, data, ctx ) {
        const labels = [], coins = [], omv = [], purchase = [], colors = [];
        let i = 0;

        for ( const [ key, item ] of Object.entries( data.data ) ) {
            labels.push( data.key ? I18N[ data.key ][ key ] : key );
            coins.push( item.coins );
            omv.push( item.omv );
            purchase.push( item.purchase );
            colors.push( this.colors[ i % this.colors.length ] );
            i++;
        };

        const chart = new Chart( ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [ {
                    label: I18N.label.coins,
                    data: coins,
                    backgroundColor: colors,
                    hoverBackgroundColor: colors,
                    borderColor: '#fff',
                    hoverBorderColor: '#fff',
                    borderWidth: 2
                }, {
                    label: I18N.label.omv,
                    data: omv,
                    backgroundColor: colors,
                    hoverBackgroundColor: colors,
                    borderColor: '#fff',
                    hoverBorderColor: '#fff',
                    borderWidth: 2
                }, {
                    label: I18N.label.purchase,
                    data: purchase,
                    backgroundColor: colors,
                    hoverBackgroundColor: colors,
                    borderColor: '#fff',
                    hoverBorderColor: '#fff',
                    borderWidth: 2
                } ]
            },
            options: {
                cutout: '50%',
                plugins: {
                    tooltip: {
                        titleColor: '#000',
                        titleFont: { size: 15 },
                        bodyColor: '#777',
                        bodyFont: { size: 13 },
                        callbacks: {
                            label: ( item ) => item.dataset.label + ': ' + (
                                item.datasetIndex === 0 ? item.raw : Intl.NumberFormat( LANG, {
                                    style: 'currency', currency: CURRENCY
                                } ).format( item.raw )
                            )
                        }
                    }
                }
            }
        } );

        this.charts.set( uuid, chart );
        return chart;
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
                    pointHoverBackgroundColor: '#fff',
                    tension: 0.1
                }, {
                    data: th,
                    borderWidth: 0,
                    hoverBorderWidth: 0,
                    fill: true,
                    backgroundColor: '#c5851f25',
                    pointRadius: 0,
                    pointHoverRadius: 0
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
                        },
                        ticks: { autoSkip: true }
                    },
                    y: {
                        beginAtZero: true,
                        border: { dash: [ 5, 5 ] },
                        position: 'left',
                        ticks: {
                            padding: 6,
                            maxTicksLimit: 4,
                            align: 'center',
                            callback: ( value ) => Intl.NumberFormat( LANG, {
                                style: 'currency', currency: CURRENCY
                            } ).format( value )
                        }
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
