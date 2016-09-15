"use strict";
(function() {
    var pointRadius = 5;
    
    var canvas = document.getElementById('c');
    var context = canvas.getContext('2d');
    var draw_points = document.getElementById('draw_points');
    var high_ch_points = document.getElementById('high_ch_points');
    var draw_ch_edges = document.getElementById('draw_ch_edges');
    var checkboxes = [
        draw_points, high_ch_points, draw_ch_edges
    ];
    var centers = [];

    function clear() {
        centers = [];
        draw();
    }

    document.getElementById('clear').addEventListener('click', function(evt) {
        clear();
    });

    function fillLittleCircle(context, x, y, color) {
        context.beginPath();
        context.arc(x, y, pointRadius, 0, 2 * Math.PI, false);
        context.fillStyle = color;
        context.fill();
    }

    function draw() {
        (function() {
            console.log('clearing');
            context.clearRect(0, 0, canvas.width, canvas.height);
        })();
        var chPoints = Points.convexHull(centers);
        console.log('drawing');
        for(var i = 0; i < centers.length; ++i) {
            var center = centers[i];
            if(draw_points.checked) {
                console.log('drawing centers');
                fillLittleCircle(context, center.x, center.y, 'green');
            }
        }
        for(var i = 1; i < chPoints.length; ++i) {
            var pt1 = chPoints[i-1];
            var pt2 = chPoints[i];
            if(high_ch_points.checked) {
                if(i == 2) {
                    fillLittleCircle(context, pt1.x, pt1.y, 'blue');
                }
                fillLittleCircle(context, pt2.x, pt2.y, 'blue');
            }

            if(draw_ch_edges.checked) {
                context.beginPath();
                context.moveTo(pt1.x, pt1.y);
                context.lineTo(pt2.x, pt2.y);
                context.lineWidth = 1;
                context.stroke();
            }
        }
    }
    
    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    function sortCenters() {
        centers.sort(function(a,b) {
            return b.x - a.x;
        });
    }

    function sqrDistance(a, b) {
        return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2);
    }

    canvas.addEventListener('click', function(evt) {
        var p = getMousePos(canvas, evt);
        console.log('click at (' + p.x + ',' + p.y + ')');
        // if we have clicked on a circle center
        var deleted = false;
        var fudgeFactor = 10;
        var threshold = Math.pow(pointRadius, 2) + fudgeFactor;
        centers.forEach(function(candidate) {
            console.log('Candidate: (' + candidate.x + ',' + candidate.y + ')');
            var sqrDist = sqrDistance(p, candidate);
            console.log('Distance: ' + sqrDist);
            console.log('Threshold: ' + threshold);
            if(threshold > sqrDist) {
                console.log('deleting');
                var i = centers.indexOf(candidate);
                centers.splice(i, 1);
                deleted = true;
            }
        });
        if(!deleted) {
            centers.push(p);
            sortCenters();
        }
        draw();
    });

    //////////////////////////////////////////////////////////////////////

    checkboxes.forEach(function(cbox) {
        cbox.addEventListener('click', function(evt) {
            console.log('Clicked checkbox');
            draw();
        });
    });
})();
