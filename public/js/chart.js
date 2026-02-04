document.addEventListener( 'DOMContentLoaded', function () {
    Chart.defaults.responsive = true;
    Chart.defaults.maintainAspectRatio = false;
    Chart.defaults.offset = true;
    Chart.defaults.clip = false;
    Chart.defaults.layout.padding = 6;

    Chart.defaults.font.family = '"Inter", sans-serif';
    Chart.defaults.font.size = 15;
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

    Chart.defaults.plugins.tooltip.titleColor = '#000';
    Chart.defaults.plugins.tooltip.bodyColor = '#000';
    Chart.defaults.plugins.tooltip.footerColor = '#000';
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
        size: Chart.defaults.font.size,
        weight: 700
    };

    Chart.defaults.plugins.tooltip.bodyFont = {
        size: 26,
        weight: 700
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
} );
